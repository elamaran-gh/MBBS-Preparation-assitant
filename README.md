# MBBS AI Study Assistant

A lightweight portfolio prototype demonstrating a syllabus-oriented Retrieval-Augmented Generation (RAG) study system for MBBS preparation. 

Inspired by clinical product workflows, this application acts as an exam hub where students can search previous-years' exam questions from multiple medical universities, retrieve verified references from standard textbooks (Robbins Pathology, Harrison's Internal Medicine, Bailey & Love's Surgery), and generate structured, syllabus-aligned study guides. Students can also upload their own PDF study material and ask grounded questions against it directly.

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
    /pages         # Layout templates (Home, Detail, AI Answer, References, Study from PDF)
    /services      # api.js consumer layer
    /index.css     # Tailwind styles
    /App.jsx       # Route configuration
    /main.jsx      # React mounting entry point

/server
  /config          # Env loading, Mongoose, and Qdrant configurations
  /controllers     # Question, Reference, AI, and Document (PDF) request handlers
  /models          # Mongoose Schema models (Question, Reference, Document)
  /routes          # Express endpoint routing paths
  /services        # Business and RAG interfaces (LLM, Embeddings, Vector, PDF extraction/chunking/RAG)
  /middleware      # Error handler and file upload (multer) middleware
  /scripts         # Database seeding (seed.js) and vector population (populateVectors.js)
  /tests           # Jest + Supertest API test suite (questions, references, ai, documents)
  /data            # questions.json and references.json — the source dataset seed.js loads
  jest.config.js    # Jest configuration (ESM)
  app.js           # Express app declarations
  server.js        # Infrastructure startup entry point

.env.example       # Template configurations
.gitignore         # Excludes node_modules and .env from version control
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
Run the seed script to populate MongoDB with 35 previous-year medical questions — spanning Medicine, Surgery, Pathology, Pharmacology, and Microbiology, sourced from two real universities (RGUHS and Pandit Bhagwat Dayal Sharma University of Health Sciences, Rohtak) — along with their 35 matching textbook reference excerpts:
```bash
npm run seed
```
A successful run prints a subject-by-subject breakdown, e.g.:
```text
Total questions: 35
Total references: 35
Questions by subject:
- Medicine: 10
- Surgery: 8
- Pathology: 8
- Pharmacology: 8
- Microbiology: 1
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

## ✅ Running Tests

The backend has a Jest + Supertest suite covering the question, reference, AI answer, and PDF study endpoints against a real (isolated) test database — no mocking of MongoDB itself, so the tests exercise the actual queries, filters, and text search the app relies on.

### Setup
Tests run against a **separate test database** (`mbbs-ai-study-assistant-test` by default) so they never touch your seeded dev data. From `/server`:
```bash
npm install
npm test
```

To point at a different test database (e.g. a CI instance), set `TEST_MONGODB_URI` before running:
```bash
TEST_MONGODB_URI=mongodb://127.0.0.1:27017/my-test-db npm test
```

### What's covered
| File | Covers |
|---|---|
| `tests/questions.test.js` | Health check, list/filter/paginate questions, full-text + regex-fallback search, question detail, similar-questions |
| `tests/references.test.js` | Reference detail lookup, 404 handling |
| `tests/ai.test.js` | AI answer generation from a `questionId` or free-text `questionText`, 400/404 error cases |
| `tests/documents.test.js` | PDF upload → chunking → status polling → grounded Q&A, using a real generated PDF fixture |

Since no `LLM_API_KEY`, `EMBEDDING_API_KEY`, or `QDRANT_*` keys are required to run the app (per the mock-fallback behavior described above), these tests pass out of the box without any external API keys — they exercise the same fallback path a fresh clone of this repo would use.

---

## 🏥 Verification Walkthrough

The app's full navigable surface is: **Home → Search Results / Filtered List → Question Detail → (AI Answer | Similar Questions | Textbook Reference)**, plus a standalone **Study from PDF** page. There's no login, bookmarking, or saved session state in this prototype — each visit is stateless by design.

1. **Home Page**: Search for medical terms like "nephrotic," "phenytoin," or "gangrene," or filter by subject (Medicine, Surgery, Pathology, Pharmacology, Microbiology), university (RGUHS or PBDSHU Rohtak), or year.
2. **Search Results**: A weighted MongoDB text search runs across question text, topic, and chapter; if it finds nothing, it silently falls back to a regex search so partial or oddly-phrased queries still return something reasonable.
3. **Question Details**: Click into any card to see full metadata (subject, chapter, topic, question type, exam source) and its linked reference cards.
4. **Structured AI Answer**: Click "Generate AI Answer" to trigger RAG context-assembly. The resulting screen displays the question with organized medical sections (Definition, Main Points, Clinical Features, Investigations, Management, Important Exam Points) alongside the sources it was grounded in.
5. **Similar Questions**: Click "Similar Questions" to see a list of semantically matched questions (via vector search) with similarity scores, letting you work through a whole topic cluster rather than one question at a time.
6. **Textbook Excerpts**: Click a reference card to read the raw source paragraph directly — book name, chapter, topic, and content — without generating an AI answer.
7. **Study from PDF**: Upload your own PDF study material, wait for it to be chunked and embedded, then ask questions grounded specifically in that document. If no relevant content is found in the PDF, the app says so plainly rather than fabricating an answer.
