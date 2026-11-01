# MOTOSYNQ AI — Android Integration Architecture Guide

> **Note on Verification**: This document provides architectural contracts and sample Kotlin implementations. The connection represents **integration guidance** and is not verified until tested end-to-end against a running physical Android device and backend container.

---

## 1. Authentication Architecture
1. The Android application uses the official **Firebase Android SDK** (`com.google.firebase:firebase-auth-ktx` / Google Sign-In) or transmits user identification headers (`X-User-Id` or `Authorization: Bearer <firebaseIdToken>`).
2. Authentication tokens (ID tokens and refresh tokens) must be stored in Android hardware-backed encrypted storage:
   - `androidx.security.crypto.EncryptedSharedPreferences`
   - Android Keystore System
3. All requests to the MOTOSYNQ API must transmit `Authorization: Bearer <firebaseIdToken>` or `X-User-Id` over TLS/HTTPS. No API secrets or service keys reside in the APK.
4. The batch sync endpoint `POST /api/v1/sync/android-batch` accepts metadata, audio, and sensor files in a single atomic transmission.

---

## 2. Privacy-First Sync Toggle
Motorcycle sensor and acoustic data remain strictly on-device in app-private storage (`context.filesDir/sessions/<sessionId>/`) until the user explicitly enables cloud synchronization in Android settings (`motosynq_cloud_sync_enabled = true`).

---

## 3. Sample Retrofit & OkHttp Client (Kotlin)

```kotlin
package com.motosynq.ai.network

import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.RequestBody
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*

interface MotoSynqApiService {

    @POST("api/v1/sessions")
    suspend fun createSession(
        @Body sessionPayload: SessionCreateRequest
    ): Response<SessionResponse>

    @Multipart
    @POST("api/v1/sessions/{id}/audio")
    suspend fun uploadAudio(
        @Path("id") sessionId: String,
        @Header("X-Content-SHA256") sha256: String,
        @Header("Idempotency-Key") idempotencyKey: String,
        @Part audioFile: MultipartBody.Part
    ): Response<AudioUploadResponse>

    @Multipart
    @POST("api/v1/sessions/{id}/sensor-data")
    suspend fun uploadSensorCsv(
        @Path("id") sessionId: String,
        @Query("sensor_type") sensorType: String,
        @Part csvFile: MultipartBody.Part
    ): Response<SensorUploadResponse>

    @POST("api/v1/sessions/{id}/analyze")
    suspend fun triggerAnalysis(
        @Path("id") sessionId: String
    ): Response<AnalysisTriggerResponse>
}

data class SessionCreateRequest(
    val vehicle_id: String,
    val client_session_id: String,
    val started_at: String,
    val ended_at: String,
    val duration_seconds: Double,
    val source: String = "android",
    val recording_config: Map<String, Any>,
    val sensor_availability: Map<String, Boolean>
)
```

---

## 4. Background Sync with Android Jetpack WorkManager

```kotlin
package com.motosynq.ai.sync

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import java.security.MessageDigest

class InspectionSyncWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val sessionId = inputData.getString("SESSION_ID") ?: return Result.failure()
        val sessionDir = File(applicationContext.filesDir, "sessions/$sessionId")
        val audioFile = File(sessionDir, "audio.wav")
        val accelFile = File(sessionDir, "accelerometer.csv")

        if (!audioFile.exists()) return Result.failure()

        try {
            // 1. Compute SHA-256
            val sha256 = calculateSha256(audioFile)

            // 2. Prepare Multipart Body
            val requestFile = audioFile.asRequestBody("audio/wav".toMediaTypeOrNull())
            val body = MultipartBody.Part.createFormData("file", audioFile.name, requestFile)

            // 3. Upload with Exponential Backoff
            val api = NetworkModule.apiService
            val response = api.uploadAudio(
                sessionId = sessionId,
                sha256 = sha256,
                idempotencyKey = "upload-$sessionId",
                audioFile = body
            )

            if (!response.isSuccessful) {
                if (response.code() in 500..599) return Result.retry()
                return Result.failure()
            }

            // 4. Upload Accelerometer CSV if present
            if (accelFile.exists()) {
                val csvReq = accelFile.asRequestBody("text/csv".toMediaTypeOrNull())
                val csvPart = MultipartBody.Part.createFormData("file", accelFile.name, csvReq)
                api.uploadSensorCsv(sessionId, "accelerometer", csvPart)
            }

            // 5. Trigger Screening Analysis
            api.triggerAnalysis(sessionId)

            return Result.success()
        } catch (e: Exception) {
            return Result.retry()
        }
    }

    private fun calculateSha256(file: File): String {
        val digest = MessageDigest.getInstance("SHA-256")
        file.forEachBlock { buffer, bytesRead ->
            digest.update(buffer, 0, bytesRead)
        }
        return digest.digest().joinToString("") { "%02x".format(it) }
    }
}
```
