from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    flat = Column(String, nullable=False)
    role = Column(String, default="resident")  # resident | guard | admin
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Visitor(Base):
    __tablename__ = "visitors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    flat = Column(String, nullable=False)
    purpose = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending | approved | rejected
    face_image_path = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
