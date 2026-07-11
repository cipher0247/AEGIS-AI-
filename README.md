# AEGIS-AI // Strategic Offensive Intelligence Hub

> High-fidelity tactical offensive cyber-intelligence platform. Powered by neural reconnaissance, integrated OSINT telemetry, automated exploit synthesis, and interactive security operations.

![Aegis AI Core Console](https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80)

---

## 🌐 Overview
**AEGIS-AI** is a cutting-edge offensive security dashboard and command center. It provides cybersecurity operators with simulated high-fidelity intelligence, automated vulnerability correlation, real-time threat exfiltration, and interactive system logs formatted in an immersive tactical terminal design.

---

## ⚡ Core Features
- **🎯 Recon Hub:** Input and resolve scope targets with visual intelligence telemetry indicators (OWASP compliance scoring, risk indexing, and operational threat logs).
- **🛡️ Vulnerability Matrix:** Dynamic list of identified critical, high, and medium exploits (e.g., Unauthenticated Diagnostic Data Leakage, SQL Injection, Broken Access Control) with rich payload analyses.
- **🛰️ Heuristic & OSINT Sensors:** Automated reconnaissance scans correlating network footprint details and external telemetry.
- **💬 Neural Aegis Command (AI Chat Panel):** Highly responsive assistant panel featuring an integrated terminal emulator, interactive quick commands, and real-time streaming correlation output.
- **📥 Intel Exfiltration (Export Engine):** Secure reporting module supporting multiple format exports:
  - **JSON:** Complete raw intelligence dataset structure.
  - **HTML:** Interactive, modern, standalone security report page with embedded styling.
  - **PDF:** Printer-ready, clean black-and-white classified security audit document.
- **🔐 Operator Authenticator:** Firebase-backed operator registration, login history logging, and secure credential handling.

---

## 🛠️ Technology Stack
- **Frontend:** React (v19) + Vite
- **Animations:** Motion (Framer Motion)
- **Styling:** Tailwind CSS (v4)
- **Icons:** Lucide React
- **Backend Server:** Express (serving production-optimized single-page build)
- **Database & Auth:** Firebase Firestore & Firebase Authentication (with secure rule controls)
- **TypeScript:** Strict type safety checking across components and services

---

## 🚀 Local Installation & Setup

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Clone & Navigate
```bash
git clone https://github.com/your-username/aegis-ai.git
cd aegis-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory (using `.env.example` as a template):
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# AI Engine Key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Launch Development Environment
```bash
npm run dev
```
The application will boot on `http://localhost:3000`.

### 5. Production Build
To bundle the frontend assets and prepare the backend production server:
```bash
npm run build
npm start
```

---

## 🔒 Security & Firebase Rules
The Firebase database relies on structured, owner-validated security protocols specified in `firestore.rules`:
- Operators can read/create their security profiles.
- Automated security audits are recorded to log entries upon authentication events.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
