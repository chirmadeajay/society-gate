import os
import uuid

FACE_IMAGES_DIR = os.getenv("FACE_IMAGES_DIR", "/app/face_images")
os.makedirs(FACE_IMAGES_DIR, exist_ok=True)


def capture_face_from_bytes(image_bytes: bytes) -> str | None:
    try:
        filename = f"{uuid.uuid4()}.jpg"
        filepath = os.path.join(FACE_IMAGES_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(image_bytes)
        return filepath
    except Exception as e:
        print(f"[FaceSave Error] {e}")
        return None


def match_face(image_path: str) -> dict | None:
    return None
