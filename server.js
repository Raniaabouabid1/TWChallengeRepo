import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import path from 'node:path';

const app = express();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', secure: false }
}));

app.use(express.static(path.join(import.meta.dirname, 'public')));
// Temporary in-memory data
const users = [
    {
        id: 'demo',
        email: 'demo@gmail.com',
        passwordHash: hashPassword('demopassword')
    },
];
const prompts = [
    {
        id: '1',
        title: 'Meeting recap',
        body: 'Summarize meeting notes into action items.',
        tags: ['work'],
        authorId: 'demo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '2',
        title: 'Code Review',
        body: 'Review this code and identify possible bugs.',
        tags: ['coding'],
        authorId: 'demo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
    ,
    {
        id: '3',
        title: 'monitor Dashboard',
        body: 'im monitoring dashboards for my project and i need to find a way to make it more efficient.',
        tags: ['monitoring', 'dashboard'],
        authorId: 'demo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// Helpers
function hashPassword(password, salt = randomBytes(16).toString('hex')) {
    return salt + ':' + scryptSync(password, salt, 64).toString('hex');
}

function checkPassword(password, saved) {
    const [salt, hash] = saved.split(':');
    return timingSafeEqual(
        scryptSync(password, salt, 64),
        Buffer.from(hash, 'hex')
    );
}

function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Login required' });
    }
    next();
}

function validatePrompt({ title, body, tags }) {
    return typeof title === 'string' && title.trim().length > 0 &&
        typeof body === 'string' && body.trim().length > 0 &&
        Array.isArray(tags) && tags.every(t => typeof t === 'string');
}

// AUTHENTICATION
app.post('/api/auth/register', (req, res) => {
    const { email, password } = req.body || {};

    if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) ||
        typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ error: 'Valid email and password (8+ characters) required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (users.some(u => u.email === normalizedEmail)) {
        return res.status(409).json({ error: 'Email already registered' });
    }

    const user = {
        id: randomUUID(),
        email: normalizedEmail,
        passwordHash: hashPassword(password)
    };

    users.push(user);
    req.session.userId = user.id;

    res.status(201).json({ id: user.id, email: user.email });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body || {};

    const user = typeof email === 'string' &&
        users.find(u => u.email === email.trim().toLowerCase());

    if (!user || typeof password !== 'string' ||
        !checkPassword(password, user.passwordHash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.regenerate(err => {
        if (err) return res.status(500).json({ error: 'Session error' });
        req.session.userId = user.id;
        res.json({ id: user.id, email: user.email });
    });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
    const user = users.find(u => u.id === req.session.userId);
    res.json({ id: user.id, email: user.email });
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Logout failed' });
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out' });
    });
});

// GET ALL + SEARCH + TAG FILTER + PAGINATION
app.get('/api/prompts', (req, res) => {
    const search = String(req.query.q ?? req.query.search ?? '')
        .trim()
        .toLowerCase();
    const tag = String(req.query.tag ?? '').trim().toLowerCase();

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

    const filtered = prompts.filter(p => {
        const matchesSearch =
            p.title.toLowerCase().includes(search) ||
            p.body.toLowerCase().includes(search);

        const matchesTag =
            !tag || p.tags.some(t => t.toLowerCase() === tag);

        return matchesSearch && matchesTag;
    });

    const start = (page - 1) * limit;

    res.json({
        items: filtered.slice(start, start + limit),
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / limit)
    });
});

// GET ALL TAGS
app.get('/api/tags', (req, res) => {
    res.json([...new Set(prompts.flatMap(p => p.tags))]);
});

// GET ONE PROMPT
app.get('/api/prompts/:id', (req, res) => {
    const prompt = prompts.find(p => p.id === req.params.id);

    if (!prompt) {
        return res.status(404).json({ error: 'Prompt not found' });
    }

    res.json(prompt);
});

// CREATE PROMPT
app.post('/api/prompts', requireAuth, (req, res) => {
    if (!validatePrompt(req.body || {})) {
        return res.status(400).json({ error: 'Title, body and tags[] required' });
    }

    const now = new Date().toISOString();

    const prompt = {
        id: randomUUID(),
        title: req.body.title.trim(),
        body: req.body.body.trim(),
        tags: req.body.tags.map(t => t.trim()).filter(Boolean),
        authorId: req.session.userId,
        createdAt: now,
        updatedAt: now
    };

    prompts.push(prompt);
    res.status(201).json(prompt);
});

// UPDATE PROMPT
app.put('/api/prompts/:id', requireAuth, (req, res) => {
    const prompt = prompts.find(p => p.id === req.params.id);

    if (!prompt) {
        return res.status(404).json({ error: 'Prompt not found' });
    }

    if (prompt.authorId !== req.session.userId) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    if (!validatePrompt(req.body || {})) {
        return res.status(400).json({ error: 'Title, body and tags[] required' });
    }

    Object.assign(prompt, {
        title: req.body.title.trim(),
        body: req.body.body.trim(),
        tags: req.body.tags.map(t => t.trim()).filter(Boolean),
        updatedAt: new Date().toISOString()
    });

    res.json(prompt);
});

// DELETE PROMPT
app.delete('/api/prompts/:id', requireAuth, (req, res) => {
    const index = prompts.findIndex(p => p.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ error: 'Prompt not found' });
    }

    if (prompts[index].authorId !== req.session.userId) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    prompts.splice(index, 1);
    res.status(204).end();
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});