from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.db import get_db
from app.core.security import verify_token
from app.services.whatsapp import send_approval_request
from app.services.face_recognition import capture_face_from_bytes

router = APIRouter()


@router.get("/", response_model=List[schemas.VisitorOut])
def get_all_visitors(db: Session = Depends(get_db), user_id: int = Depends(verify_token)):
    return db.query(models.Visitor).order_by(models.Visitor.id.desc()).all()


@router.post("/", response_model=schemas.VisitorOut)
def add_visitor(visitor: schemas.VisitorCreate, db: Session = Depends(get_db), user_id: int = Depends(verify_token)):
    new_visitor = models.Visitor(**visitor.dict())
    db.add(new_visitor)
    db.commit()
    db.refresh(new_visitor)

    resident = db.query(models.User).filter(
        models.User.flat == visitor.flat,
        models.User.role == "resident"
    ).first()

    if resident:
        phone = resident.phone
        if not phone.startswith('+'):
            phone = '+' + phone
        send_approval_request(
            phone=phone,
            visitor_id=new_visitor.id,
            visitor_name=new_visitor.name,
            flat=new_visitor.flat
        )

    return new_visitor


@router.post("/{visitor_id}/face")
def upload_visitor_face(visitor_id: int, file: UploadFile = File(...),
    db: Session = Depends(get_db), user_id: int = Depends(verify_token)):
    visitor = db.query(models.Visitor).filter(models.Visitor.id == visitor_id).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    image_bytes = file.file.read()
    saved_path = capture_face_from_bytes(image_bytes)
    if saved_path:
        visitor.face_image_path = saved_path
        db.commit()
        return {"message": "Face image saved", "path": saved_path}
    raise HTTPException(status_code=500, detail="Failed to save face image")


@router.get("/{visitor_id}", response_model=schemas.VisitorOut)
def get_visitor(visitor_id: int, db: Session = Depends(get_db)):
    visitor = db.query(models.Visitor).filter(models.Visitor.id == visitor_id).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    return visitor


@router.delete("/clear-all")
def clear_all_visitors(db: Session = Depends(get_db)):
    deleted = db.query(models.Visitor).delete()
    db.commit()
    return {"message": f"Deleted {deleted} visitors"}
