# 🏡 LandEstate — Full-Stack MERN Land & Plot Marketplace

A premium, full-stack real-estate web platform built for discovering, buying, selling, and managing land plots in **Gorakhpur and Uttar Pradesh**.

---

## ✨ Key Features

- **🏛️ Dynamic Marketplace**: Verified residential, commercial, industrial (GIDA), and agricultural farm plots.
- **📍 Local UP Land Units**: Full support for **Sq.Ft**, **Bigha**, **Biswa**, **Dhur**, **Gaj**, and **Acre**.
- **🔍 Advanced Real-Time Filtering**: Filter by City/District, Category, Budget Range, Area Range, and Road-Facing plots.
- **🗺️ Interactive Map & Landmarks**: GPS coordinates mapped via OpenStreetMap/Leaflet with proximity to major landmarks.
- **💬 Direct Owner Communication**: Direct Call, WhatsApp (pre-filled message), and Enquiry Modal without middleman commissions.
- **📝 Multi-Step Listing Wizard**: 3-step property onboarding with multi-image live previews and validation.
- **🛡️ Admin Dashboard**:
  - Approve / Reject submitted listings
  - Inline editing & status updates (*Available / Sold*)
  - Toggle Featured property badges
  - Inquiry inbox with direct buyer contact actions (*Phone, WhatsApp, Email*)
- **☀️ Luxury Light Theme**: Clean, responsive, high-contrast UI with emerald green and warm gold design tokens.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router v6, React-Leaflet, React-Icons, React-Hot-Toast
- **Styling**: Modern CSS Design System (Custom Glassmorphism & Light Theme tokens)
- **Backend**: Node.js, Express.js, Multer (file uploads), JWT Authentication, bcryptjs
- **Database**: MongoDB & Mongoose (with automatic in-memory fallback for instant dev preview)

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Sameer-11-16/Estate.git
cd Estate
```

### 2. Install dependencies
```bash
# Install root & server dependencies
npm install

# Install client dependencies
npm install --prefix client
```

### 3. Configure Environment Variables
Create a `.env` file inside `server/` (or copy `server/.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/landestate
JWT_SECRET=your_secret_jwt_key
NODE_ENV=development
```

### 4. Run Development Server
```bash
npm run dev
```
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🔑 Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@landestate.in` | `admin123456` |
| **Seller** | `seller@landestate.in` | `seller123456` |

---

## 📄 License
ISC License © 2024 LandEstate
