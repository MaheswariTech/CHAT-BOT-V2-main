import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from utils.knowledge_processor import process_file, process_url, FAISS_INDEX_PATH
from utils.email_sender import send_confirmation_email
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_community.vectorstores import FAISS
from langchain_core.messages import SystemMessage, HumanMessage
from dotenv import load_dotenv
import json
import time
import sqlite3
from datetime import datetime

# Load environment variables explicitly from .env file
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

# Verify API Key
API_KEY = os.getenv("GROQ_API_KEY")
if not API_KEY:
    print("CRITICAL: GROQ_API_KEY is not set correctly in backend/.env")
else:
    print(f"SUCCESS: GROQ_API_KEY loaded")

app = FastAPI(title="MIET Student Helpdesk Chatbot API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure required directories exist
UPLOAD_DIR = "knowledge_base"
DB_DIR = "database"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(DB_DIR, exist_ok=True)

# Global variables for models and vector store
embeddings = None
vector_store = None
llm = None

def get_llm():
    global llm
    if llm is None and API_KEY:
        try:
            llm = ChatGroq(
                model_name="openai/gpt-oss-120b", 
                temperature=0.3, 
                api_key=API_KEY, 
                request_timeout=30
            )
        except Exception as e:
            print(f"Error initializing LLM: {e}")
    return llm

def get_vector_store():
    global vector_store, embeddings
    if vector_store is None:
        if os.path.exists(FAISS_INDEX_PATH):
            try:
                if embeddings is None:
                    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
                vector_store = FAISS.load_local(FAISS_INDEX_PATH, embeddings, allow_dangerous_deserialization=True)
            except Exception as e:
                print(f"Error loading vector store: {e}")
    return vector_store

class ChatRequest(BaseModel):
    query: str
    session_id: str = "default_session"

@app.post("/uploadknowledgebase")
async def upload_knowledge_base(file: UploadFile = File(...)):
    global vector_store
    allowed_extensions = {".pdf", ".txt", ".docx"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed: {allowed_extensions}")
    
    try:
        # 1. Clear the old files in the knowledge base directory
        if os.path.exists(UPLOAD_DIR):
            for filename in os.listdir(UPLOAD_DIR):
                path = os.path.join(UPLOAD_DIR, filename)
                try:
                    if os.path.isfile(path) or os.path.islink(path):
                        os.unlink(path)
                    elif os.path.isdir(path):
                        shutil.rmtree(path)
                except Exception as e:
                    print(f'Failed to delete {path}. Reason: {e}')

        # 2. Reset the in-memory vector store
        vector_store = None
        
        # 3. Save the new file
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 4. Process the file and update vector store (clear_existing=True to overwrite FAISS index)
        num_chunks = process_file(file_path, clear_existing=True)
        
        return {
            "message": f"Successfully replaced Knowledge Base with {file.filename}. Found {num_chunks} data points.",
            "status": "synchronized"
        }
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class UrlRequest(BaseModel):
    url: str

@app.post("/trainurl")
async def train_url(request: UrlRequest):
    url = request.url.strip()
    if not url.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid URL format.")
    
    try:
        num_chunks = process_url(url)
        return {
            "message": f"Successfully crawled and embedded {num_chunks} data points from {url} into the AI Knowledge Base.",
            "status": "synchronized"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/resetknowledgebase")
async def reset_knowledge_base():
    global vector_store
    try:
        # 1. Clear files in knowledge_base directory
        if os.path.exists(UPLOAD_DIR):
            for filename in os.listdir(UPLOAD_DIR):
                path = os.path.join(UPLOAD_DIR, filename)
                try:
                    if os.path.isfile(path) or os.path.islink(path):
                        os.unlink(path)
                    elif os.path.isdir(path):
                        shutil.rmtree(path)
                except Exception as e:
                    print(f'Failed to delete {path}. Reason: {e}')
        
        # 2. Delete FAISS index from disk
        from utils.knowledge_processor import FAISS_INDEX_PATH
        if os.path.exists(FAISS_INDEX_PATH):
            shutil.rmtree(FAISS_INDEX_PATH)
            
        # 3. Reset in-memory store
        vector_store = None
        
        return {"message": "Knowledge base has been manually reset. All documents and embeddings cleared.", "status": "reset"}
    except Exception as e:
        print(f"Reset error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Simple in-memory memory store
# In production, use session IDs and a persistent database like Redis
# Structure: { session_id: {"history": [], "last_activity": timestamp} }
session_histories = {}
SESSION_TIMEOUT = 120 # 2 minutes in seconds

def cleanup_expired_sessions():
    """Remove sessions that have been inactive for more than 2 minutes."""
    current_time = time.time()
    expired_sessions = [
        sid for sid, data in session_histories.items() 
        if current_time - data["last_activity"] > SESSION_TIMEOUT
    ]
    for sid in expired_sessions:
        del session_histories[sid]
    
    if expired_sessions:
        print(f"Cleanup: Removed {len(expired_sessions)} inactive sessions.")

@app.get("/status")
async def health_check():
    cleanup_expired_sessions()
    v_store = get_vector_store()
    return {
        "status": "online",
        "api_key_set": bool(API_KEY),
        "vector_store_loaded": v_store is not None,
        "active_sessions": len(session_histories),
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

@app.post("/chat")
async def chat(request: ChatRequest):
    query = request.query.strip()
    session_id = request.session_id
    
    if not API_KEY:
        return {"answer": "I'm sorry, I'm having trouble connecting to my AI services. Please check the API config.", "version": "10.0-Smart"}

    try:
        # Cleanup old sessions before processing new request
        cleanup_expired_sessions()

        # Get global instances
        v_store = get_vector_store()
        chat_llm = get_llm()
        
        if not v_store:
             return {"answer": "Hello! I don't have any college documents to study yet. Please upload a PDF in the Admin section so I can help you better.", "version": "10.0-Smart"}
        
        if not chat_llm:
             return {"answer": "I'm having trouble connecting to my AI core. Please check your API key.", "version": "10.0-Smart"}

        # Initialize session history if it doesn't exist
        if session_id not in session_histories:
            session_histories[session_id] = {"history": [], "last_activity": time.time()}
        
        # Update last activity time
        session_histories[session_id]["last_activity"] = time.time()
        history = session_histories[session_id]["history"]

        # 3. Setup Prompt for the Agent
        system_template = """You are the MIET AI Student Support Agent, a helpful, intelligent, and friendly assistant for M.I.E.T.Arts & Science College.

        YOUR GOAL: Provide accurate, helpful, and "human-like" answers to student queries based on the provided college documents.

        FORMATTING RULES (STRICT):
        1. **SENTENCE CASE**: Always use proper sentence case. Use bold for emphasis and italic for secondary details.
        2. **CLEAN LAYOUT**: Use bullet points and numbered lists for all technical data, course lists, or fee structures. Avoid large blocks of text.
        3. **THREE-COLOR THEME STRATEGY (MODERN UI)**:
           - Use **MIET Navy** (#003366) for Primary Headers (Main topics).
           - Use **Gold/Amber** for Key Highlights or Action Items.
           - Use *Neutral Gray* for fine print or context.
           (Note: Represent these using semantic markdown structures like `### Header`, `**Bold**`, and `*Italic*`).
        4. **MD WRAPPING**: Use Markdown tables for data comparisons if applicable.

        ADMISSION FLOW (CRITICAL):
        1. If the user asks about admissions, courses, or fees, answer clearly in structured points first.
        2. THEN, always ask: "Would you like to apply for admission now?"
        3. IF confirmed, provide the exact tag: **[ADMISSION_BUTTON]**.

        Context from College Documents:
        {context}
        """

        # Include more history for better context (last 10 interactions)
        recent_history = history[-10:] if len(history) >= 10 else history
        history_str = ""
        for i, msg in enumerate(recent_history):
            role = "User" if i % 2 == 0 else "Bot"
            history_str += f"{role}: {msg}\n"
        
        if history_str:
            system_template += f"\n\nRecent Conversation History:\n{history_str}"

        # 5. Execute RAG Chain
        docs = v_store.similarity_search_with_score(query, k=10)
        relevant_docs = [doc for doc, score in docs if score < 1.65]
        context = "\n\n".join([doc.page_content for doc in relevant_docs]) if relevant_docs else ""

        # Social & Fallback Handling
        if not context and len(query) < 5:
            greetings = ["hi", "hello", "hey", "vanakam", "namaste"]
            if any(g in query.lower() for g in greetings):
                ans = "Vanakam! 👋 I am your MIET AI Agent. I'm here to answer your questions about courses, admissions, fees, and campus life. Would you like to start your admission process today?"
                history.append(query)
                history.append(ans)
                return {"answer": ans, "version": "10.0-Smart"}

        # Generate response using LLM with the retrieved context
        messages = [
            SystemMessage(content=system_template.format(context=context)),
            HumanMessage(content=query)
        ]
        
        response = chat_llm.invoke(messages)
        
        # Save to memory
        history.append(query)
        history.append(response.content)
        
        # Update last activity again after bot response
        session_histories[session_id]["last_activity"] = time.time()
        
        # Limit history size per session
        if len(history) > 40:
            session_histories[session_id]["history"] = history[-40:]
            
        return {"answer": response.content, "version": "10.0-Smart"}
        
    except Exception as e:
        print(f"Chat error: {str(e)}")
        return {"answer": f"Agent error: {str(e)}", "version": "10.0-Smart"}

@app.post("/admission-options")
async def get_admission_options():
    try:
        if not API_KEY:
            return {"error": "API Key missing"}

        v_store = get_vector_store()
        chat_llm = get_llm()
        
        if not v_store:
            return {
                "categories": ["Undergraduate (UG)", "Postgraduate (PG)"],
                "courses": {
                    "Undergraduate (UG)": ["Computer Science", "Physics", "Chemistry", "Mathematics"],
                    "Postgraduate (PG)": ["M.Sc Computer Science", "M.Sc Mathematics"]
                }
            }

        # Search for course related info
        docs = v_store.similarity_search("list of courses and departments", k=15)
        context = "\n\n".join([doc.page_content for doc in docs])
        
        system_prompt = """You are a data extractor for MIET College. Based on the context, extract categories and courses.
        Return ONLY a JSON object: {"categories": ["..."], "courses": {"Cat1": ["Course A"]}}
        
        Context:
        {context}
        """
        
        messages = [
            SystemMessage(content=system_prompt.format(context=context)),
            HumanMessage(content="Extract the admission categories and courses as JSON.")
        ]
        
        response = chat_llm.invoke(messages)
        # Attempt to parse JSON from response
        try:
            content = response.content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            data = json.loads(content)
            return data
        except:
            return {
                "categories": ["Undergraduate (UG)", "Postgraduate (PG)", "Research Programs"],
                "courses": {
                    "Undergraduate (UG)": [
                        "B.A. English", "B.Com", "B.Com (Computer Applications)", "B.B.A", 
                        "B.Sc Physics", "B.Sc Mathematics", "B.Sc Computer Science", 
                        "B.Sc Data Science", "B.Sc Biochemistry", "B.Sc Microbiology", "B.C.A"
                    ],
                    "Postgraduate (PG)": [
                        "M.A. English", "M.Com", "M.Sc Computer Science", 
                        "M.Sc Biochemistry", "M.C.A"
                    ],
                    "Research Programs": [
                        "Ph.D. in Commerce (Full-time)", "Ph.D. in Commerce (Part-time)"
                    ]
                }
            }
            
    except Exception as e:
        print(f"Error in admission-options: {e}")
        return {"error": str(e)}


# Initialize admissions database
ADMISSIONS_DB = os.path.join(DB_DIR, "admissions.db")

def init_db():
    conn = sqlite3.connect(ADMISSIONS_DB)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS admissions
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  full_name TEXT,
                  email TEXT,
                  phone TEXT,
                  category TEXT,
                  course TEXT,
                  address TEXT,
                  marks TEXT,
                  prev_college TEXT,
                  submitted_at TEXT)''')
    
    # Check if all columns exist (migration for older versions)
    c.execute("PRAGMA table_info(admissions)")
    columns = [row[1] for row in c.fetchall()]
    
    required_columns = {
        "full_name": "TEXT",
        "email": "TEXT",
        "phone": "TEXT",
        "category": "TEXT",
        "course": "TEXT",
        "address": "TEXT",
        "marks": "TEXT",
        "prev_college": "TEXT",
        "submitted_at": "TEXT"
    }
    
    for col, col_type in required_columns.items():
        if col not in columns:
            try:
                c.execute(f"ALTER TABLE admissions ADD COLUMN {col} {col_type}")
                print(f"Migration: Added missing column {col} to admissions table")
            except Exception as e:
                print(f"Migration Error: {e}")
                
    conn.commit()
    conn.close()

# Run DB init
init_db()

@app.post("/submit-admission")
async def submit_admission(data: dict):
    try:
        conn = sqlite3.connect(ADMISSIONS_DB)
        c = conn.cursor()
        
        # Ensure submitted_at is recorded
        submitted_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        c.execute('''INSERT INTO admissions 
                     (full_name, email, phone, category, course, address, marks, prev_college, submitted_at) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''', 
                  (data.get('fullName'), 
                   data.get('email'), 
                   data.get('phone'), 
                   data.get('category'), 
                   data.get('course'), 
                   data.get('address'), 
                   data.get('marks'), 
                   data.get('prevCollege'),
                   submitted_at))
        
        application_id = c.lastrowid
        conn.commit()
        conn.close()
        
        print(f"NEW ADMISSION STORED: {data.get('fullName')} for {data.get('course')} (ID: {application_id})")
        
        # Send confirmation email
        email_sent = False
        student_email = data.get('email')
        student_name = data.get('fullName')
        course_name = data.get('course')
        
        if student_email:
            email_sent = send_confirmation_email(student_email, student_name, course_name, application_id, submitted_at)

        if email_sent:
            return {"status": "success", "email_sent": True, "message": "Application submitted successfully! A confirmation email has been sent."}
        else:
            return {"status": "success", "email_sent": False, "message": "Application stored, but email confirmation failed. Please check your contact details or contact support."}
    except Exception as e:
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Failed to store admission data")

@app.get("/admissions")
async def get_admissions():
    try:
        conn = sqlite3.connect(ADMISSIONS_DB)
        # Use Row factory to get dict-like objects
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute("SELECT * FROM admissions ORDER BY submitted_at DESC")
        rows = c.fetchall()
        
        data = [dict(row) for row in rows]
        conn.close()
        return data
    except Exception as e:
        print(f"Error fetching admissions: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    # Enable reload for easier development updates
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
