// ─── INIT ───

document.addEventListener('DOMContentLoaded', () => {
    if (getToken()) {
        showApp();
    } else {
        showAuth();
    }
});

// ─── AUTH SCREEN ───

function showAuth() {
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('app-screen').classList.add('hidden');
}

function showApp() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');
    loadEvents();
}

function switchTab(tab) {
    document.getElementById('form-login').classList.add('hidden');
    document.getElementById('form-register').classList.add('hidden');
    document.getElementById('tab-login').classList.remove('active');
    document.getElementById('tab-register').classList.remove('active');

    document.getElementById(`form-${tab}`).classList.remove('hidden');
    document.getElementById(`tab-${tab}`).classList.add('active');

    clearErrors();
}

function clearErrors() {
    ['login-error', 'reg-error', 'modal-error'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.textContent = '';
        }
    });
}

function showError(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.classList.remove('hidden');
}

// ─── LOGIN ───

async function handleLogin() {
    clearErrors();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        showError('login-error', 'Compila tutti i campi');
        return;
    }

    try {
        await apiLogin(username, password);
        showApp();
    } catch (e) {
        showError('login-error', e.message);
    }
}

// ─── REGISTER ───

async function handleRegister() {
    clearErrors();
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;

    if (!username || !email || !password) {
        showError('reg-error', 'Compila tutti i campi');
        return;
    }

    if (password.length < 6) {
        showError('reg-error', 'Password minimo 6 caratteri');
        return;
    }

    try {
        await apiRegister(username, email, password);
        // Auto-login dopo registrazione
        await apiLogin(username, password);
        showApp();
    } catch (e) {
        showError('reg-error', e.message);
    }
}

// Invio con Enter
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const loginForm = document.getElementById('form-login');
        const regForm = document.getElementById('form-register');
        if (!loginForm.classList.contains('hidden')) handleLogin();
        else if (!regForm.classList.contains('hidden')) handleRegister();
    }
});

// ─── LOGOUT ───

function logout() {
    removeToken();
    allEvents = [];
    showAuth();
}

// ─── SIDEBAR MOBILE ───

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('hidden');
}

// ─── MODAL EVENTO ───

let selectedColor = '#3b82f6';

function openEventModal(date, event = null) {
    clearErrors();
    selectedColor = '#3b82f6';

    // Reset colori
    document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
    document.querySelector('.color-dot[data-color="#3b82f6"]').classList.add('active');

    if (event) {
        // Modifica evento esistente
        document.getElementById('modal-title').textContent = 'Modifica evento';
        document.getElementById('event-id').value = event.id;
        document.getElementById('event-title').value = event.title;
        document.getElementById('event-desc').value = event.description || '';
        document.getElementById('event-start').value = event.startTime.slice(0, 16);
        document.getElementById('event-end').value = event.endTime ? event.endTime.slice(0, 16) : '';
        document.getElementById('event-allday').checked = event.allDay;

        selectedColor = event.color || '#3b82f6';
        const dot = document.querySelector(`.color-dot[data-color="${selectedColor}"]`);
        if (dot) {
            document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
        }

        toggleAllDay(document.getElementById('event-allday'));
        document.getElementById('btn-delete').classList.remove('hidden');

    } else {
        // Nuovo evento
        document.getElementById('modal-title').textContent = 'Nuovo evento';
        document.getElementById('event-id').value = '';
        document.getElementById('event-title').value = '';
        document.getElementById('event-desc').value = '';
        document.getElementById('event-allday').checked = false;
        document.getElementById('btn-delete').classList.add('hidden');

        if (date) {
            const start = new Date(date);
            start.setHours(9, 0, 0, 0);
            const end = new Date(date);
            end.setHours(10, 0, 0, 0);
            document.getElementById('event-start').value = formatDatetimeLocal(start);
            document.getElementById('event-end').value = formatDatetimeLocal(end);
        } else {
            document.getElementById('event-start').value = '';
            document.getElementById('event-end').value = '';
        }
    }

    document.getElementById('event-modal').classList.remove('hidden');
    setTimeout(() => document.getElementById('event-title').focus(), 100);
}

function closeEventModal() {
    document.getElementById('event-modal').classList.add('hidden');
    clearErrors();
}

// Chiudi modal con ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeEventModal();
});

// Chiudi modal cliccando overlay
document.getElementById('event-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('event-modal')) closeEventModal();
});

function selectColor(dot) {
    document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
    selectedColor = dot.dataset.color;
}

function toggleAllDay(checkbox) {
    const startInput = document.getElementById('event-start');
    const endInput = document.getElementById('event-end');

    if (checkbox.checked) {
        if (startInput.value) {
            startInput.value = startInput.value.slice(0, 10) + 'T00:00';
        }
        endInput.value = '';
        endInput.disabled = true;
        startInput.type = 'date';
    } else {
        startInput.type = 'datetime-local';
        endInput.disabled = false;
    }
}

// ─── SALVA EVENTO ───

async function saveEvent() {
    clearErrors();

    const id = document.getElementById('event-id').value;
    const title = document.getElementById('event-title').value.trim();
    const desc = document.getElementById('event-desc').value.trim();
    const startRaw = document.getElementById('event-start').value;
    const endRaw = document.getElementById('event-end').value;
    const allDay = document.getElementById('event-allday').checked;

    if (!title) {
        showError('modal-error', 'Il titolo è obbligatorio');
        return;
    }

    if (!startRaw) {
        showError('modal-error', 'La data di inizio è obbligatoria');
        return;
    }

    const eventData = {
        title,
        description: desc || null,
        startTime: allDay ? `${startRaw.slice(0,10)}T00:00:00` : startRaw + ':00',
        endTime: endRaw ? (allDay ? null : endRaw + ':00') : null,
        allDay,
        color: selectedColor
    };

    try {
        if (id) {
            await apiUpdateEvent(id, eventData);
        } else {
            await apiCreateEvent(eventData);
        }
        closeEventModal();
        await loadEvents();
    } catch (e) {
        showError('modal-error', e.message);
    }
}

// ─── ELIMINA EVENTO ───

async function deleteEvent() {
    const id = document.getElementById('event-id').value;
    if (!id) return;

    if (!confirm('Sei sicuro di voler eliminare questo evento?')) return;

    try {
        await apiDeleteEvent(id);
        closeEventModal();
        await loadEvents();
    } catch (e) {
        showError('modal-error', e.message);
    }

    // ─── VISTA LISTA ───

let currentDaySelected = null;

function showEventList() {
    document.getElementById('calendar-grid').classList.add('hidden');
    document.getElementById('event-list-view').classList.remove('hidden');
    document.getElementById('btn-list').classList.add('active');
    document.querySelector('.nav-btn.active:not(#btn-list)')?.classList.remove('active');

    renderEventList();

    // Chiudi sidebar su mobile
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('open')) toggleSidebar();
}

function showCalendar() {
    document.getElementById('calendar-grid').classList.remove('hidden');
    document.getElementById('event-list-view').classList.add('hidden');
    document.getElementById('btn-list').classList.remove('active');
}

function renderEventList() {
    const container = document.getElementById('event-list-container');
    container.innerHTML = '';

    if (allEvents.length === 0) {
        container.innerHTML = `<div class="event-list-empty">Nessun evento programmato.<br>Clicca su un giorno per aggiungerne uno!</div>`;
        return;
    }

    // Ordina per data
    const sorted = [...allEvents].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    sorted.forEach(ev => {
        const start = new Date(ev.startTime);
        const item = document.createElement('div');
        item.className = 'event-list-item';
        item.style.borderLeftColor = ev.color || '#3b82f6';

        const day = start.getDate();
        const month = start.toLocaleDateString('it-IT', { month: 'short' });
        const time = ev.allDay ? 'Tutto il giorno' : start.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

        item.innerHTML = `
            <div class="event-list-date">
                <div class="day">${day}</div>
                <div class="month">${month}</div>
            </div>
            <div class="event-list-info">
                <div class="title">${ev.title}</div>
                <div class="time">${time}${ev.description ? ' — ' + ev.description : ''}</div>
            </div>
        `;

        item.addEventListener('click', () => openEventModal(start, ev));
        container.appendChild(item);
    });
}

// ─── DAY MODAL ───

function openDayModal(date, events) {
    currentDaySelected = date;
    const title = date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
    document.getElementById('day-modal-title').textContent = title.charAt(0).toUpperCase() + title.slice(1);

    const body = document.getElementById('day-modal-body');
    body.innerHTML = '';

    if (events.length === 0) {
        body.innerHTML = `<div class="day-empty">Nessun evento per questo giorno.</div>`;
    } else {
        events.forEach(ev => {
            const item = document.createElement('div');
            item.className = 'day-event-item';
            item.style.borderLeftColor = ev.color || '#3b82f6';

            const start = new Date(ev.startTime);
            const time = ev.allDay ? 'Tutto il giorno' : start.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

            item.innerHTML = `
                <div class="day-event-info">
                    <div class="title">${ev.title}</div>
                    <div class="time">${time}</div>
                </div>
            `;

            item.addEventListener('click', () => {
                closeDayModal();
                openEventModal(date, ev);
            });

            body.appendChild(item);
        });
    }

    document.getElementById('day-modal').classList.remove('hidden');
}

function closeDayModal() {
    document.getElementById('day-modal').classList.add('hidden');
}
}