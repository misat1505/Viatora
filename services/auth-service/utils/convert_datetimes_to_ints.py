from datetime import datetime


def convert_datetimes_to_ints(data: dict):
    return {
        k: int(v.timestamp()) if isinstance(v, datetime) else v for k, v in data.items()
    }
