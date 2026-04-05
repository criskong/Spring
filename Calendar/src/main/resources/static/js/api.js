const API_BASE = '/api';

// ─── TOKEN ───

function getToken() {
    return localStorage.getItem('jwt_token');
}

function setToken(token) {
    localStorage.setItem('jwt_token', token);
}

function removeToken() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
}

function getUsername() {
    return localStorage.getItem('username');
}

function setUsername(username) {
    localStorage.setItem('username', username);
}

// ─── HEADERS ───

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
}

function publicHeaders() {
    return { 'Content-Type': 'application/json' };
}

// ─── AUTH ───

async function apiRegister(username, email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: publicHeaders(),
        body: JSON.stringify({ username, email, password })
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Errore registrazione');
    }
    return res.text();
}

async function apiLogin(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: publicHeaders(),
        body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
        throw new Error('Credenziali non valide');
    }
    const data = await res.json();
    setToken(data.token);
    setUsername(data.username);
    return data;
}

// ─── EVENTI ───

async function apiGetEvents() {
    const res = await fetch(`${API_BASE}/events`, {
        method: 'GET',
        headers: authHeaders()
    });
    if (res.status === 401) {
        removeToken();
        showAuth();
        throw new Error('Sessione scaduta');
    }
    if (!res.ok) throw new Error('Errore caricamento eventi');
    return res.json();
}

async function apiCreateEvent(eventData) {
    const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(eventData)
    });
    if (!res.ok) throw new Error('Errore creazione evento');
    return res.json();
}

async function apiUpdateEvent(id, eventData) {
    const res = await fetch(`${API_BASE}/events/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(eventData)
    });
    if (!res.ok) throw new Error('Errore modifica evento');
    return res.json();
}

async function apiDeleteEvent(id) {
    const res = await fetch(`${API_BASE}/events/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    if (!res.ok) throw new Error('Errore eliminazione evento');
    return res.text();
}