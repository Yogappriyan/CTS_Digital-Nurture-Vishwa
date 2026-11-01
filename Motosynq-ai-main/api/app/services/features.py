import numpy as np
from scipy.signal import spectrogram
from typing import Dict, Any

PREPROCESSING_VERSION = "prep-v1.2"

def extract_audio_features(samples: np.ndarray, sample_rate: int = 16000) -> Dict[str, Any]:
    """
    Computes standard acoustic condition monitoring features using NumPy & SciPy.
    """
    if len(samples) == 0:
        return {}

    # Normalize float
    if samples.dtype != np.float32 and samples.dtype != np.float64:
        samples = samples.astype(np.float32) / 32768.0

    # 1. RMS Energy
    rms = float(np.sqrt(np.mean(samples ** 2)))

    # 2. Zero Crossing Rate
    signs = np.sign(samples)
    zcr = float(np.mean(np.abs(np.diff(signs)) > 0))

    # 3. FFT Magnitude Spectrum
    n_fft = min(2048, len(samples))
    fft_vals = np.abs(np.fft.rfft(samples[:n_fft]))
    freqs = np.fft.rfftfreq(n_fft, d=1.0 / sample_rate)

    sum_fft = np.sum(fft_vals)
    if sum_fft > 0:
        # Spectral Centroid
        centroid = float(np.sum(freqs * fft_vals) / sum_fft)
        # Spectral Bandwidth
        bandwidth = float(np.sqrt(np.sum(((freqs - centroid) ** 2) * fft_vals) / sum_fft))
        # Spectral Roll-off (85% energy)
        cumulative = np.cumsum(fft_vals)
        threshold = 0.85 * sum_fft
        rolloff_idx = np.searchsorted(cumulative, threshold)
        rolloff = float(freqs[min(rolloff_idx, len(freqs) - 1)])
    else:
        centroid = 0.0
        bandwidth = 0.0
        rolloff = 0.0

    return {
        "rms_energy": round(rms, 4),
        "spectral_centroid": round(centroid, 1),
        "spectral_bandwidth": round(bandwidth, 1),
        "spectral_rolloff": round(rolloff, 1),
        "zero_crossing_rate": round(zcr, 4),
        "preprocessing_version": PREPROCESSING_VERSION,
    }

def extract_sensor_features(data_xyz: np.ndarray) -> Dict[str, Any]:
    """
    Computes statistical inertial metrics from 3D acceleration or angular rate.
    """
    if len(data_xyz) == 0:
        return {}

    mean_xyz = np.mean(data_xyz, axis=0).tolist()
    std_xyz = np.std(data_xyz, axis=0).tolist()
    magnitude = np.sqrt(np.sum(data_xyz ** 2, axis=1))

    return {
        "mean_xyz": [round(float(v), 3) for v in mean_xyz],
        "std_xyz": [round(float(v), 3) for v in std_xyz],
        "rms_acceleration": round(float(np.sqrt(np.mean(data_xyz ** 2))), 3),
        "magnitude_mean": round(float(np.mean(magnitude)), 3),
        "magnitude_max": round(float(np.max(magnitude)), 3),
        "axis_variability": round(float(np.std(std_xyz)), 3),
        "preprocessing_version": PREPROCESSING_VERSION,
    }
