from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from database import db
import uuid
import os
from datetime import datetime
from utils import get_current_user
from models import ShareRequest
from bson import ObjectId
from fastapi.responses import FileResponse
from bson import json_util
import json

# Helper function to convert MongoDB documents to dictionaries
def serialize_mongo_doc(doc):
    if doc is None:
        return None
    doc_dict = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc_dict[key] = str(value)
        else:
            doc_dict[key] = value
    return doc_dict

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
def upload_pdf(file: UploadFile = File(...), user: str = Depends(get_current_user)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDFs allowed.")
    
    file_id = str(uuid.uuid4())
    path = os.path.join(UPLOAD_DIR, f"{file_id}.pdf")
    with open(path, "wb") as f:
        f.write(file.file.read())

    db.pdfs.insert_one({
        "file_id": file_id,
        "owner": user,
        "filename": file.filename,
        "shared_with": [],
        "timestamp": datetime.utcnow().isoformat()
    })

    return {"message": "PDF uploaded", "file_id": file_id}

@router.get("/list")
def list_pdfs(user: str = Depends(get_current_user)):
    pdfs = db.pdfs.find({"$or": [{"owner": user}, {"shared_with": user}]})
    return [{"file_id": p["file_id"], "filename": p["filename"]} for p in pdfs]

@router.post("/comment")
def add_comment(file_id: str = Form(...), text: str = Form(...), user: str = Depends(get_current_user)):
    comment = {
        "file_id": file_id,
        "user_email": user,
        "text": text,
        "timestamp": datetime.utcnow().isoformat()
    }
    result = db.comments.insert_one(comment)
    
    # Return the comment with the new ObjectId converted to string
    return {
        "message": "Comment added",
        "comment": {
            "id": str(result.inserted_id),
            "file_id": file_id,
            "user_email": user,
            "text": text,
            "timestamp": comment["timestamp"]
        }
    }

@router.get("/comments/{file_id}")
def get_comments(file_id: str):
    comments = list(db.comments.find({"file_id": file_id}))
    # Use PyMongo's json_util to handle MongoDB types
    json_data = json_util.dumps(comments)
    return json.loads(json_data)

@router.post("/share")
def share_pdf(data: ShareRequest, user: str = Depends(get_current_user)):
    pdf = db.pdfs.find_one({"file_id": data.file_id})
    if not pdf or pdf["owner"] != user:
        raise HTTPException(status_code=403, detail="Not your file")
    
    db.pdfs.update_one({"file_id": data.file_id}, {
        "$addToSet": {"shared_with": data.share_with}
    })
    return {"message": "PDF shared"}

# Add direct PDF viewing endpoint
@router.get("/view/{file_id}")
async def view_pdf(file_id: str):
    pdf_path = os.path.join(UPLOAD_DIR, f"{file_id}.pdf")
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="PDF not found")
    return FileResponse(pdf_path, media_type="application/pdf")