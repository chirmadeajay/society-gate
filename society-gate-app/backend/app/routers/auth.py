from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.db import get_db
from app.core.security import create_token, hash_password, verify_password
import traceback

router = APIRouter()


@router.post("/register", response_model=schemas.TokenOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        existing = db.query(models.User).filter(models.User.phone == user.phone).first()
        if existing:
            raise HTTPException(status_code=400, detail="Phone already registered")

        pw = user.password[:72]
        new_user = models.User(
            name=user.name,
            phone=user.phone,
            flat=user.flat,
            role=user.role,
            password_hash=hash_password(pw)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"access_token": create_token(new_user.id)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login", response_model=schemas.TokenOut)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    try:
        db_user = db.query(models.User).filter(models.User.phone == user.phone).first()
        if not db_user or not verify_password(user.password[:72], db_user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid phone or password")
        return {"access_token": create_token(db_user.id)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
