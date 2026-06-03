import cv2
import os
import uuid

FACE_IMAGES_DIR = os.getenv("FACE_IMAGES_DIR", "/app/face_images")
os.makedirs(FACE_IMAGES_DIR, exist_ok=True)


def capture_face_from_camera() -> str | None:
    """Capture a single frame from camera and save as visitor face image."""
    try:
        cam = cv2.VideoCapture(0)
        ret, frame = cam.read()
        cam.release()

        if not ret:
            print("[FaceCapture] Failed to capture frame.")
            return None

        filename = f"{uuid.uuid4()}.jpg"
        filepath = os.path.join(FACE_IMAGES_DIR, filename)
        cv2.imwrite(filepath, frame)
        return filepath
    except Exception as e:
        print(f"[FaceCapture Error] {e}")
        return None


def capture_face_from_bytes(image_bytes: bytes) -> str | None:
    """Save uploaded image bytes as a visitor face image."""
    try:
        filename = f"{uuid.uuid4()}.jpg"
        filepath = os.path.join(FACE_IMAGES_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(image_bytes)
        return filepath
    except Exception as e:
        print(f"[FaceSave Error] {e}")
        return None


# TODO: Upgrade with face embeddings + resident DB matching
def match_face(image_path: str) -> dict | None:
    """
    Placeholder for face recognition matching.
    Future: Use DeepFace or face_recognition library to match against resident DB.
    """
    return None
