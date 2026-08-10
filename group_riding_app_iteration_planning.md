# Group Riding App — Iteration Planning

**Product:** RideTogether  
**Version:** MVP  
**Frontend:** React + TypeScript + Vite  
**Backend:** Node.js + TypeScript  
**Database:** PostgreSQL  
**Real-time:** Socket.IO  
**Live State:** Redis  
**Map:** MapLibre GL JS + OpenStreetMap ecosystem  
**Routing:** OSRM  
**Date:** August 10, 2026

---

# 1. Iteration Strategy

The application will be developed incrementally.

The guiding principle is:

> Build and validate the ride-room lifecycle first, then introduce real-time location, maps, and communication.

Each iteration should produce a working increment of the product.

```text
Iteration 0
Project Foundation
        ↓
Iteration 1
Ride Creation
        ↓
Iteration 2
Join Ride + Waiting Room
        ↓
Iteration 3
WebSocket Infrastructure
        ↓
Iteration 4
Ride Lifecycle
        ↓
Iteration 5
Live Location
        ↓
Iteration 6
Map + Rider Tracking
        ↓
Iteration 7
Distance + Location State
        ↓
Iteration 8
Quick Messages
        ↓
Iteration 9
Organizer Controls
        ↓
Iteration 10
Security + Reliability
        ↓
Iteration 11
Testing + Performance
        ↓
Iteration 12
Deployment + MVP Release
```

---

# 2. Definition of Done

An iteration is considered complete when:

- [ ] Feature is implemented.
- [ ] Frontend and backend integration works.
- [ ] Error cases are handled.
- [ ] Relevant tests are written.
- [ ] No known critical bugs remain.
- [ ] Code is reviewed/refactored.
- [ ] Documentation is updated where necessary.
- [ ] Feature works on a real browser, not only local mocks.

---

# 3. Iteration 0 — Project Foundation

## Goal

Set up the complete development environment and repository structure.

## Tasks

### Repository

- [ ] Create Git repository.
- [ ] Create frontend application.
- [ ] Create backend application.
- [ ] Add `.gitignore`.
- [ ] Add README.
- [ ] Add environment variable templates.
- [ ] Define branch strategy.

### Frontend

- [ ] Initialize React + TypeScript + Vite.
- [ ] Configure ESLint.
- [ ] Configure Prettier.
- [ ] Configure React Router.
- [ ] Configure Zustand.
- [ ] Create base layout.
- [ ] Create error boundary.
- [ ] Create API client abstraction.

### Backend

- [ ] Initialize Node.js + TypeScript.
- [ ] Select Express or Fastify.
- [ ] Configure ESLint.
- [ ] Configure Prettier.
- [ ] Add environment configuration.
- [ ] Add centralized error handling.
- [ ] Add request validation.
- [ ] Add health endpoint.

### Infrastructure

- [ ] Add Docker configuration.
- [ ] Add PostgreSQL container.
- [ ] Add Redis container.
- [ ] Add Docker Compose.
- [ ] Verify frontend → backend connectivity.
- [ ] Verify backend → PostgreSQL connectivity.
- [ ] Verify backend → Redis connectivity.

## Deliverable

```text
React App
    ↓
Node.js API
    ↓
PostgreSQL
    +
Redis
```

All services should start locally with one command.

---

# 4. Iteration 1 — Ride Creation

## Goal

Allow an organizer to create a ride.

## Frontend

- [ ] Create Home page.
- [ ] Create Create Ride page.
- [ ] Add ride name input.
- [ ] Add start location input.
- [ ] Add destination input.
- [ ] Add basic validation.
- [ ] Add loading state.
- [ ] Add API error state.

## Backend

- [ ] Create Ride module.
- [ ] Create Ride entity/model.
- [ ] Create migration.
- [ ] Create `POST /api/rides`.
- [ ] Generate unique Ride ID.
- [ ] Generate organizer participant/session.
- [ ] Return ride information.

## Database

Create:

```text
rides
participants
```

## Acceptance Criteria

- [ ] Organizer can create a ride.
- [ ] Ride is persisted.
- [ ] Ride receives a unique code.
- [ ] Organizer is created as a participant.
- [ ] Ride starts with status `WAITING`.

---

# 5. Iteration 2 — Join Ride

## Goal

Allow users to join an existing ride using a link or Ride ID.

## Frontend

- [ ] Create Join Ride page.
- [ ] Add Ride ID input.
- [ ] Add name input.
- [ ] Add validation.
- [ ] Create `/join/:code` route.
- [ ] Support direct link joining.
- [ ] Show ride details before joining.

## Backend

- [ ] Create Join Ride endpoint.
- [ ] Validate Ride ID.
- [ ] Validate ride state.
- [ ] Create participant.
- [ ] Generate participant ID.
- [ ] Generate temporary participant token.
- [ ] Return participant session.

## Acceptance Criteria

- [ ] User can enter Ride ID.
- [ ] User can open shared URL.
- [ ] User can enter their name.
- [ ] Participant is created.
- [ ] Participant can access the ride.

---

# 6. Iteration 3 — Waiting Room

## Goal

Allow everyone to see who has joined before the ride starts.

## Frontend

- [ ] Create Waiting Room page.
- [ ] Display ride name.
- [ ] Display Ride ID.
- [ ] Display start/destination.
- [ ] Display participant list.
- [ ] Display organizer.
- [ ] Add share/copy link controls.
- [ ] Add leave ride action.

## Backend

- [ ] Create `GET /api/rides/:code`.
- [ ] Return participants.
- [ ] Add participant status.
- [ ] Add leave participant endpoint.

## Acceptance Criteria

```text
Organizer
   ↓
Creates Ride
   ↓
Shares Link
   ↓
Rider Joins
   ↓
Both See:

Organizer
Rider 1
Rider 2
Rider 3
```

---

# 7. Iteration 4 — WebSocket Infrastructure

## Goal

Introduce real-time communication between participants.

## Backend

- [ ] Add Socket.IO.
- [ ] Create WebSocket gateway/module.
- [ ] Authenticate socket connections.
- [ ] Create ride rooms.
- [ ] Implement participant joining room.
- [ ] Implement participant leaving room.
- [ ] Implement reconnect handling.

## Events

Client → Server:

```text
JOIN_RIDE
LEAVE_RIDE
```

Server → Client:

```text
PARTICIPANT_JOINED
PARTICIPANT_LEFT
```

## Frontend

- [ ] Create Socket.IO client service.
- [ ] Create `useSocket` hook.
- [ ] Connect after participant session is available.
- [ ] Subscribe to ride events.
- [ ] Update Zustand state from events.
- [ ] Display connection state.

## Acceptance Criteria

Open:

```text
Browser A
Browser B
Browser C
```

When Browser B joins:

```text
Browser A → sees B
Browser B → sees A
Browser C → sees B
```

No page refresh should be required.

---

# 8. Iteration 5 — Ride Lifecycle

## Goal

Implement the transition from waiting to active to completed.

## Backend

Implement:

```text
POST /api/rides/:code/start
POST /api/rides/:code/end
```

## Authorization

- [ ] Only organizer can start.
- [ ] Only organizer can end.
- [ ] Server validates organizer token.
- [ ] Prevent starting an already active ride.
- [ ] Prevent ending a non-active ride.

## WebSocket Events

```text
RIDE_STARTED
RIDE_ENDED
```

## Frontend

- [ ] Add Start Ride button.
- [ ] Add confirmation modal.
- [ ] Add End Ride button.
- [ ] Add confirmation modal.
- [ ] Update UI based on ride state.
- [ ] Show waiting state.
- [ ] Show active state.
- [ ] Show completed state.

## Acceptance Criteria

```text
WAITING
   ↓
START
   ↓
ACTIVE
   ↓
END
   ↓
COMPLETED
```

All connected clients must update automatically.

---

# 9. Iteration 6 — Browser Location

## Goal

Capture the user's live location from the browser.

## Frontend

- [ ] Create `useGeolocation` hook.
- [ ] Request location permission.
- [ ] Handle permission denied.
- [ ] Handle unavailable location.
- [ ] Capture latitude.
- [ ] Capture longitude.
- [ ] Capture accuracy.
- [ ] Capture heading.
- [ ] Capture speed.
- [ ] Capture timestamp.

## Location State

```json
{
  "latitude": 22.5726,
  "longitude": 88.3639,
  "accuracy": 12,
  "heading": 90,
  "speed": 14.5,
  "timestamp": 1786380000
}
```

## Important Rule

Location tracking must only start when:

```text
ride.status === ACTIVE
```

Location tracking must stop when:

```text
ride.status === COMPLETED
```

or the participant leaves.

## Acceptance Criteria

- [ ] Browser asks for permission.
- [ ] Current location is available.
- [ ] Permission errors are handled.
- [ ] Tracking stops correctly.

---

# 10. Iteration 7 — Real-Time Location Sharing

## Goal

Broadcast live locations to all participants.

## Backend

- [ ] Implement `LOCATION_UPDATE`.
- [ ] Validate participant session.
- [ ] Validate ride membership.
- [ ] Validate ride status.
- [ ] Validate coordinates.
- [ ] Validate update frequency.
- [ ] Store latest location in Redis.
- [ ] Broadcast location to ride room.

## Frontend

- [ ] Send location through Socket.IO.
- [ ] Receive other rider locations.
- [ ] Store live locations separately from ride state.
- [ ] Handle stale locations.
- [ ] Display connection status.

## Events

```text
LOCATION_UPDATE
LOCATION_UPDATED
```

## Recommended Initial Frequency

```text
3–5 seconds
```

Later optimize based on movement.

## Acceptance Criteria

With:

```text
Browser A
Browser B
```

when A moves:

```text
A GPS
 ↓
Node.js
 ↓
Redis
 ↓
Socket.IO
 ↓
B
```

B should receive A's updated location without refresh.

---

# 11. Iteration 8 — Map Integration

## Goal

Display the ride and all participants on a map.

## Frontend

- [ ] Install/configure MapLibre GL JS.
- [ ] Configure map tiles.
- [ ] Display map.
- [ ] Display start marker.
- [ ] Display destination marker.
- [ ] Display current rider marker.
- [ ] Display other rider markers.
- [ ] Update markers in real time.
- [ ] Implement marker click.
- [ ] Show rider information.

## Map UX

Clicking a rider:

```text
Sourov

2.4 km away

Last updated:
5 sec ago
```

## Acceptance Criteria

- [ ] Map loads.
- [ ] Start and destination appear.
- [ ] All active riders appear.
- [ ] Markers move when locations update.
- [ ] Map does not unnecessarily rerender.

---

# 12. Iteration 9 — Route

## Goal

Show the planned route between start and destination.

## Backend / Routing

- [ ] Evaluate OSRM.
- [ ] Create routing service abstraction.
- [ ] Request route geometry.
- [ ] Return route to frontend.
- [ ] Handle routing failures.

## Frontend

- [ ] Draw route polyline.
- [ ] Fit map bounds to route.
- [ ] Display route distance.
- [ ] Display estimated duration if available.

## Important Architecture

Keep routing behind an abstraction:

```text
RoutingService
      │
      ├── OSRM
      └── Future provider
```

This allows the routing provider to be changed later.

---

# 13. Iteration 10 — Distance Calculation

## Goal

Show the distance between riders.

## Frontend

For each participant:

```text
Rider
Current Location
        ↓
Distance Calculation
        ↓
Distance from Me
```

Example:

```text
Amit
2.4 km away

Raj
5.8 km away
```

## Requirements

- [ ] Implement Haversine distance calculation.
- [ ] Update distance when locations change.
- [ ] Avoid unnecessary recalculation.
- [ ] Format meters/kilometers appropriately.

Example:

```text
< 1 km → 850 m
≥ 1 km → 2.4 km
```

---

# 14. Iteration 11 — Location Status

## Goal

Make it clear whether another rider's location is current.

## States

```text
LIVE
DELAYED
STALE
OFFLINE
```

Suggested thresholds:

```text
< 10 sec
    LIVE

10–30 sec
    DELAYED

> 30 sec
    STALE
```

## Frontend

Example:

```text
🟢 Amit
2.4 km away

🟡 Raj
Last updated 18 sec ago

🔴 Rahul
Last updated 52 sec ago
```

---

# 15. Iteration 12 — Quick Messages

## Goal

Allow riders to communicate common ride updates instantly.

## Messages

```text
WASHROOM_BREAK
REFUELING
FOOD_BREAK
TEA_BREAK
EMERGENCY_STOP
SLOW_DOWN
WAITING_HERE
REACHED_DESTINATION
```

## Backend

- [ ] Create message event.
- [ ] Validate participant.
- [ ] Validate ride status.
- [ ] Validate message type.
- [ ] Rate limit messages.
- [ ] Broadcast to ride room.

## Frontend

- [ ] Add Quick Update button.
- [ ] Add bottom sheet/menu.
- [ ] Add message buttons.
- [ ] Add toast/popup.
- [ ] Auto-dismiss popup.

## Acceptance Criteria

Participant A sends:

```text
🚻 Washroom Break
```

Participants B, C, D see:

```text
🚻 Amit
Washroom Break
```

without refreshing.

---

# 16. Iteration 13 — Organizer Controls

## Goal

Give the organizer full participant management.

## Features

- [ ] Participant list.
- [ ] Remove participant.
- [ ] Confirmation modal.
- [ ] Backend authorization.
- [ ] Disconnect removed participant.
- [ ] Broadcast participant removal.
- [ ] Prevent removed participant from reconnecting.

## Event

```text
PARTICIPANT_REMOVED
```

## Acceptance Criteria

Organizer removes:

```text
Amit
```

Then:

```text
Organizer → Amit disappears
Rider B   → Amit disappears
Amit      → Access revoked
Amit      → WebSocket disconnected
```

---

# 17. Iteration 14 — Leave Ride

## Goal

Allow riders to voluntarily leave.

## Frontend

- [ ] Add Leave Ride action.
- [ ] Add confirmation.
- [ ] Stop location tracking.
- [ ] Disconnect/leave socket room.
- [ ] Redirect to home.

## Backend

- [ ] Mark participant as `LEFT`.
- [ ] Remove from active room.
- [ ] Broadcast `PARTICIPANT_LEFT`.

---

# 18. Iteration 15 — Connection Reliability

## Goal

Make the application resilient to temporary network failures.

## Frontend

- [ ] Detect WebSocket disconnect.
- [ ] Show reconnecting state.
- [ ] Automatically reconnect.
- [ ] Rejoin ride room after reconnect.
- [ ] Resynchronize current ride state.
- [ ] Resynchronize latest locations.

## Backend

- [ ] Validate reconnecting participant.
- [ ] Rejoin correct room.
- [ ] Return current ride state.
- [ ] Return latest participant locations.

## UI

```text
🟢 Connected

or

🟡 Reconnecting...

or

🔴 Offline
```

---

# 19. Iteration 16 — Security

## Goal

Secure the anonymous ride system.

## Tasks

- [ ] HTTPS.
- [ ] WSS.
- [ ] Secure participant tokens.
- [ ] Organizer authorization.
- [ ] Request validation.
- [ ] Coordinate validation.
- [ ] Ride code rate limiting.
- [ ] Join rate limiting.
- [ ] Quick message rate limiting.
- [ ] CORS configuration.
- [ ] Security headers.
- [ ] Input sanitization.
- [ ] Name length restrictions.

## Security Tests

- [ ] Rider cannot start ride.
- [ ] Rider cannot end ride.
- [ ] Rider cannot remove another rider.
- [ ] Removed participant cannot reconnect.
- [ ] Invalid participant token is rejected.
- [ ] Participant from Ride A cannot access Ride B.
- [ ] Invalid coordinates are rejected.

---

# 20. Iteration 17 — Privacy

## Goal

Minimize collection and retention of user data.

## Tasks

- [ ] Document location collection.
- [ ] Stop tracking when ride ends.
- [ ] Stop tracking when participant leaves.
- [ ] Avoid storing historical GPS by default.
- [ ] Expire abandoned rides.
- [ ] Expire temporary sessions.
- [ ] Define Redis TTLs.
- [ ] Add privacy notice.

## Principle

```text
Collect only what is necessary.
Store only what is necessary.
Keep location only as long as necessary.
```

---

# 21. Iteration 18 — Ride Expiration

## Goal

Automatically clean up abandoned rides.

## Rules

Suggested:

```text
WAITING
→ expire after 24h inactivity

ACTIVE
→ future safety timeout

COMPLETED
→ cleanup based on retention policy
```

## Tasks

- [ ] Add expiration timestamps.
- [ ] Add cleanup worker/job.
- [ ] Remove expired Redis state.
- [ ] Mark expired rides.
- [ ] Prevent joining expired rides.

---

# 22. Iteration 19 — Frontend UX Polish

## Goal

Make the application usable on mobile browsers.

## Tasks

- [ ] Responsive layout.
- [ ] Mobile-first active ride screen.
- [ ] Large touch targets.
- [ ] Loading skeletons.
- [ ] Empty states.
- [ ] Error states.
- [ ] Toast notifications.
- [ ] Confirmation dialogs.
- [ ] Map loading state.
- [ ] Location permission guidance.
- [ ] Connection indicator.
- [ ] Participant bottom sheet.
- [ ] Quick message bottom sheet.

## Mobile Priority

```text
Map
 ↓
Connection
 ↓
Quick Update
 ↓
Participants
 ↓
Ride Controls
```

---

# 23. Iteration 20 — Accessibility

## Goal

Make the web application accessible.

## Tasks

- [ ] Keyboard navigation.
- [ ] Accessible buttons.
- [ ] Proper labels.
- [ ] Focus management.
- [ ] Modal accessibility.
- [ ] Color contrast.
- [ ] Screen reader labels.
- [ ] Avoid color-only status indicators.

---

# 24. Iteration 21 — Frontend Performance

## Goal

Ensure live GPS updates do not make the React application slow.

## Tasks

- [ ] Separate ride state from location state.
- [ ] Memoize rider markers.
- [ ] Avoid full participant list rerenders.
- [ ] Throttle UI marker updates if necessary.
- [ ] Optimize map updates.
- [ ] Avoid unnecessary Zustand subscriptions.
- [ ] Profile with React DevTools.
- [ ] Test with 25 riders.
- [ ] Test with 50 riders.

## Target

```text
50 riders
+
frequent location updates
=
responsive UI
```

---

# 25. Iteration 22 — Backend Performance

## Goal

Handle multiple active rides efficiently.

## Tasks

- [ ] Measure WebSocket throughput.
- [ ] Measure location updates/sec.
- [ ] Add Redis metrics.
- [ ] Optimize broadcasts.
- [ ] Avoid unnecessary database writes.
- [ ] Add database indexes.
- [ ] Add connection limits.
- [ ] Load-test multiple rides.

## Initial Load Target

```text
25–50 participants / ride
```

---

# 26. Iteration 23 — Testing

## Unit Tests

### Frontend

- [ ] Distance calculation.
- [ ] Ride state handling.
- [ ] Location state.
- [ ] Message state.
- [ ] Validation.

### Backend

- [ ] Ride creation.
- [ ] Ride joining.
- [ ] Ride authorization.
- [ ] Start ride.
- [ ] End ride.
- [ ] Participant removal.
- [ ] Location validation.
- [ ] Rate limiting.

---

# 27. Iteration 24 — Integration Tests

Test:

```text
React
  ↓
API
  ↓
Node.js
  ↓
PostgreSQL
```

And:

```text
React
  ↓
Socket.IO
  ↓
Node.js
  ↓
Redis
```

Scenarios:

- [ ] Create ride.
- [ ] Join ride.
- [ ] Start ride.
- [ ] Send location.
- [ ] Receive location.
- [ ] Send quick message.
- [ ] Remove participant.
- [ ] End ride.

---

# 28. Iteration 25 — End-to-End Tests

Use multiple browser sessions.

Example:

```text
Organizer
Browser A

Rider 1
Browser B

Rider 2
Browser C
```

Test:

```text
A creates ride
        ↓
B joins
        ↓
C joins
        ↓
A sees B + C
        ↓
B sees A + C
        ↓
C sees A + B
        ↓
A starts ride
        ↓
GPS sharing begins
        ↓
B sends location
        ↓
A + C see B
        ↓
C sends quick message
        ↓
A + B see message
        ↓
A removes B
        ↓
B loses access
        ↓
A ends ride
        ↓
All tracking stops
```

---

# 29. Iteration 26 — Load Testing

## Scenario 1

```text
1 ride
10 participants
```

## Scenario 2

```text
1 ride
25 participants
```

## Scenario 3

```text
1 ride
50 participants
```

## Scenario 4

```text
10 rides
25 participants each
```

Measure:

- CPU
- Memory
- WebSocket connections
- Location updates/sec
- Redis operations
- Database load
- Message latency
- Location latency

---

# 30. Iteration 27 — Production Infrastructure

## Backend

- [ ] Production Docker image.
- [ ] Environment configuration.
- [ ] Nginx reverse proxy.
- [ ] HTTPS.
- [ ] WSS.
- [ ] Health endpoint.
- [ ] Graceful shutdown.
- [ ] Logging.

## Database

- [ ] Production PostgreSQL.
- [ ] Database migrations.
- [ ] Backup strategy.
- [ ] Connection pooling.

## Redis

- [ ] Production Redis.
- [ ] Authentication.
- [ ] TTL configuration.
- [ ] Memory policy.

---

# 31. Iteration 28 — Monitoring

## Backend Metrics

Track:

```text
Active rides
Active participants
WebSocket connections
Location updates/sec
Quick messages/sec
API latency
WebSocket latency
Error rate
Redis memory
Database connections
```

## Logs

Track:

```text
Ride created
Participant joined
Ride started
Ride ended
Participant removed
WebSocket connected
WebSocket disconnected
Location errors
Authorization failures
Rate-limit events
```

---

# 32. Iteration 29 — Production Deployment

## Frontend

Deploy React application.

Example architecture:

```text
Browser
  ↓
HTTPS
  ↓
React Web App
```

## Backend

```text
Browser
  ↓
HTTPS / WSS
  ↓
Nginx
  ↓
Node.js
```

## Data

```text
Node.js
 ├── PostgreSQL
 └── Redis
```

## Deployment Checklist

- [ ] Production environment variables.
- [ ] HTTPS.
- [ ] WSS.
- [ ] CORS.
- [ ] Database migrations.
- [ ] Redis connection.
- [ ] Health check.
- [ ] Logging.
- [ ] Monitoring.
- [ ] Backup.
- [ ] Rate limiting.

---

# 33. Iteration 30 — MVP Release

## Final MVP Features

### Ride

- [ ] Create ride.
- [ ] Select start.
- [ ] Select destination.
- [ ] Generate Ride ID.
- [ ] Generate share link.

### Joining

- [ ] Join via link.
- [ ] Join via ID.
- [ ] Enter name.
- [ ] Waiting room.

### Live Ride

- [ ] Start ride.
- [ ] Live map.
- [ ] Real-time location.
- [ ] Rider markers.
- [ ] Distance between riders.
- [ ] Destination.
- [ ] Connection status.

### Communication

- [ ] Quick messages.
- [ ] In-app popups.
- [ ] Rate limiting.

### Organizer

- [ ] Remove participant.
- [ ] End ride.

### Reliability

- [ ] WebSocket reconnect.
- [ ] Stale location.
- [ ] Location permission handling.

---

# 34. MVP Release Gate

Do not release until all of these work:

```text
[ ] Organizer creates ride
[ ] Ride ID generated
[ ] Share link generated
[ ] Rider joins via link
[ ] Rider joins via ID
[ ] Multiple riders appear
[ ] Organizer starts ride
[ ] Location permission works
[ ] Location reaches backend
[ ] Location reaches other riders
[ ] Map markers move
[ ] Distance updates
[ ] Quick messages work
[ ] Organizer can remove rider
[ ] Removed rider loses access
[ ] Organizer ends ride
[ ] Location sharing stops
[ ] WebSocket reconnect works
[ ] Invalid requests are rejected
[ ] Mobile browser works
```

---

# 35. Suggested Sprint Grouping

If using 1-week iterations/sprints:

| Sprint | Focus |
|---|---|
| Sprint 1 | Project foundation |
| Sprint 2 | Ride creation |
| Sprint 3 | Join + waiting room |
| Sprint 4 | WebSockets |
| Sprint 5 | Ride lifecycle |
| Sprint 6 | Browser location |
| Sprint 7 | Live location |
| Sprint 8 | Map |
| Sprint 9 | Routing + distance |
| Sprint 10 | Quick messages |
| Sprint 11 | Organizer controls |
| Sprint 12 | Reliability + security |
| Sprint 13 | Testing |
| Sprint 14 | Performance |
| Sprint 15 | Deployment |
| Sprint 16 | MVP release |

---

# 36. Recommended Implementation Order

The most important dependency chain is:

```text
Project Setup
     ↓
Database
     ↓
Ride Creation
     ↓
Join Ride
     ↓
Waiting Room
     ↓
WebSocket
     ↓
Ride Lifecycle
     ↓
Browser Location
     ↓
Live Location
     ↓
Map
     ↓
Distance
     ↓
Quick Messages
     ↓
Organizer Controls
     ↓
Reliability
     ↓
Security
     ↓
Testing
     ↓
Deployment
```

Do not start with the map.

The map is visually important, but the core product is the **real-time ride room**.

---

# 37. Technical Milestones

## Milestone 1 — Ride Room

```text
Create
  ↓
Join
  ↓
Waiting Room
```

Status:

```text
[ ] Not Started
```

---

## Milestone 2 — Real-Time Room

```text
WebSocket
  ↓
Participant Events
  ↓
Ride State Events
```

Status:

```text
[ ] Not Started
```

---

## Milestone 3 — Live Tracking

```text
Browser GPS
  ↓
WebSocket
  ↓
Redis
  ↓
Broadcast
  ↓
Other Riders
```

Status:

```text
[ ] Not Started
```

---

## Milestone 4 — Map Experience

```text
Map
  +
Route
  +
Rider Markers
  +
Distance
```

Status:

```text
[ ] Not Started
```

---

## Milestone 5 — Communication

```text
Quick Messages
  ↓
WebSocket
  ↓
All Participants
```

Status:

```text
[ ] Not Started
```

---

## Milestone 6 — Production MVP

```text
Security
+
Reliability
+
Testing
+
Monitoring
+
Deployment
```

Status:

```text
[ ] Not Started
```

---

# 38. Development Board Structure

Recommended GitHub/Jira board:

```text
BACKLOG
   ↓
READY
   ↓
IN PROGRESS
   ↓
CODE REVIEW
   ↓
TESTING
   ↓
DONE
```

Each task should contain:

```text
Title
Description
Acceptance Criteria
Dependencies
Priority
Estimate
```

---

# 39. Priority System

## P0 — Critical

Required for MVP.

Examples:

- Create ride
- Join ride
- Waiting room
- WebSocket
- Live location
- Map
- Start/end ride

## P1 — High

Important for MVP quality.

Examples:

- Reconnection
- Distance
- Quick messages
- Participant removal
- Security
- Mobile responsiveness

## P2 — Medium

Can follow MVP.

Examples:

- Route deviation
- QR code
- Ride history
- Scheduled rides

## P3 — Future

Examples:

- Chat
- Ride replay
- Analytics
- Emergency integrations
- Native mobile application

---

# 40. Initial Backlog

## P0

- [ ] Project setup
- [ ] PostgreSQL setup
- [ ] Redis setup
- [ ] Create ride
- [ ] Ride ID
- [ ] Share link
- [ ] Join ride
- [ ] Name-based participant
- [ ] Waiting room
- [ ] WebSocket
- [ ] Ride start
- [ ] Ride end
- [ ] Browser geolocation
- [ ] Live location
- [ ] Map
- [ ] Rider markers
- [ ] Organizer removal

## P1

- [ ] Distance calculation
- [ ] Quick messages
- [ ] Connection status
- [ ] Reconnection
- [ ] Stale location
- [ ] Security
- [ ] Rate limiting
- [ ] Responsive mobile UI
- [ ] Error handling
- [ ] Testing
- [ ] Performance testing

## P2

- [ ] Route
- [ ] ETA
- [ ] QR code
- [ ] Ride scheduling
- [ ] Ride history
- [ ] Route deviation

## P3

- [ ] Group chat
- [ ] Ride replay
- [ ] Analytics
- [ ] Emergency features
- [ ] Native mobile app

---

# 41. First Coding Target

The first working version should stop here:

```text
Organizer
    │
    ▼
Create Ride
    │
    ▼
Ride ID
    │
    ▼
Share Link
    │
    ▼
Rider Opens Link
    │
    ▼
Enter Name
    │
    ▼
Join
    │
    ▼
Waiting Room
    │
    ▼
Organizer Sees Rider
    │
    ▼
Rider Sees Organizer
```

Only after this complete flow is working should GPS/map development begin.

---

# 42. Overall Project Progress

```text
Foundation             [ ]  0%
Ride Creation          [ ]  0%
Join Ride              [ ]  0%
Waiting Room           [ ]  0%
WebSocket              [ ]  0%
Ride Lifecycle         [ ]  0%
Browser Location       [ ]  0%
Live Location          [ ]  0%
Map                    [ ]  0%
Route                  [ ]  0%
Distance               [ ]  0%
Quick Messages         [ ]  0%
Organizer Controls     [ ]  0%
Reliability            [ ]  0%
Security               [ ]  0%
Testing                [ ]  0%
Performance            [ ]  0%
Deployment             [ ]  0%
MVP Release            [ ]  0%
```

---

# 43. Final Development Principle

Build the system in layers:

```text
1. Persistent Ride
        ↓
2. Participants
        ↓
3. Real-Time Room
        ↓
4. Ride Lifecycle
        ↓
5. GPS
        ↓
6. Map
        ↓
7. Distance
        ↓
8. Communication
        ↓
9. Reliability
        ↓
10. Production
```

The most important technical milestone is:

> **Two or more browsers should be able to join the same ride and receive each other's real-time state without refreshing the page.**

Once that foundation works, the rest of the MVP becomes incremental feature development rather than a single large implementation.
