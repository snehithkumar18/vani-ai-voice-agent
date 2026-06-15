# Vani AI Voice Agent

Vani is a modern, high-performance conversational AI voice agent platform. It allows businesses to create, customize, and manage intelligent voice agents that automate customer support, handle inbound/outbound calls, parse customer intent, and resolve queries using real-time LLMs.

Designed with a sleek, responsive interface, Vani provides full analytical dashboards, call log tracking, sentiment analysis, and a structured agent wizard.

---

## 🚀 Key Features

*   **Real-time Analytics Dashboard**: Monitor total calls, active agents, average call duration, and customer satisfaction scores dynamically.
*   **AI Agent Creator**: An intuitive 3-step setup wizard to configure agent voice characteristics, language preferences (Hindi, Telugu, Tamil, Marathi, English, etc.), business contexts, custom FAQ databases, and phone numbers.
*   **Call Logs & Sentiment Analysis**: Detailed logs showing customer details, resolved intent tags, call durations, and sentiment classifications (Positive, Neutral, Negative, Delighted).
*   **Configurable Knowledge Base**: Upload FAQs, catalogs, business hours, and logic trees to inform the agent's conversational context.
*   **Phone Number Provisioning**: Connect and map dedicated Indian virtual numbers or connect custom telephony trunks (Twilio / Plivo).

---

## 🛠️ Technology Stack

*   **Framework**: [TanStack Start](https://tanstack.com/router/v1/docs/start/overview) (React SSR Meta-framework)
*   **Language**: TypeScript
*   **Database & Backend**: [Supabase](https://supabase.com/) (PostgreSQL, Realtime, row-level security, trigger functions)
*   **Styling**: Tailwind CSS & CSS custom variables
*   **Bundler/Server**: Vite & Nitro Server

---

## 📂 Project Structure

```bash
├── .env.example          # Environment variables template
├── supabase/
│   ├── config.toml       # Supabase project settings
│   └── migrations/       # PostgreSQL schema & security policies
├── src/
│   ├── components/       # Reusable UI elements (Buttons, Badges, Layouts)
│   ├── integrations/     # Supabase & Lovable client auth configurations
│   ├── lib/              # Queries (React Query), DB types, configurations
│   ├── routes/           # TanStack file-based router pages
│   │   ├── __root.tsx    # Root router layout
│   │   ├── index.tsx     # Landing page
│   │   ├── login.tsx     # Authentication page
│   │   └── _authenticated/
│   │       ├── dashboard.tsx      # Overview analytics
│   │       ├── create-agent.tsx   # Agent setup wizard
│   │       └── agent.$id.tsx      # Individual agent detail & analytics
│   ├── server.ts         # Nitro backend fetch handler
│   └── start.ts          # TanStack Start middleware setup
```

---

## 💾 Database Schema

The system uses a highly secure, RLS (Row Level Security) enabled schema defined in Supabase migrations:
1.  **`profiles`**: Links users to subscription plans (`free`, `starter`, etc.) and tracking metrics.
2.  **`agents`**: Stores AI configurations, voice selections, primary languages, and calculated performance stats.
3.  **`knowledge_base`**: FAQ context mapped to agents.
4.  **`calls`**: Detailed history logs of all conversations, sentiment flags, durations, and transcript pointers.
5.  **`phone_numbers`**: Connects virtual numbers to specific agents.
6.  **`dashboard_stats`**: Security-invoker SQL view calculating real-time aggregated metrics per profile.

---

## 💻 Getting Started Locally

### 1. Prerequisites
Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, for local DB development)

### 2. Environment Setup
Clone the repository, then create a local `.env` file based on `.env.example`:
```bash
SUPABASE_PROJECT_ID="your-project-id"
SUPABASE_PUBLISHABLE_KEY="your-anon-key"
SUPABASE_URL="https://your-project.supabase.co"
```

### 3. Installation
Install project dependencies:
```bash
npm install
```

### 4. Run Development Server
Start the local server:
```bash
npm run dev
```
Open [http://localhost:8081](http://localhost:8081) in your browser to view and test the application.

---

## 🔮 Production Roadmap

To fully scale Vani into an active calling platform, implementation of the following components is required:
1.  **Voice Engine Integration**: Connect a low-latency WebSockets orchestrator (such as **Vapi** or **Retell AI**) combining STT (Deepgram), fast LLMs (Groq / OpenAI), and TTS (Cartesia / ElevenLabs).
2.  **Telephony Bridge**: Map Twilio/Plivo numbers to webhook endpoints that stream call audio to the voice orchestrator.
3.  **pgvector Semantic RAG**: Enable pgvector on Supabase to index document chunks from the `knowledge_base` table, enabling the agent to search business FAQs dynamically.
4.  **WebRTC Client**: Build browser-based calling using WebRTC SDKs directly on the Agent management screen.
