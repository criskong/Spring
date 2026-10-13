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

// ─── ERRORI ───

// Il backend risponde con { "error": "messaggio" }: se c'è lo uso, altrimenti il messaggio di default
async function getErrorMessage(res, fallback) {
    try {
        const data = await res.json();
        return data.error || fallback;
    } catch {
        return fallback;
    }
}

// Se il token è scaduto o non valido torna alla schermata di login
function checkSession(res) {
    if (res.status === 401) {
        removeToken();
        showAuth();
        throw new Error('Sessione scaduta, effettua di nuovo il login');
    }
}

// ─── AUTH ───

async function apiRegister(username, email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: publicHeaders(),
        body: JSON.stringify({ username, email, password })
    });
    if (!res.ok) throw new Error(await getErrorMessage(res, 'Errore registrazione'));
    return res.json();
}

async function apiLogin(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: publicHeaders(),
        body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error(await getErrorMessage(res, 'Credenziali non valide'));
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
    checkSession(res);
    if (!res.ok) throw new Error(await getErrorMessage(res, 'Errore caricamento eventi'));
    return res.json();
}

async function apiCreateEvent(eventData) {
    const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(eventData)
    });
    checkSession(res);
    if (!res.ok) throw new Error(await getErrorMessage(res, 'Errore creazione evento'));
    return res.json();
}

async function apiUpdateEvent(id, eventData) {
    const res = await fetch(`${API_BASE}/events/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(eventData)
    });
    checkSession(res);
    if (!res.ok) throw new Error(await getErrorMessage(res, 'Errore modifica evento'));
    return res.json();
}

async function apiDeleteEvent(id) {
    const res = await fetch(`${API_BASE}/events/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    checkSession(res);
    if (!res.ok) throw new Error(await getErrorMessage(res, 'Errore eliminazione evento'));
    return res.json();
}