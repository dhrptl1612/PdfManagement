from fastapi import FastAPI
from auth import router as auth_router
from routes.pdf import router as pdf_router

app = FastAPI()


app.include_router(auth_router, prefix="/auth")
app.include_router(pdf_router, prefix="/pdf")