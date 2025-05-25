# PDF Management & Collaboration System

A full-stack web application that facilitates seamless PDF management and collaboration. This system enables users to sign up, upload PDFs, share them with others, and collaborate through comments.

# PDF Collaboration System

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Architecture & Data Flow](#architecture--data-flow)
- [Key Features](#key-features)
- [Database Schema](#database-schema)
- [User Journey](#user-journey)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [Frontend Structure](#frontend-structure)
- [Security Considerations](#security-considerations)
- [Future Enhancements](#future-enhancements)


## 🔍 Project Overview

The PDF Management & Collaboration System is designed to provide a secure and user-friendly platform for managing PDF documents with collaborative features. The system consists of a FastAPI backend and a React frontend, with MongoDB as the database. PDFs can be stored directly in MongoDB using GridFS, enabling efficient retrieval and secure storage.

### Core Capabilities

- User authentication and profile management
- PDF upload, viewing, and management
- PDF sharing via email invitations or shareable links
- Real-time commenting system for collaboration
- Secure access controls to ensure document privacy
- Responsive design that works across various devices

## 💻 Technology Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **MongoDB**: NoSQL database with GridFS for PDF storage
- **PyJWT**: Python library for JSON Web Tokens (authentication)
- **Python 3.9+**: Primary programming language for backend

### Frontend
- **React 19**: JavaScript library for building user interfaces
- **React Router**: Page navigation and routing
- **Material UI**: Component library for consistent design
- **Axios**: HTTP client for API requests

### Development Tools
- **Git/GitHub**: Version control and code collaboration
- **Vercel**: Frontend deployment platform
- **Docker**: Containerization (optional for local development)

Section 3: Architecture and Data Flow

## 🔄 Architecture & Data Flow

Architecture Diagram

### Component Architecture
```
┌─────────────┐     ┌───────────────┐     ┌──────────────┐
│   React     │     │    FastAPI    │     │   MongoDB    │
│  Frontend   │◄───►│    Backend    │◄───►│   Database   │
└─────────────┘     └───────────────┘     └──────────────┘
```
### Data Flow
1. User authenticates through React frontend
2. Frontend makes API calls to FastAPI backend
3. Backend validates requests and interacts with MongoDB
4. MongoDB stores user data, PDF files (via GridFS), and comments
5. Backend returns responses to frontend
6. Frontend updates UI based on response data

Section 4: Key Features

## ✨ Key Features

### User Authentication
- Secure registration and login
- JWT-based authentication
- Password hashing for security

### PDF Management
- Upload PDFs with validation
- List and search PDF files
- View PDFs in browser with pagination
- Delete PDFs (restricted to file owners)

### Collaboration Tools
- Add comments to PDFs
- View and reply to comments
- Real-time comment updates

### Sharing Functionality
- Share PDFs with specific users
- Generate shareable links for public access
- Permissions management for shared files

Section 5: Database Schema

## 📊 Database Schema

### Collections
- **Users**
  {
    "_id": "ObjectId",
    "email": "string (unique)",
    "name": "string",
    "password": "string (hashed)",
    "created_at": "datetime"
  }

- **PDFs**
  {
    "_id": "ObjectId",
    "file_id": "string (UUID)",
    "owner": "string (email)",
    "filename": "string",
    "fs_id": "string (GridFS ID)",
    "shared_with": ["string (email)"],
    "timestamp": "datetime"
  }

- **Comments**
  {
    "_id": "ObjectId",
    "file_id": "string",
    "user_email": "string",
    "text": "string",
    "timestamp": "datetime"
  }

- **GridFS**
  - Stores PDF binary data with metadata

Section 6: User Journey

## 👣 User Journey

### First-time User
1. Registers an account with name, email, and password
2. Arrives at empty dashboard
3. Uploads first PDF document
4. Views the PDF in the built-in viewer
5. Adds comments to the PDF
6. Shares the PDF with collaborators via email or link

### Returning User
1. Logs in to access dashboard
2. Sees list of owned and shared PDFs
3. Searches for specific documents
4. Opens a PDF to view or add comments
5. Manages sharing permissions or deletes own PDFs

### Invited User (via Link)
1. Clicks on shared PDF link
2. Views PDF without needing an account
3. Has read-only access to the document

### Collaborative Workflow
1. Owner uploads PDF and shares with team
2. Team members add comments on specific areas
3. Owner reviews comments and makes revisions
4. Updated version can be uploaded for further review

Section 7: Installation & Setup

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- MongoDB instance

### Backend Setup
# Clone repository
git clone https://github.com/yourusername/pdf-collaboration.git
cd pdf-collaboration/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export MONGODB_URI="your-mongodb-connection-string"
export JWT_SECRET="your-secret-key"

# Run the application
uvicorn main:app --reload

### Frontend Setup
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Set environment variables
echo "REACT_APP_API_URL=http://localhost:8000" > .env

# Start development server
npm start

### Production Deployment
- Backend can be deployed on any Python-compatible server
- Frontend can be deployed on Vercel:
  cd frontend
  vercel

Section 8: API Documentation & Frontend Structure

## 📚 API Documentation

### Authentication Endpoints
- **POST /auth/signup** - Register a new user
- **POST /auth/login** - Log in and get access token

### PDF Management Endpoints
- **POST /pdf/upload** - Upload a PDF file
- **GET /pdf/list** - Get all PDFs accessible to the user
- **DELETE /pdf/delete/{file_id}** - Delete a PDF (owner only)
- **GET /pdf/view/{file_id}** - View a PDF file

### Collaboration Endpoints
- **POST /pdf/comment** - Add a comment to a PDF
- **GET /pdf/comments/{file_id}** - Get comments for a PDF
- **POST /pdf/share** - Share a PDF with another user
- **GET /pdf/shared-link/{file_id}** - Generate a shareable link
- **GET /pdf/shared/{file_id}** - Access a shared PDF (no auth required)

## 🏗️ Frontend Structure

    /src
    /components
        /auth         # Authentication components
        /dashboard    # Dashboard and PDF listing
        /pdf          # PDF viewing and commenting
        /share        # PDF sharing functionality
        /common       # Shared UI components
        /upload       # PDF upload components
    /services       # API service integrations
    /utils          # Helper functions
    /contexts       # React context providers
    App.js          # Main application component
    routes.js       # Application routing

### Key Components
- **Login/Register**: User authentication forms
- **Dashboard**: Main interface showing owned and shared PDFs
- **PDFViewer**: Document viewing interface
- **CommentSection**: Comment display and addition
- **SharePDF**: User invitation interface
- **GetShareableLink**: Public link generation

Section 9: Security & Future Enhancements

## 🔒 Security Considerations

- **Authentication**: JWT-based with token expiration
- **Password Security**: Bcrypt hashing for password storage
- **Access Control**: Validation for all PDF access and operations
- **CORS Protection**: Configured to prevent unauthorized access
- **Input Validation**: Sanitization of all user inputs
- **File Validation**: Verification of PDF format and content

## 🚀 Future Enhancements

- **Real-time Collaboration**: WebSocket integration for live comments
- **Advanced Text Formatting**: Rich text editor for comments
- **Version Control**: Track changes and maintain document history
- **User Groups**: Create teams for easier sharing
- **PDF Annotations**: Allow highlighting and drawing on PDFs
- **Mobile App**: Native mobile applications for iOS and Android
- **Analytics**: Track document views and engagement metrics

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributors

- [Your Name](https://github.com/yourusername)

## 🙏 Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Material UI](https://mui.com/)

---