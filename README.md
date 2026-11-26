# TestPilot AI: Autonomous Software Testing

TestPilot AI is a full-stack web app that automatically tests Python code using Generative AI. 

Upload a `.zip` file of your repository, and the platform will analyze the code, use an LLM (like Groq/OpenAI) to generate `pytest` test cases, execute them in a secure sandbox, and save the results to a database. 

> **Core Philosophy:** AI proposes the tests, but actual code execution decides if they pass. We don't trust the LLM blindly.

## How it Works

1. **Upload:** Drop a Python `.zip` file into the dashboard.
2. **Analyze:** The backend uses Python's AST to map functions, classes, and run static analysis (Ruff/Bandit).
3. **Generate:** Click a function, and the AI writes a `pytest` test for it.
4. **Execute:** The code runs in a secure, time-limited subprocess sandbox.
5. **Verify:** A custom mutation engine breaks the source code to see if the AI's test actually catches the bug.
6. **Report:** View total tests, pass/fail rates, and logs in the Dashboard and Reports pages.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS (Bento Grid UI)
- **Backend:** FastAPI (Python), SQLAlchemy
- **Database:** PostgreSQL (Neon)
- **AI:** OpenAI SDK (Compatible with Groq, Ollama)
- **Testing & Security:** Pytest, Ruff, Bandit, AST Mutator

##Run Locally

**1. Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
