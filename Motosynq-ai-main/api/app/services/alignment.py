import numpy as np
from typing import Dict, Any, Tuple

def align_and_resample_sensors(
    sensor_times: np.ndarray,
    sensor_values: np.ndarray,
    target_rate_hz: float = 50.0,
    target_duration: float = 30.0,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Normalizes timestamps to starting point 0, handles gaps through linear interpolation,
    and resamples to uniform grid matching audio timeline.
    """
    if len(sensor_times) == 0:
        uniform_times = np.linspace(0, target_duration, int(target_rate_hz * target_duration))
        return uniform_times, np.zeros((len(uniform_times), 3))

    t_norm = sensor_times - sensor_times[0]
    if t_norm[-1] > 1e6:
        # nanosecond or microsecond conversion
        t_norm = t_norm / 1e9 if t_norm[-1] > 1e11 else t_norm / 1000.0

    duration = max(target_duration, float(t_norm[-1]))
    num_samples = int(duration * target_rate_hz)
    uniform_times = np.linspace(0, duration, num_samples)

    resampled_values = np.zeros((num_samples, 3))
    for axis in range(3):
        resampled_values[:, axis] = np.interp(uniform_times, t_norm, sensor_values[:, axis])

    return uniform_times, resampled_values
