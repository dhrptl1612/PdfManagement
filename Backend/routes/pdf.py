from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from database import db,fs
import uuid
import os
from datetime import datetime
from utils import get_current_user
from models import ShareRequest
from bson import ObjectId
from fastapi.responses import FileResponse, StreamingResponse
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
    content = file.file.read()
    
    # Store PDF in GridFS with metadata
    fs_id = fs.put(
        content,
        filename=file.filename,
        file_id=file_id,
        owner=user,
        content_type="application/pdf"
    )
    
    # Store PDF metadata in regular collection for easier querying
    db.pdfs.insert_one({
        "file_id": file_id,
        "owner": user,
        "filename": file.filename,
        "fs_id": str(fs_id),
        "shared_with": [],
        "timestamp": datetime.utcnow().isoformat()
    })

    return {"message": "PDF uploaded", "file_id": file_id}

@router.get("/list")
def list_pdfs(user: str = Depends(get_current_user)):
    pdfs_cursor = db.pdfs.find({"$or": [{"owner": user}, {"shared_with": user}]})
    
    pdf_list = []
    for pdf in pdfs_cursor:
        pdf_list.append({
            "file_id": pdf["file_id"],
            "filename": pdf["filename"],
            "is_owner": pdf["owner"] == user
        })
    
    return pdf_list

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
    # First get the metadata to find GridFS ID
    pdf_metadata = db.pdfs.find_one({"file_id": file_id})
    if not pdf_metadata:
        raise HTTPException(status_code=404, detail="PDF not found")
    
    # Find the file by file_id in GridFS
    grid_out = fs.find_one({"file_id": file_id})
    if not grid_out:
        raise HTTPException(status_code=404, detail="PDF file not found in storage")
    
    # Create a streaming response
    def iterfile():
        yield grid_out.read()
    
    return StreamingResponse(
        iterfile(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={pdf_metadata['filename']}"}
    )

@router.get("/shared-link/{file_id}")
def get_shareable_link(file_id: str, user: str = Depends(get_current_user)):
    pdf = db.pdfs.find_one({"file_id": file_id})
    
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")
    
    # Check if user is owner or PDF is shared with them
    if pdf["owner"] != user and user not in pdf["shared_with"]:
        raise HTTPException(status_code=403, detail="You don't have access to this PDF")
    
    # Generate a shareable link - in a real app, you might want to add some token validation
    share_url = f"/pdf/shared/{file_id}"
    return {"share_url": share_url}

# Add delete endpoint
@router.delete("/delete/{file_id}")
def delete_pdf(file_id: str, user: str = Depends(get_current_user)):
    # Find PDF metadata
    pdf = db.pdfs.find_one({"file_id": file_id})
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")
    
    # Check if user is the owner
    if pdf["owner"] != user:
        raise HTTPException(status_code=403, detail="You don't have permission to delete this PDF")
    
    # Delete PDF from GridFS
    fs.delete(ObjectId(pdf["fs_id"]))
    
    # Delete metadata
    db.pdfs.delete_one({"file_id": file_id})
    
    # Delete associated comments
    db.comments.delete_many({"file_id": file_id})
    
    return {"message": "PDF deleted successfully"}


# Update the shared PDF endpoint
@router.get("/shared/{file_id}")
async def shared_pdf_view(file_id: str):
    # Find PDF metadata
    pdf_metadata = db.pdfs.find_one({"file_id": file_id})
    if not pdf_metadata:
        raise HTTPException(status_code=404, detail="PDF not found")
    
    # Get file from GridFS
    grid_out = fs.find_one({"file_id": file_id})
    if not grid_out:
        raise HTTPException(status_code=404, detail="PDF file not found in storage")
    
    # Create a streaming response for the PDF
    def iterfile():
        yield grid_out.read()
    
    return StreamingResponse(
        iterfile(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={pdf_metadata['filename']}"}
    )