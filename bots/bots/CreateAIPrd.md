
# 🧠 CreateAIPrd.md

## 💡 AI Agents Architecture – Pawfect Sitters

This system uses 10 AI-powered development agents to handle all aspects of engineering, from backend to frontend to QA and DevOps. Each bot is embedded with memory of the PRD, BMAD, and file structure.

---

### 🟪 SoftwareArchitectBot
**Role:** Architect the full app structure (backend + frontend + database)  
**Prompt Usage:** `SoftwareArchitectBot, generate the system architecture from CreateAIPrd.md.`  
**Capabilities:**  
- Reads entire PRD and project root
- Designs backend + frontend layout
- Outputs: `/backend`, `/frontend`, `/database` scaffold

---

### 🟦 ProjectManagerBot
**Role:** Break down PRD, assign agents, manage task flow  
**Prompt Usage:** `ProjectManagerBot, break down the PRD into tasks and dispatch.`  
**Capabilities:**  
- Reads PRD and BMAD sections
- Assigns tasks to other agents
- Outputs: `taskboard.json`, milestone tracker

---

### 🟩 UIUXBot
**Role:** Generate full UI/UX flows  
**Prompt Usage:** `UIUXBot, generate all Figma-ready UI views for onboarding, dashboard, and sitter profiles.`  
**Capabilities:**  
- Builds wireframes, layouts, and colors
- Outputs: `ui/`, design tokens, CSS modules

---

### 🟩 FrontendBot
**Role:** Build front-end components  
**Prompt Usage:** `FrontendBot, implement auth flow, dashboard layout, and sitter listing page using React.`  
**Capabilities:**  
- Uses React/Vue with modular components
- Hooks into API layer
- Outputs: `frontend/`

---

### 🟩 LowCodeBot
**Role:** Create visual logic in no-code platforms  
**Prompt Usage:** `LowCodeBot, convert booking flow into Bubble.io logic.`  
**Capabilities:**  
- Builds flows in Webflow, Bubble, Glide
- Outputs: `nocode/` schemas, exports

---

### 🟩 FullStackBot
**Role:** Bridge backend/frontend integration  
**Prompt Usage:** `FullStackBot, connect auth UI to backend and handle state sync.`  
**Capabilities:**  
- Connects APIs, manages state and logic
- Outputs: `api/`, `shared/`

---

### 🟩 AImlBot
**Role:** AI logic, trust scores, smart recommendations  
**Prompt Usage:** `AImlBot, generate trust score model for sitters and matchmaking engine.`  
**Capabilities:**  
- Integrates LLMs, TensorFlow, or OpenAI APIs
- Outputs: `ai/`, ML models

---

### 🟩 DevOpsBot
**Role:** Handle all deployment & config  
**Prompt Usage:** `DevOpsBot, set up CI/CD to Vercel + staging for QA.`  
**Capabilities:**  
- Configures `.env`, pipelines, docker, secrets
- Outputs: `deploy/`, `.github/workflows`

---

### 🟩 QABot
**Role:** Auto-generate test suites  
**Prompt Usage:** `QABot, generate Cypress + Jest test suite for sitter dashboard.`  
**Capabilities:**  
- Unit, integration, e2e test generation
- Outputs: `tests/`

---

### 🟩 PythonBot
**Role:** Backend scripting, APIs, automations  
**Prompt Usage:** `PythonBot, generate verification uploader, Stripe webhook, and scheduled backup.`  
**Capabilities:**  
- Uses FastAPI, Flask, or Django as needed
- Outputs: `backend/`, `scripts/`
