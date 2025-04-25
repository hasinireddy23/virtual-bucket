import datetime
import os

def generate_versioned_filename(user_email: str, original_filename: str) -> str:
    """Generate a unique filename using timestamp to avoid collisions."""
    name, ext = os.path.splitext(original_filename)
    timestamp = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    return f"{user_email}_{name}_{timestamp}{ext}"


def current_timestamp() -> str:
    """Returns the current UTC timestamp as an ISO-formatted string."""
    return datetime.datetime.utcnow().isoformat()