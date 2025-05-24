from fastapi import FastAPI
from auth import router as auth_router
from routes.pdf import router as pdf_router
from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi.staticfiles import StaticFiles
app = FastAPI()
app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],  # In production, specify the exact origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)

# Mount static files directory
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.include_router(auth_router, prefix="/auth")
app.include_router(pdf_router, prefix="/pdf")

app.get("/")
def welcome():
    return {"message":"Welcome to pdf management"}
