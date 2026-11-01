import struct
from io import BytesIO
from typing import Dict, Any, Tuple
from ..core.errors import APIError

def validate_audio_wav(content: bytes, max_mb: int = 50) -> Dict[str, Any]:
    """
    Validates binary WAV content strictly according to RIFF/WAVE specifications.
    Rejects files < 3s or > 300s, or oversized files.
    """
    if len(content) > max_mb * 1024 * 1024:
        raise APIError(
            code="FILE_TOO_LARGE",
            message=f"Audio file exceeds maximum allowed limit of {max_mb} MB.",
            status_code=413,
        )

    if len(content) < 44:
        raise APIError(
            code="INVALID_AUDIO_FORMAT",
            message="Audio file is corrupted or shorter than standard WAV 44-byte header.",
            status_code=400,
        )

    riff = content[0:4]
    if riff != b"RIFF":
        raise APIError(
            code="INVALID_AUDIO_FORMAT",
            message=f"Invalid RIFF header: expected 'RIFF', got {riff.decode('latin1', errors='replace')}. Only WAV files supported.",
            status_code=400,
        )

    wave = content[8:12]
    if wave != b"WAVE":
        raise APIError(
            code="INVALID_AUDIO_FORMAT",
            message="Invalid WAVE format identifier in header.",
            status_code=400,
        )

    # Search for 'fmt ' chunk
    offset = 12
    fmt_found = False
    format_tag = 1
    channels = 1
    sample_rate = 16000
    bits_per_sample = 16

    while offset < len(content) - 8:
        chunk_id = content[offset:offset+4]
        chunk_size = struct.unpack("<I", content[offset+4:offset+8])[0]
        if chunk_id == b"fmt ":
            fmt_found = True
            format_tag = struct.unpack("<H", content[offset+8:offset+10])[0]
            channels = struct.unpack("<H", content[offset+10:offset+12])[0]
            sample_rate = struct.unpack("<I", content[offset+12:offset+16])[0]
            bits_per_sample = struct.unpack("<H", content[offset+22:offset+24])[0]
            break
        offset += 8 + chunk_size

    if not fmt_found:
        raise APIError(
            code="INVALID_AUDIO_FORMAT",
            message="Missing 'fmt ' chunk in WAV file header.",
            status_code=400,
        )

    if format_tag not in (1, 3):
        raise APIError(
            code="INVALID_AUDIO_FORMAT",
            message=f"Unsupported WAV compression tag {format_tag}. Only linear PCM is supported.",
            status_code=400,
        )

    bytes_per_sec = (sample_rate * channels * bits_per_sample) // 8
    duration_seconds = len(content) / bytes_per_sec if bytes_per_sec > 0 else 0

    if duration_seconds < 3.0:
        raise APIError(
            code="DURATION_OUT_OF_RANGE",
            message=f"Audio duration ({duration_seconds:.1f}s) is below minimum required 3 seconds.",
            status_code=400,
        )

    if duration_seconds > 300.0:
        raise APIError(
            code="DURATION_OUT_OF_RANGE",
            message=f"Audio duration ({duration_seconds:.1f}s) exceeds maximum allowed 300 seconds.",
            status_code=400,
        )

    return {
        "format_tag": format_tag,
        "channels": channels,
        "sample_rate": sample_rate,
        "bits_per_sample": bits_per_sample,
        "duration_seconds": duration_seconds,
        "size_bytes": len(content),
    }
