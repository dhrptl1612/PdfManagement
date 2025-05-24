from fastapi import Header, HTTPException
from jose import jwt

SECRET = "PDFSECRET"

def get_current_user(token: str = Header(...)):
    try:
        payload = jwt.decode(token, SECRET)
        return payload["email"]
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
