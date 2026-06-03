from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.db import get_db
from app.core.security import create_token, hash_password, verify_password

router = APIRouter()


@router.post("/register", response_model=schemas.TokenOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.phone == user.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone already registered")

    new_user = models.User(
        name=user.name,
        phone=user.phone,
        flat=user.flat,
        role=user.role,
        password_hash=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"access_token": create_token(new_user.id)}


@router.post("/login", response_model=schemas.TokenOut)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.phone == user.phone).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid phone or password")

    return {"access_token": create_token(db_user.id)}
