# Murrabi Desk OS: Premium Administrative Suite

**Murrabi Desk OS** is a high-fidelity, Liquid Glass desktop application built with **Next.js 14** and **Electron**. It provides an integrated, mission-critical interface for administrative synchronization, scheduling, and specialized mission logging.

---

## 🚀 Getting Started

To run this application on your local machine, follow these steps:

### 1. Prerequisites
Ensure you have the following installed:
- **Node.js** (Version 18.x or higher)
- **npm** (Included with Node.js)

### 2. Installation
Clone the repository and install the dependencies:
```bash
git clone <repository-url>
cd murabbi-desk
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory and add your Google API credentials (required for Calendar and Identity synchronization):
```bash
# GOOGLE API CREDENTIALS
# Get these from https://console.cloud.google.com/
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NEXTAUTH (Used for secret generation)
NEXTAUTH_SECRET=your_random_secret_string
NEXTAUTH_URL=http://localhost:3000
```

### 4. Launching the App
Run the following command to start the development logic and launch the Electron shell:
```bash
npm run launch
```
*Note: This command handles the Next.js server boot and the Electron window rendezvous automatically.*

---

## 📦 Packaging & Distribution

If you want to create a standalone application (e.g., a `.dmg` for macOS or `.exe` for Windows):

### Build for macOS
```bash
npm run dist
```
This will generate a production-ready installer in the `/dist` directory.

---

## 🛠️ Technical Stack
- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + "Liquid Glass" Vanilla CSS
- **Runtime**: Electron 33 (Native Shell)
- **Identity**: Google OAuth 2.0 (Identity Genesis)
- **Icons**: Lucide React

---
**Developed by the Murrabi Desk Native Team**  
*Mission Protocol Version 6.0 Stable*
