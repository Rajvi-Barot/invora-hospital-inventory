# INVORA  
### Smart Hospital Inventory & Cloud Resource Network

INVORA is a **secure, scalable hospital management platform** designed to manage medical inventory, monitor temperature-sensitive storage, and enable **inter-hospital resource sharing** through a Master Cloud Network.

It replaces error-prone manual systems (paper/Excel) with **real-time monitoring, alerts, and accountability**, improving patient safety and hospital efficiency.

---

## Project Overview

INVORA helps hospitals to:

Digitally manage medical inventory  
Monitor cold-chain items (blood, vaccines, medicines)  
Receive real-time alerts for unsafe conditions  
Maintain detailed audit logs  
Share urgent resources with other hospitals through a **Master Cloud Hospital Network**

Each hospital operates independently with its own local system while staying connected for emergencies.

---

## Problem Statement & Significance

Many hospitals still rely on **manual or disconnected inventory systems**, leading to serious operational issues.

### Key Problems
- Inventory tracked using paper or Excel causes mistakes  
- Missing supplies delay urgent medical care  
- No continuous monitoring of temperature-sensitive items  
- Manual calling/searching for resources wastes time  
- Healthcare systems are vulnerable to cyberattacks  

### Why It Matters
Hospitals must have the **right item at the right time in a safe condition**.  
Any delay, missing stock, or unsafe storage directly impacts patient safety.

---

## Proposed Solution – INVORA System

INVORA is a **secure MERN-based platform** that combines inventory management, IoT safety monitoring, and cloud-based collaboration.

### Inventory Management
- Tracks stock across **Hospital → Department → Room → Bin**
- Real-time stock availability
- Low-stock and reorder alerts
- Full audit logs (who / what / when)

### IoT Temperature Safety (Cold-Chain)
- Monitors temperature-sensitive storage
- Sensor data sent as JSON (Node-RED simulation)
- Safe range checks (e.g., 2°C–8°C)
- Dashboard shows **Safe / Unsafe** status
- Automatic alerts for violations

### Reliability Monitoring
- Periodic sensor updates
- Watchdog detects sensor failure
- Alerts for missing or abnormal readings
- Event logs stored for review

### Security
- JWT-based authentication
- Hashed and encrypted credentials
- Input validation to prevent:
  - XSS
  - NoSQL Injection
  - Abuse / DDoS attacks

---

## Advanced Feature: Master Cloud Hospital Network  
### (Inter-Hospital Resource Exchange)

INVORA introduces a **Master Cloud Network** that connects multiple hospitals for urgent resource sharing.

### Concept
- One **Master Cloud** manages communication
- Multiple hospitals connected under the cloud
- Each hospital has:
  - Its own local server
  - Its own database
  - Full data privacy and control
- Hospitals can request:
  - Medicines / inventory
  - Doctors / nurses / staff
  - Emergency tools and supplies

---

## How the Master Cloud Works (Workflow)

Hospital A detects a shortage  
Hospital A creates a request:
- Resource type (Inventory / Staff)
- Quantity or role needed
- Urgency level and deadline  

Request is posted to the Master Cloud  
Other hospitals view the request  
Hospitals respond with:
- Available quantity
- Estimated delivery time
- Staff availability window  

Master Cloud selects best match based on:
- Availability
- Urgency
- Response time  

Confirmation is sent and logged:
- Status updated to **Fulfilled**
- Audit logs updated for all hospitals

---

## Real-World Benefits

✔ Faster emergency response  
✔ Reduced manual coordination  
✔ Trusted and logged resource sharing  
✔ Better handling of peak demand situations  
✔ Improved patient safety and care quality  

---

## Architecture Overview

### Level 1: Local Hospital System
- MERN web application
- Local MongoDB database
- IoT sensor integration
- Inventory, monitoring, and logs

### Level 2: Master Cloud Network
- Request & offer matching engine
- Network-wide request visibility
- Confirmation and audit trail
- Local-first design (cloud optional)

---

## Tech Stack

### Frontend
- React

### Backend
- Node.js
- Express.js

### Database
- MongoDB (per hospital)

### IoT & Monitoring
- Node-RED (sensor simulation)
- JSON-based temperature data

### Real-Time
- Socket.IO (WebSockets)

### Security
- JWT Authentication
- Encryption & hashing
- Input validation

### Cloud & Deployment
- AWS / Google Cloud
- Docker (local + cloud)

---

With the **Master Cloud Hospital Network**, INVORA becomes a **scalable, real-world healthcare platform** enabling hospitals to support each other during emergencies through a trusted, secure, and logged system.

---

# How To Run The Project

## Clone The Repository

```bash
git clone https://github.com/Rajvi-Barot/invora-hospital-inventory.git
cd invora-hospital-inventory
```

---

## Backend Setup

Go to Backend folder:

```bash
cd backend
```

Copy `.env.example` to `.env` inside the backend folder and fill in:

```env
PORT=3000
MONGO_URI = YOUR_MONGO_URL
JWT_SECRET = YOUR_JWT_SECRET_KEY
```

Install dependencies and start server:

```bash
npm install
npm start
```

Backend runs on:

```
http://localhost:3000
```

---

## Frontend Setup

Open a new terminal and run:

```bash
cd Frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:8080
```

---

# Node-RED Setup (Sensor Simulation)
- Open Node-RED
- Import sensor-flow.json
- Click Deploy
- Ensure the HTTP request node sends data to:
```bash
http://localhost:3000/api/sensors
```

# Run Backend Tests

Inside the backend folder:

```bash
npm test
```

---

# Requirements

- Node.js (v18+ recommended)
- MongoDB running locally
- Node-RED (if using sensor simulation)

---

# My Contribution (Rajvi Barot)

Built as a 4-sprint Scrum project (Jan-Mar 2026) in a team of 5 for the Software Engineering master's program at Ontario Tech University.

- Built the React frontend: designed screens and connected them to the backend REST APIs
- Supported the Master Cloud feature (how hospitals connect to the cloud network)
- Tested the end-to-end flow
- Took part in sprint planning and reviews

---

# Authors

- Deepanshu Chand  
- Harsh Vardhan  
- Anuj Kumar  
- Rajvi Amit Barot  
- Shreya Patel  

---
