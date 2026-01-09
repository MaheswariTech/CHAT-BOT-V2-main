**`MIET_Chatbot_Step_By_Step_Development_Plan_v2.md`**

---

```markdown
# Step-by-Step Development Plan (Updated)
## AI-Based Student Helpdesk Chatbot  
### MIET Arts and Science College Website

---

## Phase 1: Requirement Analysis & Planning

### Step 1: Understand Project Scope
- Chatbot role: **Student Helpdesk Chatbot**
- Chatbot answers must come **only from uploaded PDF documents**
- PDFs will be uploaded via backend API:
  `/uploadknowledgebase`
- No external or general knowledge answers
- Fallback response for unknown queries:
  > "I'm unable to help."

---

### Step 2: Define Functional Requirements
- College website with chatbot UI
- Floating chatbot at bottom-right corner
- Backend API to upload PDFs
- Backend processes and stores PDFs into vector database
- NLP-based question answering using embeddings
- Strict document-based response control

---

### Step 3: Define Non-Functional Requirements
- Fast response time
- High accuracy
- Low-cost AI model usage
- Secure backend endpoints
- Scalable knowledge base

---

## Phase 2: Technology & Tool Selection

### Step 4: Choose Technology Stack

**Frontend**
- React.js
- Tailwind CSS / CSS
- Axios

**Backend**
- Python
- FastAPI

**AI / NLP**
- OpenAI / Gemini Embedding Models (low cost)
- FAISS Vector Database
- LangChain Framework

---

## Phase 3: System Design

### Step 5: High-Level Architecture

```

Admin → /uploadknowledgebase (FastAPI)
↓
PDF Processing
↓
Vector Embeddings
↓
FAISS Database
↓
User → React Chatbot → /chat API → Answer

```

---

### Step 6: Data Flow Design

1. Admin uploads PDF using `/uploadknowledgebase`
2. Backend extracts text from PDF
3. Text is cleaned and chunked
4. Embeddings are generated
5. Embeddings are stored in FAISS
6. User submits query via chatbot
7. Query embedding is generated
8. Similarity search is performed
9. If match found → response generated
10. If no match → fallback response

---

## Phase 4: Backend Development (FastAPI)

### Step 7: Backend Project Setup
- Create Python virtual environment
- Install FastAPI, Uvicorn
- Install LangChain, FAISS, PDF loaders
- Configure environment variables

---

### Step 8: Implement Knowledge Base Upload API

**Endpoint**
```

POST /uploadknowledgebase

```

**Responsibilities**
- Accept PDF file upload
- Validate file format
- Store file temporarily
- Trigger PDF processing pipeline

---

### Step 9: PDF Processing Pipeline
- Load PDF using PDF loader
- Extract text content
- Remove noise and unnecessary symbols
- Split text into fixed-size chunks
- Assign metadata (document name, page number)

---

### Step 10: Embedding & Storage
- Generate embeddings for each text chunk
- Use low-cost embedding model
- Store vectors in FAISS database
- Save FAISS index locally or in storage

---

### Step 11: Knowledge Base Update Strategy
- Append new PDFs without deleting old data
- Option to rebuild vector DB if required
- Maintain versioning (optional)

---

## Phase 5: Chat API Development

### Step 12: Implement Chat Endpoint

**Endpoint**
```

POST /chat

````

**Input**
```json
{
  "query": "What courses are offered?"
}
````

**Output**

```json
{
  "answer": "MIET Arts and Science College offers..."
}
```

---

### Step 13: Similarity Search Logic

* Convert user query into embedding
* Search FAISS database
* Retrieve top matching chunks
* Check similarity score threshold

---

### Step 14: Strict Response Control

* If similarity score below threshold:

  > "I'm unable to help."
* If no relevant context found:

  > "I'm unable to help."
* Do not allow model to answer outside context

---

## Phase 6: NLP & Prompt Engineering

### Step 15: Prompt Design

* Answer only from retrieved context
* No creativity (temperature = 0)
* Explicit fallback instruction

---

### Step 16: Low-Cost Model Optimization

* Use minimal token prompts
* Limit response length
* Cache embeddings
* Batch embedding generation

---

## Phase 7: Frontend Development (React)

### Step 17: Create React Application

* Initialize React project
* Setup routing
* Create reusable components

---

### Step 18: Build College Website Pages

* Home
* About MIET
* Courses
* Admissions
* Contact

(Use sample/static college data)

---

### Step 19: Chatbot UI Development

* Floating chatbot icon (bottom-right)
* Expandable chat window
* User and bot message bubbles
* Input field with send button

---

### Step 20: Frontend–Backend Integration

* Connect chatbot to `/chat` API
* Handle loading and error states
* Display fallback message clearly

---

## Phase 8: Testing & Validation

### Step 21: Functional Testing

* Test valid PDF-based questions
* Test unrelated questions
* Verify fallback response

---

### Step 22: Performance Testing

* Measure response time
* Test large PDFs
* Test multiple queries

---

### Step 23: Security Testing

* Restrict upload file types
* Validate request size
* Prevent prompt injection
* Secure API endpoints

---

## Phase 9: Deployment

### Step 24: Backend Deployment

* Deploy FastAPI backend
* Configure environment variables
* Secure `/uploadknowledgebase` endpoint

---

### Step 25: Frontend Deployment

* Build React app
* Deploy to hosting service
* Connect to backend API

---

## Phase 10: Documentation & Submission

### Step 26: Project Documentation

* Abstract
* Architecture diagram
* API documentation
* Flow charts
* Screenshots

---

### Step 27: Viva & Demonstration Preparation

* Explain vector embeddings
* Explain `/uploadknowledgebase` flow
* Explain fallback logic
* Live chatbot demo

---

## Final Deliverable

A **document-driven, NLP-based AI Student Helpdesk Chatbot** integrated into the MIET Arts and Science College website, using **backend-managed PDF knowledge base uploads** with strict response control.
