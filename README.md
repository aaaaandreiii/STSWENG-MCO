# STSWENG-MCO: TableTango – Secure Event Tracker & Venue Booking

TableTango is a role-based event management web app built with Node.js, Express, Handlebars, and MongoDB.  
It helps a catering/venue team manage bookings end-to-end: pencil bookings, reservations, past and cancelled events, receipts, and analytics – all behind authentication and fine-grained RBAC.   

> **Security-focused:** the app includes account lockout, rate-limited login, CSRF protection, secure session cookies, audit logging, and a CI pipeline that runs tests, coverage, linting, and `npm audit` on every push.   

---

## Features

### Core event management
- **Today’s events dashboard** – view all non-cancelled events happening today, including related packages and food items.   
- **Create & edit events** – full event form for venue, time, menu, packages, charges, and discounts.   
- **Event lifecycle** – mark events as:
  - **Pencil bookings** (booked but not yet reserved)   
  - **Reservations** :contentReference[oaicite:5]{index=5}  
  - **Finished (Past Events)** :contentReference[oaicite:6]{index=6}  
  - **Cancelled** :contentReference[oaicite:7]{index=7}  
- **Search & filter** – for each list (pencil bookings, reservations, past events, cancelled events), filter by venue, time, date, and search by client name.   
- **Calendar view** – monthly calendar that visualizes events and venue/time occupancy.   
- **Availability check** – API endpoint to check if a venue/time slot is already taken before confirming a booking.   
- **Printable receipts** – receipt view and print helper for completed events.   

### Admin & staff tooling
- **Admin dashboard** – recent employees and activities for the last 7 days.   
- **Employee management**
  - Register new employees with roles (`admin`, `manager`, `frontdesk`).   
  - View current vs former employees (access toggle).   
  - Grant/revoke access without deleting accounts.   
  - Safety check to **prevent demoting/removing the last active admin**. :contentReference[oaicite:16]{index=16}  
- **Event settings** – manage event discounts (percentage, descriptions) via a dedicated settings page.   
- **Analytics dashboard** – high-level analytics visible to admins and managers.   
- **Personal profile** – each employee can edit their own profile details and change their password using the same robust validation applied by admin flows.   

### Developer experience
- **Mock mode vs Full mode**
  - **Mock mode:** if `DB_URL` is not set (and not running in production), the app serves all pages using in-memory mock data and routes – great for UI demos without a database.   
  - **Full mode:** when `DB_URL` is configured, the app connects to MongoDB via Mongoose and uses real data models for events, employees, packages, foods, and activities.   
- **Jest test suite** with coverage thresholds enforced (80%+ globally, stricter on helpers and controllers).   
- **ESLint + Prettier** for consistent code style.   
- **GitHub Actions CI**
  - Lints code
  - Runs Jest with coverage
  - Runs `npm audit --audit-level=high`
  - Builds and uploads a `TableTango` artifact
  - Optionally creates GitHub releases from the pipeline   

---

## Tech stack

- **Backend:** Node.js, Express 5, Mongoose :contentReference[oaicite:25]{index=25}  
- **Views:** Handlebars (`hbs`) + Bootstrap 5 + jQuery   
- **Database:** MongoDB (Employee, Event, Activity, Charge, Package, Food models)   
- **Auth & sessions:** `express-session` with `connect-mongo` (cookie `httpOnly`, `sameSite="lax"`, optional `secure` in production)   
- **Security libraries:** `csurf`, `express-rate-limit`, `bcrypt`, custom validation helpers   
- **Tooling:** Jest, ESLint, Prettier, GitHub Actions CI   

---

## Getting started

### Prerequisites

- Node.js **20+** (CI uses Node 20) :contentReference[oaicite:31]{index=31}  
- (Optional) MongoDB instance for full data-backed mode

### Installation

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd STSWENG-MCO

npm install
npm install hbs dotenv bcrypt calendar csurf express-rate-limit
````

### Running in mock mode (no DB required)

For a quick UI demo, you can run without MongoDB; the app will automatically use mock data if `DB_URL` is not set:

```bash
node index.js
# App listens on http://localhost:3000 by default
```

Available key pages in mock mode include:

* `/login`
* `/event-tracker/home`
* `/event-tracker/create`
* `/event-tracker/pencilbookings`
* `/event-tracker/reservations`
* `/event-tracker/pastevents`
* `/event-tracker/cancelled`

### Running with MongoDB (full mode)

1. Create a `.env` file in the project root:

   ```env
   HOSTNAME=localhost
   PORT=3000
   DB_URL=mongodb://<user>:<password>@<host>:<port>/<database>
   SESSION_SECRET=some-very-strong-random-string
   ```

2. Start MongoDB and then run:

   ```bash
   node index.js
   ```

   In full mode:

   * The app connects to MongoDB with connection events logged (with credentials redacted). 
   * Sessions are persisted to MongoDB via `connect-mongo`. 

> ⚠️ In production, `DB_URL` **must** be set; otherwise the app throws an error to avoid accidentally running in mock mode. 

---

## Security features

This app was built with secure development practices in mind.

### Authentication & account security

* **Password hashing with bcrypt**
  All employee passwords are hashed using bcrypt before being stored in MongoDB.

* **Robust password policy**

  * 8–72 characters
  * Must contain at least one uppercase, one lowercase, one digit, and one special character
  * New password **must not equal** the current password (checked using bcrypt) 

* **Account lockout**

  * Tracks failed login attempts, with thresholds:

    * 5 failed attempts allowed within a 15-minute window
    * On exceeding, the account is locked for 15 minutes 
  * Locked accounts receive a specific “account temporarily locked” message and return HTTP 429. 

* **Login rate limiting**

  * `express-rate-limit` protects `/authenticate`
  * 50 login attempts per IP per 15 minutes, with modern headers enabled
  * Complements account lockout to slow down attackers rotating usernames.

* **Safe authentication flow**

  * Unknown users and incorrect passwords both return a generic “Invalid credentials” without revealing which part is wrong.
  * Disabled accounts respond with HTTP 403 and an “Account disabled” message.
  * On successful login:

    * Failed login counters and lockout metadata are reset.
    * The session ID is **regenerated** (`req.session.regenerate`) to mitigate session fixation.

### Session & CSRF protection

* **Secure session cookies**

  * `httpOnly: true` – cookies aren’t accessible via JavaScript
  * `sameSite: "lax"` – helps defend against CSRF on top-level navigations
  * `secure: true` in production – cookies only over HTTPS
  * 2-hour session timeout via `maxAge` 

* **Persistent session store (full mode)**
  Sessions are stored in MongoDB with `connect-mongo`, so server restarts don’t log every user out.

* **CSRF tokens everywhere**

  * Global `csurf` middleware is enabled.
  * CSRF token is passed to Handlebars templates via `res.locals.csrfToken` and exposed through a partial.
  * AJAX calls include the CSRF token in an `X-CSRF-Token` header.
  * Dedicated CSRF error handler logs details and returns HTTP 403 with a friendly error page. 

### Role-based access control (RBAC)

* **Central RBAC middleware**

  * Only the roles `admin`, `manager`, `frontdesk` are considered valid.
  * If a session has no role or an invalid role, access is denied (HTTP 403) and the attempt is logged.
  * Per-route role lists strictly enforce who can do what (e.g., admin dashboard, analytics, event tracker views).

* **Admin safety guard**

  * Before changing an employee’s role/access, `ensureNotLastAdmin` checks if this is the last active admin and blocks the change if so. 

* **Access gating**

  * Global middleware redirects unauthenticated users to `/login`, except the login and authenticate routes. 
  * An extra guard on `/admin` ensures only admins reach the admin interface even if routing is misconfigured. 

### Input validation & data handling

* **Server-side validation helpers**

  * `sanitizeString` trims input and normalizes whitespace.
  * Validators for username, name, and phone enforce length and allowed character sets.
  * Used in admin and profile controllers to validate user input before writing to MongoDB.

* **Limited exposure of sensitive fields**

  * When listing employees as JSON (for admin tools), password hashes, failed login counters, and internal Mongoose fields are excluded via `.select("-password -failedLoginAttempts -lockUntil -__v")`. 

### Audit logging

* **Central `activityLogger` helper**

  * Writes to an `Activity` collection with `username`, `activityName`, and optional `meta` (IP, user-agent, etc.).
  * Used for:

    * Login success and failure (including lockouts and disabled accounts)
    * Logout events
    * Access denials in RBAC
    * Employee creation/updates and event lifecycle changes (e.g., created/finished events)

### CI / Dependency security

* **Jest coverage thresholds** enforce a minimum level of tested code across controllers and helpers.
* **`npm audit --audit-level=high`** runs in CI and fails the pipeline when high severity vulnerabilities are found.

---

## Role-based access control matrix

The app is designed for internal staff with three roles: **Admin**, **Manager**, and **Front Desk**.
Below is a high-level view of what each role can do:

| Capability                                               | Admin | Manager | Front Desk |
| -------------------------------------------------------- | :---: | :-----: | :--------: |
| Access employee management & audit logs (`/admin`)       |  Yes  |    No   |     No     |
| Manage employee access/roles (grant/revoke, edit info)   |  Yes  |    No   |     No     |
| Configure event settings & discounts (`/settings/event`) |  Yes  |    No   |     No     |
| View analytics dashboard (`/analytics`)                  |  Yes  |   Yes   |     No     |
| Create, edit, cancel, and finish events                  |  Yes  |   Yes   |     Yes    |
| View event calendar & all event lists                    |  Yes  |   Yes   |     Yes    |
| View and print event receipts                            |  Yes  |   Yes   |     Yes    |
| Update own profile and change password (`/profile`)      |  Yes  |   Yes   |     Yes    |

These mappings are enforced via the `requireRoles` middleware on each route, combined with the global authentication gates.

---

## Running tests & linting

From the project root:

```bash
# Run Jest tests with coverage
npm test

# Lint the codebase with ESLint
npm run lint

# Format code with Prettier
npm run format
```

Jest is configured to collect coverage from controllers and helpers and enforces minimum coverage thresholds.

---

## Notes & next steps

* Add seed scripts for local development (e.g., a default admin account and sample events).
* Add screenshots to this README (e.g., under a `## Screenshots` section).
* Optionally extend analytics and reporting.