# TWChallengeRepo

# LLM Prompt Library

A simple full-stack application where users can discover, create, manage, and share reusable AI prompts.

Built as part of the TwoWay full-stack coding challenge.

## Tech Stack

- **Backend:** Node.js, Express 5, JavaScript
- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Authentication:** Email/password with hashed passwords and sessions
- **Storage:** In-memory arrays

## Features

- Register, log in, and log out
- Create, read, update, and delete prompts
- Search prompts by title or content (case-insensitive)
- Filter prompts by tags
- Pagination
- Copy prompts to clipboard
- Share prompts using direct URLs
- Restrict editing and deletion to the prompt author

## Requirements

- Node.js 22+
- npm
- Modern web browser

## Installation

Clone the repository:

```bash
git clone <your-repository-url>
cd TWChallengeRepo
```

Install dependencies:

```bash
npm install
```

Start the application:

```bash
node server.js
```

Open **http://localhost:3000** in your browser.

## REST API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/prompts` | List, search, and filter prompts |
| GET | `/api/prompts/:id` | Get prompt details |
| GET | `/api/tags` | Retrieve available tags |
| POST | `/api/prompts` | Create a prompt |
| PUT | `/api/prompts/:id` | Update a prompt |
| DELETE | `/api/prompts/:id` | Delete a prompt |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Get current user |

Example search:

```text
GET /api/prompts?q=coding&tag=work&page=1&limit=10
```

## Project Structure

```text
TWChallengeRepo/
├── server.js
├── public/
│   └── index.html
├── package.json
└── README.md
```

## Limitations and Improvements

Due to the time constraint, the application uses in-memory storage, meaning data resets when the server restarts.

With more time, I would:

- Add SQLite or PostgreSQL for persistent storage.
- Add automated API tests and linting.
- Improve session security for production.
- Add GitHub Actions for CI/CD.
- Improve the frontend with Angular.

## Development Approach

The main priority was implementing the essential features using a simple, understandable REST architecture while keeping the code easy to maintain and extend.


# **LLM Prompt Library**

<aside>
💡

**Mission:** Build a mini “Pinterest‑for‑prompts” where people can save, search, and share their favorite LLM prompts.

</aside>

## 1 · Goal 🎯

> Deliver a snappy full‑stack web app that lets authenticated users create, read, update, and delete prompts, filter by tags, and copy a prompt to the clipboard.
> 
> 
> Your focus: clear code, thoughtful data modelling, and a smooth developer experience (DX).
> 

## 2 · Core Requirements 🧩

| 🛠 Area | ✅ Must‑Have Features |
| --- | --- |
| **Data model** | `Prompt` with fields: `id`, `title`, `body`, `tags[]`, `authorId`, `createdAt`, `updatedAt`. |
| **Backend** | REST **or** GraphQL API exposing CRUD for prompts + tag list. Case‑insensitive full‑text search across `title` & `body`. |
| **Auth** | Simple email + password or magic‑link. Keep it secure but minimal. |
| **Frontend** | Responsive UI: • All‑prompts list with tag filters • Prompt detail page with **Copy** button • Pagination or infinite scroll. |
| **DX / Quality** | One‑command dev start (`docker compose up`, `npm run dev`, etc.). Lint + format. ≥ 1 happy‑path test (unit or e2e). |

## 3 · Stretch Goals 🚀 *(Optional – earn extra credit)*

| 🌟 Category | 💡 Ideas |
| --- | --- |
| **Auth** | Social login (Google/GitHub), avatars |
| **Social** | 👍🏼 Up‑vote / ⭐ star a prompt; public shareable URLs |
| **Search** | External engine (Algolia, Meilisearch, …) < 100 ms |
| **Infra** | Deploy preview (Vercel/Netlify/…) on every PR |
| **UX** | Dark mode 🌙; keyboard shortcuts ⌨️; markdown editor ✍️ |

Pick whichever excites you—depth matters more than breadth.

## 4 · Submission Checklist ✅

- 📧 **Submit via email to `david@twoway.finance`**

> **Subject**: Prompt Library Challenge – <Your Name>
**Body**: 
- Github Repo URL
- Demo URL (if any)
- Notes
> 

## 5 · FAQ ❓

- **🤔 “Can I use framework X?”**
    
    Absolutely—choose whatever showcases your strengths. Just document why.
    
- 🛠 **“Do I need CI?”**
    
    Not required, but a simple GitHub Actions flow is 👌.
    
- ⏱ **“How long should I spend?”**
    
    We deliberately cap the exercise at **≈ 1 hour of focused coding**. We know that’s extremely short—**that’s the goal**. We want to see how you prioritise, make trade‑offs, and communicate under time pressure. Feel free to note what you’d improve or add with more time.
    

## Off you go !

Good luck **💪** We’re excited to see what you build!
