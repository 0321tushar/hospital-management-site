# PulseAura Health OS — MERN Stack Hospital Management System

A full-stack, enterprise-grade Hospital Management System (HMS) built with the **MERN Stack** (MongoDB, Express, React, Node.js) inspired by **DocPulse** and **DM Aarogya**, engineered with **zero external API dependencies** for client live projects.

---

## 🌟 Key Features

### 1. Public Patient Web Portal
- **24/7 Emergency Header**: Live emergency hotline, ambulance dispatch, and NABH accreditation badge.
- **Hero & Instant Appointment Booking Widget**: 4-step wizard (Specialty &rarr; Doctor &rarr; Slot &rarr; Patient Details &rarr; Instant Token generation).
- **Live OPD Waiting Lounge Queue Display**: Real-time digital signage showing active room tokens per doctor chamber.
- **Specialties Showcase**: Cardiology, Neurology, Orthopedics, Pediatrics, Internal Medicine, Obstetrics & Gynecology, Oncology, Nephrology.
- **Doctor Directory**: Filterable by clinical department with qualifications, consultation fees, and direct booking.
- **Patient Self-Service Health Portal**: Lookup by UHID (e.g. `PA-2026-0056`) or phone number to view prescriptions, test reports, and invoices.

### 2. Hospital Staff Operations ERP Desk
- **Overview Metrics**: Total patients registered, bed occupancy rate %, today's OPD consultation count, active doctors.
- **Patient Registration & UHID**: Auto-generates standardized UHID (`PA-2026-XXXX`), blood group, allergies, emergency contacts.
- **Inpatient (IPD) Visual Bed Matrix**: Color-coded bed matrix (General Wards, Semi-Private, ICU, Deluxe Suites) with 1-click admission and discharge.
- **Doctor Consultation Desk & EMR**: Vitals tracker (BP, Pulse, SpO2, Temp), ICD-10 diagnosis, digital medication prescription pad (`1-0-1`, dosage, duration), and official printable prescription format.
- **Pharmacy & Inventory Management**: Medicine catalog, batch numbers, expiry dates, unit prices, and low-stock threshold alerts.
- **Central Billing & Invoicing Desk**: Itemized billing calculator, GST/tax, discount, payment modes (Cash, Card, UPI), and printable tax invoices.
- **Live Hospital Configurator**: Change Hospital Name, address, emergency phone, and currency symbol (`₹`, `$`, `€`, `£`) live on the fly.

### 3. Print / PDF Letterhead Engine
- **Doctor Prescription**: Formal hospital letterhead with doctor registration number, Rx symbol, medications table, QR code verification, and doctor electronic signature.
- **Hospital Tax Invoice**: Itemized breakdown with taxes and payment receipts.
- **Patient Plastic ID Card**: With UHID barcode simulation.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- (Optional) Local MongoDB or MongoDB Atlas URI (The app automatically runs in in-memory fallback mode if MongoDB is not running, so it never crashes!)

### 1. Install Dependencies
```bash
# In the client folder
cd client
npm install

# In the server folder
cd ../server
npm install
```

### 2. Run Backend Server (Port 5000)
```bash
cd server
npm start
# Server runs on http://localhost:5000
```

### 3. Run React Frontend (Port 5173)
```bash
cd client
npm run dev
# App runs on http://localhost:5173
```

### 4. (Optional) Seed MongoDB Database
```bash
cd server
npm run seed
```

---

## 📁 Project Architecture

```
hospital management system/
├── client/                     # React Frontend (Vite + Modern UI)
│   ├── src/
│   │   ├── components/         # Navbar, HeroBooking, LiveQueueBoard, DoctorDirectory, StaffERP, PrintModal
│   │   ├── services/api.js     # Communicates with Express API (with automatic local fallback)
│   │   ├── App.jsx             # Main Router & Dual-Mode Controller
│   │   ├── index.css           # Design system tokens, glassmorphism, responsive grid & print CSS
│   │   └── main.jsx
│   └── package.json
├── server/                     # Node.js + Express + Mongoose Backend
│   ├── config/db.js            # Mongoose connection with graceful fallback
│   ├── models/                 # Patient, Doctor, Appointment, Bed, Prescription, Medicine, Invoice, Hospital
│   ├── seeder.js               # Seed dataset generator
│   ├── server.js               # REST API endpoints
│   ├── .env                    # Environment variables (PORT, MONGO_URI)
│   └── package.json
├── package.json                # Root package.json
└── README.md
```
