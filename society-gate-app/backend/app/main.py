from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app import models, schemas
from app.db import engine, get_db
from app.core.security import create_token, verify_token
from app.services.whatsapp import send_approval
from app.services.redis_service import set_status, get_status
from app.routers import visitors, auth

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Society Gate API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(visitors.router, prefix="/visitors", tags=["Visitors"])


@app.get("/")
def root():
    return {"message": "Society Gate API is running 🚀"}


@app.post("/approve/{visitor_id}")
def approve_visitor(visitor_id: int, db: Session = Depends(get_db)):
    visitor = db.query(models.Visitor).filter(models.Visitor.id == visitor_id).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    visitor.status = "approved"
    db.commit()
    set_status(str(visitor_id), "approved")
    return {"message": f"Visitor {visitor_id} approved ✅"}


@app.post("/reject/{visitor_id}")
def reject_visitor(visitor_id: int, db: Session = Depends(get_db)):
    visitor = db.query(models.Visitor).filter(models.Visitor.id == visitor_id).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    visitor.status = "rejected"
    db.commit()
    set_status(str(visitor_id), "rejected")
    return {"message": f"Visitor {visitor_id} rejected ❌"}


@app.get("/status/{visitor_id}")
def visitor_status(visitor_id: int):
    status = get_status(str(visitor_id))
    return {"visitor_id": visitor_id, "status": status or "pending"}
