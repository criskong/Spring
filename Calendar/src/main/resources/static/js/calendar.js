// ─── STATO ───

let currentDate = new Date();
let miniDate = new Date();
let allEvents = [];

// ─── UTILITIES ───

function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}

function getEventsForDay(date) {
    return allEvents.filter(e => {
        const start = new Date(e.startTime);
        return isSameDay(start, date);
    });
}

function formatMonthYear(date) {
    return date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
               .replace(/^\w/, c => c.toUpperCase());
}

function formatDatetimeLocal(date) {
    const pad = n => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function darkenColor(hex, amount = 30) {
    let r = parseInt(hex.slice(1,3), 16);
    let g = parseInt(hex.slice(3,5), 16);
    let b = parseInt(hex.slice(5,7), 16);
    r = Math.max(0, r - amount);
    g = Math.max(0, g - amount);
    b = Math.max(0, b - amount);
    return `rgb(${r},${g},${b})`;
}

// ─── RENDER CALENDARIO PRINCIPALE ───

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const title = document.getElementById('month-title');

    title.textContent = formatMonthYear(currentDate);

    // Rimuovi solo le celle (non le label dei giorni)
    const cells = grid.querySelectorAll('.day-cell');
    cells.forEach(c => c.remove());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();

    // Lunedì = 0, Domenica = 6
    let startDow = firstDay.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1;

    // Giorni del mese precedente
    for (let i = startDow - 1; i >= 0; i--) {
        const d = new Date(year, month, -i);
        grid.appendChild(createDayCell(d, true));
    }

    // Giorni del mese corrente
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const d = new Date(year, month, i);
        grid.appendChild(createDayCell(d, false));
    }

    // Giorni del mese successivo
    let endDow = lastDay.getDay();
    endDow = endDow === 0 ? 6 : endDow - 1;
    for (let i = 1; i < 7 - endDow; i++) {
        const d = new Date(year, month + 1, i);
        grid.appendChild(createDayCell(d, true));
    }

    renderMiniCalendar();
}

function createDayCell(date, otherMonth) {
    const today = new Date();
    const cell = document.createElement('div');
    cell.className = 'day-cell';

    if (otherMonth) cell.classList.add('other-month');
    if (isSameDay(date, today)) cell.classList.add('today');

    // Numero giorno
    const num = document.createElement('div');
    num.className = 'day-num';
    num.textContent = date.getDate();
    cell.appendChild(num);

    // Eventi del giorno
    const dayEvents = getEventsForDay(date);

    if (dayEvents.length > 0) {
        cell.classList.add('has-events');
    }

    dayEvents.forEach(ev => {
        const chip = document.createElement('div');
        chip.className = 'event-chip';
        chip.textContent = ev.title;

        const color = ev.color || '#3b82f6';
        chip.style.borderLeftColor = color;
        chip.style.color = color;
        chip.style.backgroundColor = color + '22';

        chip.addEventListener('click', (e) => {
            e.stopPropagation();
            openEventModal(date, ev);
        });

        cell.appendChild(chip);
    });

    // Click su cella = nuovo evento
    cell.addEventListener('click', () => openEventModal(date));

    return cell;
}

// ─── NAVIGAZIONE MESE ───

function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

function goToday() {
    currentDate = new Date();
    renderCalendar();
}

// ─── MINI CALENDARIO ───

function renderMiniCalendar() {
    document.getElementById('mini-month-label').textContent = formatMonthYear(miniDate);

    const container = document.getElementById('mini-cal-days');
    container.innerHTML = '';

    const year = miniDate.getFullYear();
    const month = miniDate.getMonth();
    const today = new Date();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDow = firstDay.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1;

    // Mese precedente
    for (let i = startDow - 1; i >= 0; i--) {
        const d = new Date(year, month, -i);
        container.appendChild(createMiniDay(d, true));
    }

    // Mese corrente
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const d = new Date(year, month, i);
        container.appendChild(createMiniDay(d, false));
    }

    // Mese successivo
    let endDow = lastDay.getDay();
    endDow = endDow === 0 ? 6 : endDow - 1;
    for (let i = 1; i < 7 - endDow; i++) {
        const d = new Date(year, month + 1, i);
        container.appendChild(createMiniDay(d, true));
    }
}

function createMiniDay(date, otherMonth) {
    const today = new Date();
    const div = document.createElement('div');
    div.className = 'mini-day';
    if (otherMonth) div.classList.add('other-month');
    if (isSameDay(date, today)) div.classList.add('today');
    div.textContent = date.getDate();

cell.addEventListener('click', () => {
    const dayEvents = getEventsForDay(date);
    // Su mobile mostra il day modal se ci sono eventi
    if (window.innerWidth <= 480 && dayEvents.length > 0) {
        openDayModal(date, dayEvents);
    } else {
        openEventModal(date);
    }
});

    return div;
}

function miniPrev() {
    miniDate.setMonth(miniDate.getMonth() - 1);
    renderMiniCalendar();
}

function miniNext() {
    miniDate.setMonth(miniDate.getMonth() + 1);
    renderMiniCalendar();
}

// ─── CARICA EVENTI ───

async function loadEvents() {
    try {
        allEvents = await apiGetEvents();
        renderCalendar();
    } catch (e) {
        console.error('Errore caricamento eventi:', e);
    }
}