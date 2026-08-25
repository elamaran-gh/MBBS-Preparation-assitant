# MBBS AI Study Assistant

A lightweight portfolio prototype demonstrating a syllabus-oriented Retrieval-Augmented Generation (RAG) study system for MBBS preparation. 

Inspired by clinical product workflows, this application acts as an exam hub where students can search previous-years' exam questions from multiple medical universities, retrieve verified references from standard textbooks (Robbins Pathology, Harrison's Internal Medicine, Bailey & Love's Surgery), and generate structured, syllabus-aligned study guides.

---

## 🛠️ Tech Stack

### Frontend
- **React** (Vite template)
- **React Router v7**
- **Tailwind CSS v3**
- **Lucide Icons**

### Backend
- **Node.js** & **Express** (ES Modules)
- **MongoDB Atlas / Local MongoDB** (via Mongoose)
- **Qdrant Vector Database** (Free Tier cloud / HTTP REST)
- **AI Services**: Embeddings & LLM interfaces (with a fallback local mock system)

---

## 📂 Project Structure

```text
/client
  /src
    /components    # Reusable UI widgets (Navbar, SearchBar, Filters, cards)
    /pages         # Layout templates (Home, Detail, AI Answer, References)
    /services      # api.js consumer layer
    /index.css     # Tailwind styles
    /App.jsx       # Route configuration
    /main.jsx      # React mounting entry point

/server
  /config          # Env loading, Mongoose, and Qdrant configurations
  /controllers     # Question, Reference, and AI request handlers
  /models          # Mongoose Schema models (Question, Reference)
  /routes          # Express endpoint routing paths
  /services        # Business and RAG interfaces (LLM, Embeddings, Vector)
  /middleware      # Reusable errors parser
  /scripts         # db seeding script (seed.js)
  app.js           # Express app declarations
  server.js        # Infrastructure startup entry point

.env.example       # Template configurations
package.json       # Workspace commands (optional)
```

---

## ⚡ Quick Start & Setup

### Prerequisites
1. **Node.js** (v18 or higher recommended)
2. **MongoDB** (Ensure local MongoDB is running at `mongodb://127.0.0.1:27017/` or prepare a MongoDB Atlas connection string)

### 1. Backend Installation & Configurations
Navigate into the `/server` directory:
```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/mbbs-ai-study-assistant
QDRANT_URL=
QDRANT_API_KEY=
LLM_API_KEY=
EMBEDDING_API_KEY=
```
*Note: If no Qdrant or LLM API keys are provided, the services will automatically load a rich, local medical mock fallback. The prototype remains 100% functional out of the box.*

### 2. Seeding the Database
Run the seed script to populate MongoDB with ~24 previous-year medical questions (across Medicine, Surgery, Pathology, and Pharmacology) and textbook reference excerpts:
```bash
npm run seed
```

### 3. Launching the Backend Server
Start the Express server in development mode:
```bash
npm run dev
```
The server will start at [http://localhost:5000](http://localhost:5000). You can check health at [http://localhost:5000/api/health](http://localhost:5000/api/health).

---

### 4. Frontend Installation & Startup
Open a new terminal tab and navigate to the `/client` directory:
```bash
cd client
npm install
npm run dev
```
The Vite development server will spin up (usually at [http://localhost:5173](http://localhost:5173)). Open this URL in your web browser.

---

## 🏥 Verification Walkthrough

1. **Home Page**: Search for medical terms like "nephrotic" or "appendicitis" or filter by subject (e.g. Medicine, Surgery) or year.
2. **Question Details**: Click "View Exam Hub" on any card to see metadata tags and connected references.
3. **Structured AI Answer**: Click "Generate AI Answer" to trigger RAG context-assembly. The resulting screen displays the question with organized medical sections (Definition, Clinical Features, Investigations, Management, High-Yield Exam Points, and citations).
4. **Similar Questions**: Click "Similar Questions" to see a list of semantically matched questions with relevance match percentages.
5. **Textbook Excerpts**: Click "View Full Excerpt" to read full source paragraphs with book names, chapters, and page numbers.
