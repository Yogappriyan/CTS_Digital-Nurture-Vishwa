import csv
from io import StringIO
from typing import Dict, Any, List
from ..core.errors import APIError

def validate_sensor_csv(content: str, max_mb: int = 20) -> Dict[str, Any]:
    """
    Validates smartphone motion sensor CSV.
    Requires: timestamp,x,y,z columns, numeric data, monotonic timestamps.
    """
    if len(content.encode('utf-8')) > max_mb * 1024 * 1024:
        raise APIError(
            code="FILE_TOO_LARGE",
            message=f"Sensor CSV file exceeds {max_mb} MB limit.",
            status_code=413,
        )

    f = StringIO(content.strip())
    reader = csv.reader(f)
    try:
        header = next(reader)
    except StopIteration:
        raise APIError(
            code="INVALID_SENSOR_CSV",
            message="CSV file is empty.",
            status_code=400,
        )

    cleaned_header = [h.strip().lower().replace('"', '') for h in header]
    required = ["timestamp", "x", "y", "z"]
    missing = [col for col in required if col not in cleaned_header]
    if missing:
        raise APIError(
            code="INVALID_SENSOR_CSV",
            message=f"Missing required CSV column(s): {', '.join(missing)}. Expected: timestamp,x,y,z",
            status_code=400,
        )

    t_idx = cleaned_header.index("timestamp")
    x_idx = cleaned_header.index("x")
    y_idx = cleaned_header.index("y")
    z_idx = cleaned_header.index("z")

    rows: List[List[float]] = []
    prev_t = float("-inf")
    is_monotonic = True

    for line_num, row in enumerate(reader, start=2):
        if not row or all(not cell.strip() for cell in row):
            continue
        try:
            t = float(row[t_idx])
            x = float(row[x_idx])
            y = float(row[y_idx])
            z = float(row[z_idx])
        except (ValueError, IndexError):
            raise APIError(
                code="INVALID_SENSOR_CSV",
                message=f"Non-numeric or corrupt value found in CSV at row {line_num}.",
                status_code=400,
            )

        if t < prev_t:
            is_monotonic = False
        prev_t = t
        rows.append([t, x, y, z])

    if len(rows) < 10:
        raise APIError(
            code="INVALID_SENSOR_CSV",
            message="CSV has fewer than 10 valid sensor samples.",
            status_code=400,
        )

    duration = (rows[-1][0] - rows[0][0])
    if duration > 1000000:
        duration = duration / 1e9 if duration > 1e11 else duration / 1000.0

    nominal_rate_hz = round(len(rows) / duration) if duration > 0 else 50

    return {
        "sample_count": len(rows),
        "duration_seconds": duration,
        "nominal_rate_hz": nominal_rate_hz,
        "is_monotonic": is_monotonic,
    }
