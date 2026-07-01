# Grow Smart 🌾

An intelligent, enterprise-grade agricultural IoT dashboard designed for real-time biosystem telemetry, high-fidelity crop lifecycle tracking, digital journaling, and professional quality certification.

---

## 🚀 Key Features

### 📊 Real-Time Biosystem Telemetry
- **Dynamic Diagnostics**: Live tracking of soil moisture, ambient temperature, relative humidity, and solar exposure indices.
- **Visual Alert System**: Prompt notifications and threshold triggers protecting vulnerable crops from microclimate anomalies.

### 🌱 Advanced Plant Growth Tracker
- **Crop Lifecycles**: Log stages from seed germination through harvest.
- **Agronomist Digital Journal**: Register daily soil notes, custom fertilizer inputs, and visual observations per zone.

### 🎖️ High-Fidelity Quality Certification
- **Automated Scorecard**: Real-time quality evaluation assessing color uniformity, leaf-to-stem ratios, and size indexes.
- **Digital Certificates**: Generate instant export-ready agricultural certificates for market compliance and distribution.

### 🔌 Unified IoT Gateway Pairing
- **QR Camera Scanner**: Instant pairing using device-mounted QR matrices or barcode credentials.
- **Hardware Integration**: Live status monitors for physical temperature arrays, soil hubs, multi-spectrum LEDs, and automated water pumps.

---

## 🛠️ Technology Stack

- **Frontend**: React (v18+), TypeScript, Tailwind CSS, Vite.
- **Animations**: `motion` (Framer Motion) for fluid UI/UX state transitions.
- **Icons**: SVG library powered by `lucide-react`.
- **Backend & Database**: Fully integrated with **Supabase (PostgreSQL)** featuring strict Row Level Security (RLS) policies.
- **Resilient Sync Engine**: Automatically falls back to localized secure storage in sandbox environments.

---

## 💾 Database Schema Summary

The application interacts with several high-performance relational tables designed in PostgreSQL:

| Table | Primary Purpose | Key Fields |
| :--- | :--- | :--- |
| **`zones`** | Tracks agricultural partitions & telemetry thresholds | `id`, `name`, `soil_moisture`, `temperature`, `humidity`, `light_level`, `last_updated` |
| **`journal_entries`** | Digital ledger for growth monitoring | `id`, `crop_type`, `stage`, `notes`, `created_at`, `user_id` |
| **`alerts`** | Real-time security and climate notices | `id`, `title`, `message`, `type` (warning/info), `active` |
| **`devices`** | IoT Gateway registries & network statuses | `id`, `device_uid`, `nickname`, `status` (online/offline), `user_id` |

---

## ⚡ Development Setup

### Prerequisite Dependencies
Ensure you have **Node.js** (v18+) and **npm** installed on your workstation.

### Local Installation
1. Clone the repository and navigate to the project root:
   ```bash
   cd grow-smart
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in your `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anonymous-key
   ```
4. Run the local development server:
   ```bash
   npm run dev
   ```

---

## 🔒 Security & Compliance
- **Row-Level Security (RLS)**: Enforces strict data tenancy policies. Each agronomist has exclusive, isolated read/write privileges to their own registered crops and IoT endpoints.
- **Secure Sandbox Failover**: Gracefully processes local states if client network access is restricted or tables are being initialized.
