import redis
import os

REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)


def set_status(visitor_id: str, status: str, ttl: int = 86400):
    """Set visitor status in Redis with 24hr TTL."""
    r.setex(f"visitor:{visitor_id}:status", ttl, status)


def get_status(visitor_id: str) -> str | None:
    """Get visitor status from Redis."""
    return r.get(f"visitor:{visitor_id}:status")


def ping():
    try:
        return r.ping()
    except Exception:
        return False
