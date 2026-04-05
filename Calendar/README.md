# 📅 CalendarApp

Web application per la gestione di impegni personali, sviluppata con **Spring Boot** e **MySQL**.

🌐 **App live**: [https://calendar-ae4i.onrender.com](https://calendar-ae4i.onrender.com)

> ℹ️ Il servizio è hostato su piano gratuito — al primo accesso dopo un periodo di inattività potrebbe impiegare 1-2 minuti per avviarsi.

## 🚀 Tech Stack

- **Backend**: Java 17, Spring Boot 4, Spring Security, JWT
- **Database**: MySQL 8 (Clever Cloud)
- **Frontend**: HTML5, CSS3, JavaScript (vanilla)
- **ORM**: Hibernate / Spring Data JPA
- **Build**: Maven
- **Deploy**: Render (backend + frontend) + Clever Cloud (database)

## ✨ Funzionalità

- 🔐 Registrazione e login con autenticazione JWT
- 📅 Vista calendario mensile interattiva
- ➕ Creazione eventi con titolo, descrizione, orario e colore
- ✏️ Modifica ed eliminazione eventi
- 🎨 6 colori personalizzabili per gli eventi
- 📱 Responsive — funziona su mobile e desktop
- 🔒 Ogni utente vede solo i propri eventi

## 🏗️ Architettura

```
src/main/java/Calendar/demo/
├── config/          ← Spring Security + JWT Filter
├── controller/      ← REST API endpoints
├── dto/             ← Data Transfer Objects
├── model/           ← Entity JPA (User, Event)
├── repository/      ← Spring Data JPA
└── service/         ← Business logic

src/main/resources/static/
├── index.html
├── css/
│   └── style.css
└── js/
    ├── api.js       ← chiamate REST API
    ├── calendar.js  ← logica calendario
    └── app.js       ← gestione UI
```

## ⚙️ Installazione locale

### Prerequisiti
- Java 17+
- Maven
- MySQL 8+

### 1. Clona il repo
```bash
git clone https://github.com/criskong/Spring.git
cd Spring/Calendar
```

### 2. Crea il database
```sql
CREATE DATABASE calendar_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configura le credenziali
Crea il file `src/main/resources/application-local.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/calendar_db
spring.datasource.username=TUO_USERNAME
spring.datasource.password=TUA_PASSWORD
jwt.secret=chiave-segreta-lunga-almeno-256bit
jwt.expiration=86400000
```

### 4. Avvia l'app
```bash
./mvnw spring-boot:run
```

### 5. Apri il browser
```
http://localhost:8080
```

## 🔌 API Endpoints

| Metodo | Endpoint | Descrizione | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrazione | No |
| POST | `/api/auth/login` | Login → JWT token | No |
| GET | `/api/events` | Lista eventi utente | Sì |
| POST | `/api/events` | Crea evento | Sì |
| PUT | `/api/events/{id}` | Modifica evento | Sì |
| DELETE | `/api/events/{id}` | Elimina evento | Sì |

## 🔐 Sicurezza

- Password hashate con **BCrypt**
- Autenticazione **stateless** tramite JWT
- Ogni richiesta autenticata viene validata dal `JwtAuthFilter`
- Ogni utente accede **solo ai propri dati**
- Credenziali mai esposte nel codice — gestite tramite variabili d'ambiente

## ☁️ Deploy

| Componente | Servizio | Piano |
|------------|----------|-------|
| Backend + Frontend | Render | Free |
| Database MySQL | Clever Cloud | DEV (Free) |

## 👨‍💻 Autore

**Antonio Criscuolo** — [GitHub](https://github.com/criskong)