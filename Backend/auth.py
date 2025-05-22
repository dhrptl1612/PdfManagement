from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from passlib.hash import bcrypt
from jose import jwt
from database import db
import os
from datetime import datetime, timedelta

SECRET = "PDFSECRET"

router = APIRouter()

class User(BaseModel):
    name: str
    email: str
    password: str

class Login(BaseModel):
    email: str
    password: str

@router.post("/signup")
def signup(user: User):
    if db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already exists")
    hashed = bcrypt.hash(user.password)
    db.users.insert_one({"name": user.name, "email": user.email, "password": hashed})
    return {"message": "User registered"}

@router.post("/login")
def login(data: Login):
    user = db.users.find_one({"email": data.email})
    if not user or not bcrypt.verify(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = jwt.encode({
        "email": user["email"],
        "exp": datetime.utcnow() + timedelta(hours=10)
    }, SECRET)
    
    return {"access_token": token}
