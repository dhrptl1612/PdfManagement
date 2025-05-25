
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from gridfs import GridFS


uri = "mongodb+srv://pdhruvi873:aGAlM6wWNTKpA3WG@cluster0.uett0ky.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"


client = MongoClient(uri, server_api=ServerApi('1'))


try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)
db=client["pdf_collab"]
fs=GridFS(db,collection="pdfs_storage")
    