# RideTogether 🏍️📍

Real-time group riding and tour coordination web application.

## Product Features
- **Instant Ride Rooms:** Create a ride with Start & Destination points and share a 6-character Ride ID or invite link.
- **Anonymous Participation:** Riders join by entering a display name—no registration or password required.
- **Live GPS Map Tracking:** Real-time location streaming over WebSockets (Socket.IO) rendered on MapLibre GL JS maps.
- **Relative Distance Matrix:** Instant Haversine calculations showing rider proximity and distance remaining.
- **Quick Status Updates:** One-tap status notifications (*Washroom Break, Refueling, Emergency Stop, Slow Down, Wait Here*).
- **Organizer Controls:** Start/End ride controls and participant management with instant WebSocket revocation.

---

## Stack Architecture
- **Frontend:** React + TypeScript + Vite + Zustand + React Router + MapLibre GL JS
- **Backend:** Node.js + TypeScript + Express + Socket.IO + Zod
- **Database:** PostgreSQL (persistent ride & participant records)
- **Live State Cache:** Redis (active location streaming & socket session state)
- **Routing:** OSRM (Open Source Routing Machine)

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose

### Quick Start

1. **Start Database & Cache Infrastructure:**
   ```bash
   docker compose up -d
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.
