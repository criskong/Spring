// ─── STATO ───

let currentDate = new Date();
let miniDate = new Date();
let allEvents = [];
let currentView = 'month'; // 'month', 'week' oppure 'day'

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

// Lunedì della settimana che contiene la data
function getWeekStart(date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dow = d.getDay() === 0 ? 6 : d.getDay() - 1; // Lunedì = 0, Domenica = 6
    d.setDate(d.getDate() - dow);
    return d;
}

function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
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

// Disegna la vista attiva (mese, settimana o giorno)
function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const timeView = document.getElementById('time-view');

    // Rimuovi solo le celle (non le label dei giorni)
    grid.querySelectorAll('.day-cell').forEach(c => c.remove());

    if (currentView === 'month') {
        grid.classList.remove('hidden');
        timeView.classList.add('hidden');
        renderMonthGrid(grid);
    } else {
        // Settimana e giorno usano la stessa griglia oraria: cambia solo il numero di giorni
        grid.classList.add('hidden');
        timeView.classList.remove('hidden');

        if (currentView === 'week') {
            const start = getWeekStart(currentDate);
            renderTimeView([0, 1, 2, 3, 4, 5, 6].map(i => addDays(start, i)));
        } else {
            renderTimeView([currentDate]);
        }
    }

    renderTitle();
    renderMiniCalendar();
}

function renderTitle() {
    const title = document.getElementById('month-title');

    if (currentView === 'month') {
        title.textContent = formatMonthYear(currentDate);

    } else if (currentView === 'week') {
        // Es. "12 – 18 ottobre 2026"
        const start = getWeekStart(currentDate);
        const end = addDays(start, 6);
        const startText = start.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
        const endText = end.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
        title.textContent = `${startText} – ${endText}`;

    } else {
        // Es. "Martedì 13 ottobre 2026"
        const text = currentDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        title.textContent = capitalize(text);
    }
}

function renderMonthGrid(grid) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

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
}

// ─── VISTA SETTIMANA E GIORNO (GRIGLIA ORARIA) ───

const HOUR_HEIGHT = 60; // altezza in pixel di un'ora nella griglia

// Disegna la griglia oraria con una colonna per ogni giorno (7 per la settimana, 1 per il giorno)
function renderTimeView(days) {
    const header = document.getElementById('time-header');
    const allDayRow = document.getElementById('time-allday');
    const timeGrid = document.getElementById('time-grid');
    header.innerHTML = '';
    allDayRow.innerHTML = '';
    timeGrid.innerHTML = '';

    // Header e riga "tutto il giorno" sono griglie CSS: 60px per le ore + una colonna per giorno
    const columnsTemplate = `60px repeat(${days.length}, 1fr)`;
    header.style.gridTemplateColumns = columnsTemplate;
    allDayRow.style.gridTemplateColumns = columnsTemplate;

    // Nella vista giorno la data è già nel titolo: l'header serve solo per la settimana
    header.classList.toggle('hidden', days.length === 1);

    header.appendChild(document.createElement('div')); // spazio sopra la colonna delle ore
    allDayRow.innerHTML = `<div class="allday-title">Tutto il giorno</div>`;
    let hasAllDay = false;

    days.forEach(day => {
        // Intestazione del giorno (es. "mar 13"): cliccandola apri la vista giorno
        const dayHeader = document.createElement('div');
        dayHeader.className = 'time-day-header';
        if (isSameDay(day, new Date())) dayHeader.classList.add('today');
        dayHeader.innerHTML = `
            <span class="weekday">${day.toLocaleDateString('it-IT', { weekday: 'short' })}</span>
            <span class="day-number">${day.getDate()}</span>
        `;
        dayHeader.addEventListener('click', () => {
            currentDate = new Date(day);
            setView('day');
        });
        header.appendChild(dayHeader);

        // Eventi "tutto il giorno" di questa giornata
        const cell = document.createElement('div');
        cell.className = 'allday-cell';
        getEventsForDay(day).filter(ev => ev.allDay).forEach(ev => {
            cell.appendChild(createTimeEventBlock(ev));
            hasAllDay = true;
        });
        allDayRow.appendChild(cell);
    });

    allDayRow.classList.toggle('hidden', !hasAllDay);

    // Contenitore alto 24 ore: righe delle ore + colonne dei giorni
    const inner = document.createElement('div');
    inner.className = 'timeline-inner';
    inner.style.height = `${24 * HOUR_HEIGHT}px`;
    timeGrid.appendChild(inner);

    for (let hour = 0; hour < 24; hour++) {
        const row = document.createElement('div');
        row.className = 'hour-row';
        row.style.top = `${hour * HOUR_HEIGHT}px`;
        row.style.height = `${HOUR_HEIGHT}px`;
        row.innerHTML = `<span class="hour-label">${String(hour).padStart(2, '0')}:00</span>`;
        inner.appendChild(row);
    }

    let firstHour = 24;
    days.forEach((day, i) => {
        const column = createTimeColumn(day);
        column.style.left = `calc(60px + (100% - 60px) * ${i / days.length})`;
        column.style.width = `calc((100% - 60px) / ${days.length})`;
        inner.appendChild(column);

        getEventsForDay(day).filter(ev => !ev.allDay).forEach(ev => {
            firstHour = Math.min(firstHour, new Date(ev.startTime).getHours());
        });
    });

    // Scorri fino al primo evento (o alle 8:00 se non ce ne sono).
    // requestAnimationFrame aspetta che il browser abbia disegnato la griglia,
    // altrimenti lo scroll non ha effetto
    const scrollHour = firstHour === 24 ? 8 : Math.max(0, firstHour - 1);
    requestAnimationFrame(() => {
        timeGrid.scrollTop = scrollHour * HOUR_HEIGHT;
    });
}

// Colonna di un giorno nella griglia oraria, con i suoi eventi
function createTimeColumn(day) {
    const column = document.createElement('div');
    column.className = 'time-col';
    if (isSameDay(day, new Date())) column.classList.add('today');

    // Click su uno spazio vuoto = nuovo evento all'ora cliccata
    column.addEventListener('click', (e) => {
        const hour = Math.floor(e.offsetY / HOUR_HEIGHT);
        openEventModal(day, null, hour);
    });

    const events = getEventsForDay(day)
        .filter(ev => !ev.allDay)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    const columns = assignColumns(events);

    events.forEach((ev, i) => {
        const { startMin, endMin } = getEventMinutes(ev);

        // Quante sotto-colonne servono: guardo solo gli eventi che si sovrappongono a questo
        let total = columns[i] + 1;
        events.forEach((other, j) => {
            const o = getEventMinutes(other);
            if (o.startMin < endMin && o.endMin > startMin) total = Math.max(total, columns[j] + 1);
        });

        const block = createTimeEventBlock(ev);
        block.style.top = `${startMin / 60 * HOUR_HEIGHT}px`;
        // Almeno mezz'ora di altezza, così anche gli eventi brevi si leggono
        block.style.height = `${Math.max(endMin - startMin, 30) / 60 * HOUR_HEIGHT}px`;
        // Eventi sovrapposti affiancati dentro la colonna del giorno
        block.style.left = `${columns[i] / total * 100}%`;
        block.style.width = `calc(${100 / total}% - 4px)`;
        column.appendChild(block);
    });

    // Linea rossa sull'ora attuale, solo nella colonna di oggi
    const now = new Date();
    if (isSameDay(day, now)) {
        const line = document.createElement('div');
        line.className = 'now-line';
        line.style.top = `${(now.getHours() * 60 + now.getMinutes()) / 60 * HOUR_HEIGHT}px`;
        column.appendChild(line);
    }

    return column;
}

// Minuti dall'inizio della giornata per inizio e fine dell'evento (es. 09:30 = 570)
function getEventMinutes(ev) {
    const start = new Date(ev.startTime);
    const startMin = start.getHours() * 60 + start.getMinutes();

    // Senza fine considero un'ora; se finisce un altro giorno lo taglio a mezzanotte
    if (!ev.endTime) return { startMin, endMin: startMin + 60 };
    const end = new Date(ev.endTime);
    const endMin = isSameDay(start, end) ? end.getHours() * 60 + end.getMinutes() : 24 * 60;
    return { startMin, endMin };
}

// Eventi che si sovrappongono vanno affiancati: a ogni evento (già ordinato per inizio)
// assegno la prima colonna libera, cioè dove l'evento precedente è già finito
function assignColumns(events) {
    const columnEnds = []; // per ogni colonna, il minuto in cui finisce il suo ultimo evento

    return events.map(ev => {
        const { startMin, endMin } = getEventMinutes(ev);
        let column = columnEnds.findIndex(end => end <= startMin);
        if (column === -1) column = columnEnds.length;
        columnEnds[column] = Math.max(endMin, startMin + 30);
        return column;
    });
}

// Blocco colorato di un evento nella griglia oraria
function createTimeEventBlock(ev) {
    const color = ev.color || '#3b82f6';
    const block = document.createElement('div');
    block.className = 'day-event';
    block.style.borderLeftColor = color;
    block.style.backgroundColor = color + '33';

    block.innerHTML = `
        <div class="title">${escapeHtml(ev.title)}</div>
        <div class="time">${formatEventTime(ev)}</div>
        ${ev.description ? `<div class="desc">${escapeHtml(ev.description)}</div>` : ''}
    `;

    block.addEventListener('click', (e) => {
        e.stopPropagation(); // non far partire il click sulla colonna (nuovo evento)
        openEventModal(new Date(ev.startTime), ev);
    });
    return block;
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
    // Click sul numero = apri la vista giorno
    num.addEventListener('click', (e) => {
        e.stopPropagation();
        currentDate = new Date(date);
        setView('day');
    });
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

    // Click su cella: su mobile mostra il day modal se ci sono eventi, altrimenti nuovo evento
    cell.addEventListener('click', () => {
        if (window.innerWidth <= 480 && dayEvents.length > 0) {
            openDayModal(date, dayEvents);
        } else {
            openEventModal(date);
        }
    });

    return cell;
}

// ─── NAVIGAZIONE ───

function setView(view) {
    currentView = view;
    document.querySelectorAll('.vt-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.view === view);
    });
    renderCalendar();
}

// Sposta avanti o indietro di un mese, una settimana o un giorno in base alla vista
function changePeriod(direction) {
    if (currentView === 'month') {
        // Mi metto al giorno 1 così passando da 31 gennaio non salto a marzo
        currentDate.setDate(1);
        currentDate.setMonth(currentDate.getMonth() + direction);
    } else if (currentView === 'week') {
        currentDate = addDays(currentDate, 7 * direction);
    } else {
        currentDate = addDays(currentDate, direction);
    }
    renderCalendar();
}

function prevPeriod() {
    changePeriod(-1);
}

function nextPeriod() {
    changePeriod(1);
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

    // Click su un giorno = sposta il calendario principale su quella data
    div.addEventListener('click', () => {
        currentDate = new Date(date);
        showCalendar();
    });

    return div;
}

function miniPrev() {
    miniDate.setDate(1);
    miniDate.setMonth(miniDate.getMonth() - 1);
    renderMiniCalendar();
}

function miniNext() {
    miniDate.setDate(1);
    miniDate.setMonth(miniDate.getMonth() + 1);
    renderMiniCalendar();
}

// ─── CARICA EVENTI ───

async function loadEvents() {
    try {
        allEvents = await apiGetEvents();

        // Aggiorna la schermata che l'utente sta guardando
        const listOpen = !document.getElementById('event-list-view').classList.contains('hidden');
        if (listOpen) {
            renderEventList();
            renderMiniCalendar();
        } else {
            renderCalendar();
        }
    } catch (e) {
        console.error('Errore caricamento eventi:', e);
    }
}