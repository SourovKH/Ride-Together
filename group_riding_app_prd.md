# PRD — Group Riding Web App

**Working Name:** RideTogether  
**Document Version:** 1.0  
**Date:** August 10, 2026  
**Product Type:** Real-time group riding / tour coordination web application

---

## 1. Product Overview

RideTogether is a web application for organizing and coordinating group motorcycle/car rides.

A ride organizer creates a ride by selecting a starting point and destination. The ride does **not** start immediately. The organizer receives a unique Ride ID and shareable link that can be distributed to other riders.

Participants can join using either:

- A shareable link
- A unique Ride ID

No account is required for the MVP. A participant only needs to provide a display name.

Before the ride starts, everyone can see the participants who have joined. Once the organizer starts the ride, participants share their live location and see the real-time location of other members on a map.

The application also provides predefined quick messages such as:

- Washroom Break
- Refueling
- Food Break
- Emergency Stop
- Waiting Here
- Slow Down

The ride organizer has the ability to remove participants from the ride.

---

# 2. Product Goals

## Primary Goals

1. Make creating a group ride extremely simple.
2. Allow participants to join without creating an account.
3. Provide reliable real-time location sharing.
4. Allow every participant to see the group on a map.
5. Provide quick communication without requiring a chat system.
6. Give the ride organizer control over the participant group.
7. Keep the entire MVP based on free/open-source technologies and free service tiers wherever possible.

---

# 3. Problem Statement

Group rides commonly depend on WhatsApp, phone calls, Google Maps location sharing, and manually coordinating stops.

These approaches create problems:

- Difficult to see the entire group in one place.
- Riders repeatedly ask where others are.
- Location sharing is not designed specifically around a ride.
- Important updates can get lost in a chat.
- Organizers have limited control over the ride group.
- Joining a temporary ride should not require creating a permanent account.

RideTogether provides a temporary, dedicated ride room that solves these problems.

---

# 4. Target Users

## Ride Organizer

A person responsible for creating and coordinating the ride.

Typical responsibilities:

- Create the ride.
- Share the ride with participants.
- Monitor participants.
- Start the ride.
- Remove participants if required.
- End the ride.

## Rider

A participant joining an existing ride.

Typical actions:

- Join a ride.
- Enter their name.
- Wait for the ride to start.
- Share live location.
- See other riders.
- Send quick updates.
- Leave the ride.

---

# 5. User Roles and Permissions

| Action | Organizer | Rider |
|---|---:|---:|
| Create ride | Yes | No |
| Join ride | Yes | Yes |
| View participants | Yes | Yes |
| Start ride | Yes | No |
| End ride | Yes | No |
| Share location | Yes | Yes |
| View locations | Yes | Yes |
| Send quick message | Yes | Yes |
| Remove participant | Yes | No |
| Leave ride | Yes* | Yes |
| View destination | Yes | Yes |

\* The organizer should normally end/cancel the ride instead of leaving it.

---

# 6. Core User Journey

```text
                    ┌──────────────────┐
                    │      Home        │
                    └────────┬─────────┘
                             │
                  ┌──────────┴──────────┐
                  │                     │
                  ▼                     ▼
           ┌─────────────┐       ┌─────────────┐
           │ Create Ride │       │  Join Ride  │
           └──────┬──────┘       └──────┬──────┘
                  │                     │
                  ▼                     ▼
          Select Start &          Enter Ride ID
          Destination             or open link
                  │                     │
                  ▼                     ▼
          Create Ride Room          Enter Name
                  │                     │
                  ▼                     ▼
          Share ID + Link         Waiting Room
                  │                     │
                  └──────────┬──────────┘
                             ▼
                      ┌─────────────┐
                      │ Waiting Room│
                      └──────┬──────┘
                             │
                       Start Ride
                             │
                             ▼
                      ┌─────────────┐
                      │  Active Ride│
                      │             │
                      │ Live Map    │
                      │ Locations   │
                      │ Distances   │
                      │ Quick Msgs  │
                      └──────┬──────┘
                             │
                          End Ride
                             │
                             ▼
                       Ride Completed
```

---

# 7. Ride Lifecycle

A ride has three primary states:

```text
WAITING
   │
   │ Organizer starts ride
   ▼
ACTIVE
   │
   │ Organizer ends ride
   ▼
COMPLETED
```

Optional future state:

```text
WAITING → CANCELLED
```

## WAITING

- Ride exists.
- Participants can join.
- Location sharing is disabled.
- Organizer can start the ride.
- Participants can see the participant list.

## ACTIVE

- Live location sharing is enabled.
- Participants can see each other's locations.
- Quick messages are enabled.
- Organizer can remove participants.
- Organizer can end the ride.

## COMPLETED

- Live location sharing stops.
- Participants can no longer join.
- The ride becomes read-only if ride history is implemented later.

---

# 8. MVP Features

## 8.1 Home

The home page contains two primary actions:

```text
Create a Ride

Join a Ride
```

---

# 9. Create Ride

The organizer selects:

### Required

- Ride name
- Starting location
- Destination

### Optional for MVP

- Planned start time

The journey does not start when it is created.

---

# 10. Map Location Selection

The Create Ride screen contains a map.

The organizer should be able to:

1. Search for a location.
2. Select a starting point.
3. Search for a destination.
4. Select the destination.
5. View the selected points on the map.
6. Create the ride.

Example:

```text
┌─────────────────────────────────┐
│         MAP                     │
│                                 │
│       📍 Start                  │
│          │                      │
│          │ Route                │
│          │                      │
│          ▼                      │
│       🏁 Destination            │
│                                 │
├─────────────────────────────────┤
│ Start                            │
│ [ Search location... ]           │
│                                 │
│ Destination                      │
│ [ Search location... ]           │
│                                 │
│          [ CREATE RIDE ]         │
└─────────────────────────────────┘
```

---

# 11. Ride Creation Result

After creating a ride, the organizer receives:

## Ride ID

Example:

```text
7K9P2X
```

## Share Link

Example:

```text
https://ride.example/join/7K9P2X
```

The UI should provide:

- Copy Ride ID
- Copy link
- Native/browser share option where supported
- QR code as an optional future feature

Example:

```text
Ride Created!

Kolkata → Digha

Ride ID
7K9P2X

[ COPY ID ]

Share Link
https://ride.example/join/7K9P2X

[ COPY LINK ]

[ SHARE ]

Waiting for riders...
```

---

# 12. Joining a Ride

There are two ways to join.

## Option A — Share Link

User opens:

```text
https://ride.example/join/7K9P2X
```

The application displays the ride information and asks for a name.

```text
Join Ride

Kolkata → Digha

Your Name
[________________]

[ JOIN RIDE ]
```

## Option B — Ride ID

User selects:

```text
Join a Ride
```

Then enters:

```text
Ride ID
[ 7K9P2X ]

[ CONTINUE ]
```

After validation:

```text
Your Name
[ Sourov ]

[ JOIN RIDE ]
```

---

# 13. Anonymous Participant Identity

The MVP does not require user accounts.

The participant provides:

```json
{
  "name": "Sourov"
}
```

The backend generates an internal participant ID:

```text
participantId = UUID
```

The backend also provides a temporary participant session token.

The browser stores the session information locally.

This allows the backend to identify a participant without requiring:

- Email
- Phone number
- Password
- Social login

---

# 14. Waiting Room

Before the ride starts, participants see:

```text
Kolkata → Digha

Ride ID: 7K9P2X

Participants

👑 Rahul
   Organizer

🏍️ Sourov

🏍️ Amit

🏍️ Raj
```

The organizer sees:

```text
[ START RIDE ]
```

Regular riders see:

```text
Waiting for organizer to start the ride...
```

---

# 15. Participant Management

The organizer can view all participants.

Example:

```text
Participants

👑 Rahul
   Organizer

🏍️ Sourov             ⋮
🏍️ Amit               ⋮
🏍️ Raj                ⋮
```

Organizer menu:

```text
Remove Rider
```

Before removal:

```text
Remove Amit?

Amit will be disconnected from
this ride.

[ CANCEL ] [ REMOVE ]
```

After removal:

- Participant loses access to the ride.
- Participant is disconnected from the WebSocket room.
- Participant stops sharing location.
- Participant cannot send further updates.

---

# 16. Start Ride

Only the organizer can start the ride.

Clicking:

```text
START RIDE
```

opens confirmation:

```text
Start Ride?

Live location sharing will begin
for all participants.

[ CANCEL ] [ START RIDE ]
```

The backend changes:

```text
WAITING → ACTIVE
```

All connected participants receive a real-time `RIDE_STARTED` event.

---

# 17. Active Ride Screen

The active ride screen is the core application screen.

The map should occupy most of the viewport.

Example:

```text
┌──────────────────────────────────────┐
│ ← Kolkata → Digha                ⋮  │
├──────────────────────────────────────┤
│                                      │
│                 🏍️ Amit              │
│                                      │
│       🏍️ Sourov                      │
│                                      │
│                          🏍️ Raj      │
│                                      │
│                    🏁 Digha           │
│                                      │
│                                      │
├──────────────────────────────────────┤
│ 5 Riders             124 km left     │
├──────────────────────────────────────┤
│ [ PARTICIPANTS ] [ QUICK UPDATE ]    │
└──────────────────────────────────────┘
```

---

# 18. Real-Time Location Sharing

When the ride is ACTIVE, each participant's browser obtains their location using the browser Geolocation API.

Location updates are sent to the Node.js backend over WebSocket.

Example:

```json
{
  "participantId": "uuid",
  "latitude": 22.5726,
  "longitude": 88.3639,
  "accuracy": 12,
  "heading": 90,
  "speed": 14.5,
  "timestamp": 1786380000
}
```

The backend broadcasts the update to other participants in the same ride room.

---

# 19. Location Update Frequency

The MVP should not continuously send GPS updates every second.

Recommended initial strategy:

```text
Every 3–5 seconds
OR
after meaningful movement
```

The implementation should eventually use movement-aware updates to reduce:

- Browser CPU usage
- Battery usage
- Mobile data
- WebSocket traffic
- Server load

---

# 20. WebSocket Ride Rooms

Each ride is represented by a WebSocket room.

Example:

```text
ride:7K9P2X
```

When a participant joins:

```text
socket.join("ride:7K9P2X")
```

Location updates can then be broadcast only to participants in that ride.

This prevents one ride from receiving another ride's location updates.

---

# 21. Real-Time WebSocket Events

## Client → Server

```text
JOIN_RIDE
LEAVE_RIDE

LOCATION_UPDATE

SEND_QUICK_MESSAGE

START_RIDE
END_RIDE
```

## Server → Client

```text
RIDE_UPDATED

PARTICIPANT_JOINED
PARTICIPANT_LEFT
PARTICIPANT_REMOVED

RIDE_STARTED
RIDE_ENDED

LOCATION_UPDATED

QUICK_MESSAGE

CONNECTION_STATUS

ERROR
```

---

# 22. Map Markers

Every active rider should be displayed on the map.

A marker should show:

- Rider name
- Rider position
- Optional direction/heading
- Online/stale state

Example:

```text
🏍️ Sourov
```

Clicking a marker opens:

```text
Sourov

Distance from you:
3.2 km

Last updated:
5 sec ago
```

---

# 23. Distance Between Riders

The active ride screen should show the distance from the current participant to other participants.

Example:

```text
Participants

🟢 Rahul
1.2 km away

🟢 Amit
2.4 km away

🟢 Raj
5.8 km away
```

Distance should be calculated locally where possible using the latest known coordinates.

The system should not require a paid API call for basic point-to-point distance calculations.

---

# 24. Destination Information

The active ride screen should show:

```text
Destination

Digha

Distance remaining:
124 km
```

If routing is available, the application can additionally display:

- Route
- Estimated distance
- Estimated travel time

---

# 25. Quick Messages

Participants should have a prominent:

```text
QUICK UPDATE
```

button.

Available messages:

```text
🚻 Washroom Break
⛽ Refueling
🍔 Food Break
☕ Tea/Coffee Break
🛑 Emergency Stop
🐢 Slow Down
📍 Waiting Here
🏁 Reached Destination
```

---

# 26. Quick Message Behavior

When a rider selects:

```text
🚻 Washroom Break
```

the backend broadcasts:

```text
QUICK_MESSAGE
```

All connected participants receive an in-app popup:

```text
┌────────────────────────────┐
│ 🚻 Washroom Break          │
│                            │
│ Amit                       │
└────────────────────────────┘
```

The popup automatically disappears after a few seconds.

---

# 27. Quick Message Anti-Spam

The backend should enforce rate limits.

Initial recommendation:

```text
5–10 seconds cooldown
```

and optionally:

```text
Maximum 5 messages/minute/user
```

The backend must enforce the limit rather than relying only on frontend UI restrictions.

---

# 28. Connection Status

Because riders may use mobile networks, connection reliability is important.

The UI should indicate:

```text
🟢 Live
```

or:

```text
🟡 Reconnecting...
```

or:

```text
🔴 Offline
```

The WebSocket client should automatically reconnect after temporary network loss.

---

# 29. Stale Location Handling

A participant's location should not be considered live forever.

Suggested states:

```text
< 10 sec       Live
10–30 sec      Delayed
> 30 sec       Stale
```

Example:

```text
🏍️ Raj

⚠️ Last updated 42 sec ago
```

The marker can visually indicate stale status.

---

# 30. Browser Location Permission

The web application must request browser location permission only when required.

Recommended flow:

```text
Organizer starts ride
        ↓
Browser requests location
        ↓
User allows location
        ↓
Location sharing starts
```

For riders:

```text
Ride becomes ACTIVE
        ↓
Request location permission
        ↓
User allows
        ↓
Start sending location
```

The application should clearly explain why location permission is required.

Example:

> Allow location access to share your position with other riders in this ride.

---

# 31. Browser / Mobile Considerations

Because this is a web app, the product must account for browser limitations.

The MVP should prioritize:

- Mobile Chrome
- Mobile Safari
- Modern desktop Chrome
- Modern desktop Edge
- Modern desktop Firefox
- Modern Safari

The application should work as a responsive web application.

A rider using a phone should be able to open the web app from a shared link without installing an app.

---

# 32. Important Web Location Limitation

A web application cannot guarantee continuous background GPS tracking in every browser when the browser tab is:

- Suspended
- Backgrounded
- Throttled
- Closed

Therefore the MVP requirement should be:

> Real-time location sharing while the RideTogether web page is active and permitted to use location.

A future PWA/mobile application can provide stronger background-location behavior where platform permissions allow it.

---

# 33. Leave Ride

A participant can select:

```text
Leave Ride
```

Confirmation:

```text
Leave this ride?

Your live location will stop being
shared with the group.

[ CANCEL ] [ LEAVE ]
```

The backend marks the participant as:

```text
LEFT
```

and broadcasts:

```text
PARTICIPANT_LEFT
```

---

# 34. End Ride

Only the organizer can end the ride.

Confirmation:

```text
End Ride?

Everyone will stop sharing
their live location.

[ CANCEL ] [ END RIDE ]
```

Backend:

```text
ACTIVE → COMPLETED
```

All clients receive:

```text
RIDE_ENDED
```

Location sharing stops.

---

# 35. Error Scenarios

## Invalid Ride ID

```text
Ride not found.
Please check the Ride ID.
```

## Completed Ride

```text
This ride has already ended.
```

## Participant Removed

```text
You have been removed from this ride.
```

## Location Permission Denied

```text
Location permission is required
to share your position during the ride.
```

## Location Unavailable

```text
Your location is currently unavailable.
Please check your browser location settings.
```

## Network Failure

```text
Connection lost.

Reconnecting...
```

## Ride Full

If a maximum participant count is introduced:

```text
This ride has reached its participant limit.
```

---

# 36. Security Requirements

Although users do not create accounts, the system must still authenticate temporary ride sessions.

When a participant joins, the backend should issue:

```text
participantId
participantToken
```

The token is stored securely in browser storage appropriate for the application's threat model.

The participant token is required for:

- Sending location updates
- Sending quick messages
- Leaving the ride
- Accessing protected ride operations

---

# 37. Organizer Authorization

The organizer must receive an organizer-specific session capability.

Only the organizer should be able to:

```text
START_RIDE
END_RIDE
REMOVE_PARTICIPANT
```

The server must validate organizer authorization.

The frontend must never be trusted to declare:

```json
{
  "role": "ORGANIZER"
}
```

The server is responsible for determining the participant's permissions.

---

# 38. Ride ID Security

The Ride ID is intended to be shared, so it should not be treated as a password.

However, it should be sufficiently random.

Recommended:

```text
6–8 alphanumeric characters
```

Example:

```text
7K9P2X
```

The backend should implement:

- Rate limiting
- Ride ID lookup throttling
- Validation
- Expiration/cleanup rules

This prevents brute-force discovery of active rides.

---

# 39. Database Design

PostgreSQL is recommended for persistent data.

## `rides`

```text
id
code
name

start_latitude
start_longitude
start_name

destination_latitude
destination_longitude
destination_name

status

organizer_participant_id

created_at
started_at
ended_at
```

## `participants`

```text
id
ride_id

name

role
status

last_latitude
last_longitude
last_accuracy
last_heading
last_speed
last_location_at

joined_at
left_at
```

---

# 40. Redis Usage

Redis should be used for ephemeral real-time state rather than permanent ride history.

Example:

```text
ride:7K9P2X:locations
```

Conceptually:

```text
participant:A → latest location
participant:B → latest location
participant:C → latest location
```

Redis can also be used for:

- Rate limiting
- Presence
- WebSocket-related state
- Temporary location data

---

# 41. Location Persistence

The application should **not write every GPS update to PostgreSQL**.

For example:

```text
50 riders
×
1 update every 5 seconds
=
10 location updates/second
```

Persisting every update creates unnecessary database growth.

Instead:

```text
Browser
   ↓
WebSocket
   ↓
Node.js
   ↓
Redis / in-memory live state
   ↓
Broadcast
```

Only useful persistent data should be written to PostgreSQL.

---

# 42. Backend Architecture

Use a modular monolith for V1.

```text
                 React Web App
                      │
             ┌────────┴────────┐
             │                 │
           REST            WebSocket
             │                 │
             └────────┬────────┘
                      ▼
                Node.js Server
                      │
       ┌──────────────┼──────────────┐
       │              │              │
       ▼              ▼              ▼
   Ride Module   Location Module  Message Module
       │              │              │
       └──────────────┼──────────────┘
                      │
             ┌────────┴────────┐
             ▼                 ▼
        PostgreSQL           Redis
```

---

# 43. Backend Modules

Recommended structure:

```text
server/
├── src/
│   ├── modules/
│   │   ├── rides/
│   │   │   ├── ride.controller.ts
│   │   │   ├── ride.service.ts
│   │   │   ├── ride.repository.ts
│   │   │   └── ride.types.ts
│   │   │
│   │   ├── participants/
│   │   │   ├── participant.service.ts
│   │   │   └── participant.repository.ts
│   │   │
│   │   ├── locations/
│   │   │   └── location.service.ts
│   │   │
│   │   └── messages/
│   │       └── message.service.ts
│   │
│   ├── websocket/
│   │   └── ride.gateway.ts
│   │
│   ├── database/
│   ├── middleware/
│   ├── utils/
│   └── app.ts
│
└── package.json
```

---

# 44. REST API

## Create Ride

```http
POST /api/rides
```

Request:

```json
{
  "name": "Weekend Ride",
  "start": {
    "name": "Kolkata",
    "latitude": 22.5726,
    "longitude": 88.3639
  },
  "destination": {
    "name": "Digha",
    "latitude": 21.6278,
    "longitude": 87.5074
  }
}
```

Response:

```json
{
  "rideId": "uuid",
  "code": "7K9P2X",
  "status": "WAITING"
}
```

---

# 45. Join Ride API

```http
POST /api/rides/:code/join
```

Request:

```json
{
  "name": "Sourov"
}
```

Response:

```json
{
  "participantId": "uuid",
  "participantToken": "temporary-token",
  "rideId": "uuid",
  "code": "7K9P2X",
  "name": "Sourov"
}
```

---

# 46. Get Ride API

```http
GET /api/rides/:code
```

Response:

```json
{
  "code": "7K9P2X",
  "name": "Weekend Ride",
  "status": "WAITING",
  "start": {
    "name": "Kolkata",
    "latitude": 22.5726,
    "longitude": 88.3639
  },
  "destination": {
    "name": "Digha",
    "latitude": 21.6278,
    "longitude": 87.5074
  },
  "participants": [
    {
      "id": "uuid",
      "name": "Rahul",
      "role": "ORGANIZER"
    },
    {
      "id": "uuid",
      "name": "Sourov",
      "role": "RIDER"
    }
  ]
}
```

---

# 47. Start Ride API

```http
POST /api/rides/:code/start
```

Authorization:

```text
Organizer session required
```

---

# 48. End Ride API

```http
POST /api/rides/:code/end
```

Authorization:

```text
Organizer session required
```

---

# 49. Remove Participant API

```http
DELETE /api/rides/:code/participants/:participantId
```

Authorization:

```text
Organizer session required
```

---

# 50. WebSocket Location Flow

```text
Rider A
  │
  │ Browser Geolocation API
  ▼
React
  │
  │ LOCATION_UPDATE
  ▼
Socket.IO
  │
  ▼
Node.js
  │
  ├── Validate participant
  ├── Validate ride state
  ├── Validate coordinates
  ├── Update live state
  │
  ▼
Socket.IO Room
  │
  ├───────────────┐
  ▼               ▼
Rider B          Rider C
```

---

# 51. Location Validation

The backend should validate:

- Participant belongs to the ride.
- Ride is ACTIVE.
- Latitude is between `-90` and `90`.
- Longitude is between `-180` and `180`.
- Timestamp is reasonable.
- Update rate is within allowed limits.

The backend should never blindly trust client-provided location data.

---

# 52. Map Technology

The application should avoid making paid Google Maps APIs a core dependency.

Recommended open-source-oriented stack:

```text
React
  ↓
MapLibre GL JS
  ↓
OpenStreetMap-compatible map tiles
```

For routing:

```text
OSRM
```

Potential production approaches:

1. Use a provider with an appropriate free tier.
2. Self-host routing.
3. Self-host map tile infrastructure if scale requires it.

OpenStreetMap is the underlying map data ecosystem; it is not itself a complete hosted tile/routing API.

---

# 53. Frontend Technology Stack

## Core

```text
React
TypeScript
Vite
```

## UI

Choose a lightweight UI system such as:

```text
Tailwind CSS
```

or another open-source component system.

## State

Recommended:

```text
Zustand
```

Use it for:

- Current ride
- Participant state
- Live locations
- Connection state
- Current user

## Routing

```text
React Router
```

## Real-Time

```text
Socket.IO Client
```

## Map

```text
MapLibre GL JS
```

## API

```text
fetch
```

or:

```text
Axios
```

---

# 54. Frontend Project Structure

```text
web/
├── src/
│   ├── pages/
│   │   ├── Home/
│   │   ├── CreateRide/
│   │   ├── JoinRide/
│   │   ├── WaitingRoom/
│   │   └── ActiveRide/
│   │
│   ├── components/
│   │   ├── RideMap/
│   │   ├── RiderMarker/
│   │   ├── ParticipantList/
│   │   ├── QuickMessagePanel/
│   │   ├── RideHeader/
│   │   └── ConnectionStatus/
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── socket.ts
│   │   └── location.ts
│   │
│   ├── stores/
│   │   ├── ride.store.ts
│   │   └── location.store.ts
│   │
│   ├── hooks/
│   │   ├── useRide.ts
│   │   ├── useSocket.ts
│   │   └── useGeolocation.ts
│   │
│   ├── types/
│   ├── utils/
│   ├── routes/
│   └── main.tsx
│
└── package.json
```

---

# 55. Main Screens

The MVP should include:

1. Home
2. Create Ride
3. Select Start
4. Select Destination
5. Ride Created / Share
6. Join Ride
7. Waiting Room
8. Active Ride
9. Participant Details
10. Quick Message Panel
11. End Ride Confirmation
12. Ride Completed

---

# 56. Responsive Design

The application is primarily intended for mobile browsers while remaining usable on desktop.

## Mobile

Map-first experience:

```text
┌──────────────────┐
│ Ride Header      │
├──────────────────┤
│                  │
│                  │
│      MAP         │
│                  │
│                  │
├──────────────────┤
│ Participants     │
├──────────────────┤
│ Quick Update     │
└──────────────────┘
```

## Desktop

Use a split layout:

```text
┌──────────────────────────────────────────────┐
│ Ride Header                                  │
├──────────────────────────────┬───────────────┤
│                              │ Participants  │
│                              │               │
│            MAP               │ Rider A       │
│                              │ Rider B       │
│                              │ Rider C       │
│                              │               │
│                              │ Quick Updates │
└──────────────────────────────┴───────────────┘
```

---

# 57. Home Screen

```text
RideTogether

Organize your group ride
and keep everyone together.

[ CREATE A RIDE ]

[ JOIN A RIDE ]
```

---

# 58. Ride Creation UX

Recommended flow:

```text
Step 1
Ride Details
       ↓
Step 2
Start Location
       ↓
Step 3
Destination
       ↓
Step 4
Review
       ↓
Create Ride
```

Keep the process short.

---

# 59. Active Ride UX

The active ride screen should prioritize:

1. Map
2. Current rider position
3. Other rider positions
4. Connection status
5. Quick updates
6. Participant list
7. Ride controls

The UI should avoid requiring riders to navigate through multiple pages while riding.

---

# 60. Safety-Oriented UX

The product should avoid encouraging riders to interact with the screen while moving.

Important actions should be:

- Large
- Simple
- Easily accessible
- Limited in number

Quick messages should require as little interaction as possible.

The application should include a general warning such as:

> Use the app only when it is safe to interact with your device. Do not use the phone while actively riding.

---

# 61. Quick Message UX

Use a bottom sheet or large button.

Example:

```text
Quick Update

┌────────────────────┐
│ 🚻 Washroom Break  │
├────────────────────┤
│ ⛽ Refueling       │
├────────────────────┤
│ 🍔 Food Break      │
├────────────────────┤
│ 🛑 Emergency Stop  │
├────────────────────┤
│ 🐢 Slow Down       │
├────────────────────┤
│ 📍 Waiting Here    │
└────────────────────┘
```

---

# 62. Performance Requirements

The application should remain responsive with at least:

```text
25–50 participants per ride
```

as an initial target.

The architecture should be designed so that higher participant counts can be supported later.

The frontend should avoid unnecessary React renders when GPS updates arrive.

Recommended approach:

- Keep location state separate from general ride state.
- Update only affected markers.
- Avoid rerendering the entire participant list on every location update.
- Use memoized map markers where appropriate.

---

# 63. Real-Time Performance Target

Under normal network conditions:

### Location propagation

Target:

```text
< 2–3 seconds
```

from participant update to other participants receiving the update.

### Quick messages

Target:

```text
< 1 second
```

for connected users under normal conditions.

These are product targets, not hard guarantees.

---

# 64. Battery / Browser Resource Optimization

The web application should:

- Avoid unnecessary GPS requests.
- Use movement-based updates where possible.
- Avoid excessive WebSocket traffic.
- Stop location tracking when the ride ends.
- Stop location tracking when the user leaves.
- Handle browser visibility changes appropriately.
- Show a warning if location updates become unavailable.

---

# 65. Data Privacy

The product should follow data minimization.

For MVP:

### Required participant data

```text
Name
Temporary participant ID
Ride ID
Location while ride is active
```

Avoid collecting:

- Phone number
- Email
- Address
- Contacts
- Unnecessary personal information

Location should only be collected while the participant is actively participating in an active ride.

---

# 66. Location Retention

For MVP, live location should be treated as ephemeral.

Recommended:

```text
Live location
    ↓
Redis / ephemeral state
    ↓
Deleted after ride/session expiry
```

Persistent route history should not be implemented unless explicitly required later.

---

# 67. Ride Expiration

To prevent abandoned rooms from accumulating:

Example policy:

```text
WAITING rides:
Expire after 24 hours of inactivity.

COMPLETED rides:
Retain only if ride history is implemented.

ACTIVE rides:
Remain active until organizer ends them,
subject to a safety timeout.
```

A future configurable timeout can automatically close abandoned active rides.

---

# 68. Security

Required protections:

- HTTPS
- Secure WebSocket connection
- Temporary participant tokens
- Organizer authorization
- Rate limiting
- Input validation
- Ride ID brute-force protection
- CORS configuration
- Security headers
- Server-side permission checks
- Coordinate validation
- Message rate limiting

---

# 69. Abuse Prevention

Because joining requires only a name, the application should account for abuse.

MVP protections:

- Rate limit ride joining.
- Rate limit Ride ID lookup.
- Rate limit quick messages.
- Validate participant names.
- Limit name length.
- Prevent duplicate/abusive requests.
- Allow organizer to remove participants.

Potential future features:

- Blocked participants
- CAPTCHA for suspicious activity
- Optional authentication

---

# 70. Suggested Name Rules

Participant name:

```text
Minimum: 1 character
Maximum: 30 characters
```

The frontend should trim whitespace.

The backend should also validate the same rules.

---

# 71. API Error Format

Use a consistent format:

```json
{
  "error": {
    "code": "RIDE_NOT_FOUND",
    "message": "Ride not found."
  }
}
```

Example codes:

```text
RIDE_NOT_FOUND
RIDE_COMPLETED
RIDE_NOT_ACTIVE
INVALID_RIDE_CODE
PARTICIPANT_NOT_FOUND
PARTICIPANT_REMOVED
UNAUTHORIZED
FORBIDDEN
RATE_LIMITED
INVALID_LOCATION
```

---

# 72. Observability

The backend should log:

- Ride creation
- Ride join
- Ride start
- Ride end
- Participant removal
- WebSocket connection
- WebSocket disconnection
- Location update errors
- Rate-limit events

Metrics to track later:

- Active rides
- Active participants
- WebSocket connections
- Location updates/sec
- Average location latency
- Quick message latency
- Error rate

---

# 73. Testing Requirements

## Frontend

Test:

- Create ride form
- Join ride
- Waiting room
- Participant rendering
- Ride state transitions
- Quick message UI
- Connection states

## Backend

Test:

- Ride creation
- Ride joining
- Authorization
- Start/end ride
- Remove participant
- Location validation
- Quick message rate limiting

## WebSocket

Test:

- Joining room
- Location broadcasting
- Participant joining/leaving
- Participant removal
- Ride start/end events
- Reconnection

## End-to-End

Test:

```text
Organizer Browser
        +
Rider Browser A
        +
Rider Browser B
```

Verify that:

1. Organizer creates ride.
2. Riders join.
3. All appear in waiting room.
4. Organizer starts ride.
5. Location sharing starts.
6. Rider A's location appears for B.
7. Quick message appears for everyone.
8. Organizer removes Rider B.
9. Rider B loses access.
10. Organizer ends ride.
11. Location sharing stops.

---

# 74. Development Phases

## Phase 1 — Project Foundation

Build:

- React + TypeScript + Vite
- Node.js + TypeScript
- PostgreSQL
- Basic API
- Basic routing
- Docker setup

---

## Phase 2 — Ride Creation

Build:

- Home
- Create ride
- Start location
- Destination
- Ride creation API
- Ride ID generation
- Share link

---

## Phase 3 — Joining

Build:

- Join by Ride ID
- Join by link
- Name entry
- Temporary participant session
- Waiting room
- Participant list

---

## Phase 4 — WebSocket Infrastructure

Build:

- Socket.IO
- Ride rooms
- Participant join event
- Participant leave event
- Reconnection
- Connection status

---

## Phase 5 — Live Location

Build:

- Browser Geolocation API
- Location permission flow
- Location updates
- Redis live location state
- WebSocket location broadcasting
- Stale location handling

---

## Phase 6 — Map

Build:

- MapLibre
- Map tiles
- Start marker
- Destination marker
- Current rider marker
- Other rider markers
- Marker selection
- Route visualization

---

## Phase 7 — Quick Messages

Build:

- Quick message panel
- Message events
- Popups/toasts
- Rate limiting

---

## Phase 8 — Organizer Controls

Build:

- Start ride
- End ride
- Remove participant
- Organizer authorization

---

## Phase 9 — Reliability & Security

Build:

- Rate limiting
- Validation
- Authorization
- Error handling
- Reconnection
- Location stale detection
- Security headers
- HTTPS

---

## Phase 10 — Testing & Deployment

Build:

- Unit tests
- Integration tests
- E2E tests
- Load tests
- Production deployment
- Monitoring

---

# 75. MVP Acceptance Criteria

## Ride Creation

- [ ] User can create a ride.
- [ ] User can select start location.
- [ ] User can select destination.
- [ ] Ride receives unique ID.
- [ ] Ride receives shareable link.
- [ ] Ride starts in `WAITING`.

## Joining

- [ ] User can join using Ride ID.
- [ ] User can join using share link.
- [ ] User only needs a name.
- [ ] Participant appears in waiting room.
- [ ] Organizer sees participant.
- [ ] Existing participants receive join event.

## Ride Start

- [ ] Only organizer can start ride.
- [ ] Ride changes to `ACTIVE`.
- [ ] All clients receive ride-start event.
- [ ] Location permission is requested.

## Live Location

- [ ] Browser obtains location.
- [ ] Location is sent through WebSocket.
- [ ] Other riders receive location.
- [ ] Rider markers update.
- [ ] Stale locations are identified.
- [ ] Location sharing stops when ride ends.

## Distance

- [ ] Participants can see distance to other riders.
- [ ] Distance updates as locations change.

## Quick Messages

- [ ] Participant can send predefined messages.
- [ ] Everyone receives the message.
- [ ] Message appears as a popup.
- [ ] Rate limiting prevents spam.

## Organizer Controls

- [ ] Organizer can remove a participant.
- [ ] Removed participant loses access.
- [ ] Organizer can end the ride.

## Reliability

- [ ] WebSocket automatically reconnects.
- [ ] Connection status is visible.
- [ ] Location failures are handled gracefully.

---

# 76. Non-Functional Requirements

## Performance

Target:

- Initial page load should be fast on mobile networks.
- Map interaction should remain responsive.
- Location updates should propagate within a few seconds.
- Quick messages should arrive within approximately one second under normal conditions.

## Availability

The backend should be designed for graceful recovery from:

- WebSocket disconnects
- Redis restart
- Temporary database failures
- Mobile network changes

## Scalability

Initial target:

```text
25–50 participants/ride
```

The architecture should eventually support:

```text
100+ participants/ride
```

without requiring a complete rewrite.

---

# 77. Recommended Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Routing | React Router |
| Backend | Node.js |
| Backend Language | TypeScript |
| API | REST |
| Real-time | Socket.IO |
| Database | PostgreSQL |
| ORM | TypeORM |
| Live State | Redis |
| Map | MapLibre GL JS |
| Map Data | OpenStreetMap ecosystem |
| Routing | OSRM |
| Reverse Proxy | Nginx |
| Containers | Docker |
| Testing | Vitest / Jest + Playwright |
| Deployment | Free-tier/self-hosted infrastructure |

---

# 78. Cost Strategy

The requirement is that the tools and infrastructure used for development and MVP should be free.

Preferred approach:

```text
React                    → Free/Open Source
Node.js                  → Free/Open Source
TypeScript               → Free/Open Source
PostgreSQL               → Free/Open Source
Redis                    → Free/Open Source
Socket.IO                → Free/Open Source
MapLibre                 → Free/Open Source
OpenStreetMap            → Open data ecosystem
OSRM                     → Open Source
Docker                   → Free for applicable use
Nginx                    → Free/Open Source
```

For hosted infrastructure, use free tiers where they exist and remain within their terms/limits.

For map tiles and routing, do not assume that an open-source project automatically means unlimited free hosted API usage. Self-hosting can be used when necessary.

---

# 79. Future Features

## Ride Scheduling

Allow organizers to schedule:

```text
Ride Date
Start Time
```

## QR Code

Generate:

```text
Scan → Join Ride
```

## Route Deviation

Detect when a rider moves significantly away from the planned route.

## Group Chat

Add text chat if quick messages are insufficient.

## Emergency Mode

A prominent emergency action that sends:

```text
🚨 Emergency
Sourov needs assistance.
Location: ...
```

## Ride History

Store:

- Route
- Duration
- Participants
- Distance
- Stops

## Ride Replay

Replay participant movement on a map.

## PWA

Allow users to install RideTogether on mobile home screens.

## Native Mobile Application

If browser background-location limitations become a problem, build a React Native application using the same Node.js backend.

---

# 80. Product Architecture Summary

```text
                         INTERNET
                             │
                             ▼
                  ┌────────────────────┐
                  │    React Web App   │
                  │                    │
                  │  Home              │
                  │  Create Ride       │
                  │  Join Ride         │
                  │  Waiting Room      │
                  │  Active Ride       │
                  │  Map               │
                  └─────────┬──────────┘
                            │
                    HTTPS / WebSocket
                            │
                            ▼
                  ┌────────────────────┐
                  │    Node.js API     │
                  │                    │
                  │  Ride Module       │
                  │  Participant       │
                  │  Location          │
                  │  Message           │
                  └─────────┬──────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
        ┌───────────────┐       ┌───────────────┐
        │  PostgreSQL   │       │     Redis     │
        │               │       │               │
        │ Ride metadata │       │ Live locations│
        │ Participants  │       │ Presence      │
        │ Ride state    │       │ Rate limits   │
        └───────────────┘       └───────────────┘
```

---

# 81. Core Product Principle

The application should be built around the concept of a **temporary real-time ride room**.

```text
Ride
 │
 ├── Organizer
 │
 ├── Participants
 │
 ├── Start Location
 │
 ├── Destination
 │
 ├── Ride Status
 │
 ├── Live Locations
 │
 └── Quick Messages
```

The database manages the **persistent identity and lifecycle of the ride**, while WebSockets and Redis manage the **real-time experience**.

This separation keeps the MVP simple, scalable, and suitable for future expansion.

---

# 82. Final MVP Scope

The first production-capable version should contain exactly these capabilities:

```text
CREATE RIDE
    ↓
START LOCATION
    ↓
DESTINATION
    ↓
GENERATE RIDE ID
    ↓
GENERATE SHARE LINK
    ↓
JOIN BY LINK / ID
    ↓
ENTER NAME
    ↓
WAITING ROOM
    ↓
ORGANIZER STARTS RIDE
    ↓
LIVE MAP
    ↓
REAL-TIME LOCATIONS
    ↓
DISTANCE BETWEEN RIDERS
    ↓
QUICK MESSAGES
    ↓
ORGANIZER CAN REMOVE RIDERS
    ↓
ORGANIZER ENDS RIDE
    ↓
LOCATION SHARING STOPS
```

Anything beyond this should be considered V2+ unless required during implementation.

---

# 83. Recommended First Implementation Milestone

Before implementing maps or GPS, build this complete flow:

```text
Organizer
    ↓
Create Ride
    ↓
Receive Ride ID
    ↓
Share Link
    ↓
Rider opens link
    ↓
Enters Name
    ↓
Joins Ride
    ↓
Organizer sees Rider
    ↓
Rider sees Organizer
    ↓
Organizer starts Ride
    ↓
Both clients receive RIDE_STARTED
```

Once this works reliably, add WebSocket location sharing.

This reduces complexity and lets the core ride-room architecture be tested before introducing GPS and mapping.
