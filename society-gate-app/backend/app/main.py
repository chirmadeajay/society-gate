from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from app import models, schemas
from app.db import engine, get_db
from app.core.security import create_token, verify_token
from app.routers import visitors, auth

print("Starting app - creating tables...")
try:
    models.Base.metadata.create_all(bind=engine)
    print("Tables created OK!")
except Exception as e:
    print(f"TABLE CREATION ERROR: {e}")

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


@app.get("/approve/{visitor_id}", response_class=HTMLResponse)
def approve_visitor_get(visitor_id: int, db: Session = Depends(get_db)):
    visitor = db.query(models.Visitor).filter(models.Visitor.id == visitor_id).first()
    if not visitor:
        return HTMLResponse("<h1>❌ Visitor not found</h1>")
    visitor.status = "approved"
    db.commit()
    return HTMLResponse(f"""
    <html><body style="font-family:sans-serif;text-align:center;padding:50px;background:#d1fae5">
    <h1>✅ Visitor Approved!</h1>
    <p><b>{visitor.name}</b> from flat <b>{visitor.flat}</b> has been approved.</p>
    <p>The gate is now open.</p>
    </body></html>
    """)


@app.post("/approve/{visitor_id}")
def approve_visitor_post(visitor_id: int, db: Session = Depends(get_db)):
    visitor = db.query(models.Visitor).filter(models.Visitor.id == visitor_id).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    visitor.status = "approved"
    db.commit()
    return {"message": f"Visitor {visitor_id} approved ✅"}


@app.get("/reject/{visitor_id}", response_class=HTMLResponse)
def reject_visitor_get(visitor_id: int, db: Session = Depends(get_db)):
    visitor = db.query(models.Visitor).filter(models.Visitor.id == visitor_id).first()
    if not visitor:
        return HTMLResponse("<h1>❌ Visitor not found</h1>")
    visitor.status = "rejected"
    db.commit()
    return HTMLResponse(f"""
    <html><body style="font-family:sans-serif;text-align:center;padding:50px;background:#fee2e2">
    <h1>❌ Visitor Rejected!</h1>
    <p><b>{visitor.name}</b> from flat <b>{visitor.flat}</b> has been denied entry.</p>
    </body></html>
    """)


@app.post("/reject/{visitor_id}")
def reject_visitor_post(visitor_id: int, db: Session = Depends(get_db)):
    visitor = db.query(models.Visitor).filter(models.Visitor.id == visitor_id).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    visitor.status = "rejected"
    db.commit()
    return {"message": f"Visitor {visitor_id} rejected ❌"}


@app.get("/status/{visitor_id}")
def visitor_status(visitor_id: int, db: Session = Depends(get_db)):
    visitor = db.query(models.Visitor).filter(models.Visitor.id == visitor_id).first()
    if not visitor:
        return {"visitor_id": visitor_id, "status": "not found"}
    return {"visitor_id": visitor_id, "status": visitor.status}
