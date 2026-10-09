# Jai Sai Travels - Tours & Travels Car Rental Service
### Production-Ready MEAN Stack Web Application

A full-featured, responsive, high-performance MEAN stack (MongoDB, Express.js, Angular, Node.js) business profile and online car rental platform for **Jai Sai Travels**. Specializing in premier **Toyota Innova Crysta** car rentals, local city packages, outstation tours, 24/7 airport transfers, corporate travel, and wedding convoys.

---

## 🌟 Key Highlights & Features

### 🎨 Visual Design & Interaction
- **Display Mode Switcher (MODE)**:
  - ☀️ **White / Light Mode** (Ultra-Clean Luxury Porcelain White)
  - 🌙 **Dark Mode** (5 Rich Deep Obsidian & Neon Palettes)
- **6 Dynamic Switchable Themes**:
  1. *Pearl White (Light Mode)* — Clean luxury white pearl porcelain mode
  2. *Royal Blue & Gold (Dark - Default)* — Premium sapphire & gold luxury
  3. *Onyx Cyber Dark* — Sleek obsidian with electric cyan
  4. *Emerald Nature Green* — Forest emerald & warm sunlight gold
  5. *Royal Amethyst Purple* — Majestic violet & luminous rose glow
  6. *Sunset Warm Amber* — Warm terracotta & copper bronze
- **Theme & Mode Persistence**: Instant mode & theme switching with `localStorage` synchronization across sessions.
- **Glassmorphic UI**: Translucent cards, backdrop-filter blurs, radiant glows, hover micro-interactions, and active click ripple feedback.
- **Lenis Smooth Scroll**: Buttery smooth momentum scrolling across desktop and mobile devices.
- **Typing Hero Animation**: Dynamic typing effect introducing core services.
- **Animated Statistics Counter**: Real-time counting animation on scroll (15+ Years, 50,000+ Journeys, 250+ Corporate Clients, 4.9★ Rating).
- **Mobile-First Responsive Design**: Optimized across 320px, 480px, 768px, 1024px, and 1440px breakpoints with interactive mobile drawer menu.

---

### 🚗 Core Modules
1. **Home Module**: Hero banner with typing text, instant fare quote strip, Innova Crysta showcase, featured services, Why Choose Us, and parallax CTA banner.
2. **About Us Module**: 15+ years milestone timeline, Mission / Vision / Core Values, 4 dedicated team profile cards, and 6 core value pillars.
3. **Vehicle Fleet Module (Toyota Innova Crysta)**:
   - High-definition image showcase with interactive thumbnail selector and zoom modal.
   - Comprehensive technical specifications (7-8 seater, dual auto AC, Bluetooth infotainment, power steering, GPS telematics, luggage capacity, 7 SRS airbags).
   - 4 Transparent rental package cards (Local 8h/80km, Outstation per km, Airport flat rates, Corporate tariffs) with quick reservation form.
4. **Gallery Module**:
   - Filter tabs: All, Fleet, Interior, Tours, Events, Airport, Videos.
   - Layout toggle: Grid View and List View.
   - Lightbox modal with zoom in/out, keyboard arrow navigation, and video player support (MP4, WebM).
   - Upload media modal with file upload or external URL, cover image tag, and bulk delete.
5. **Services Module**: Detailed cards for Local Travel, Outstation Trips, 24/7 Airport Pickups, Corporate Travel, Wedding Fleets, and Long-Term Rentals with dedicated modal booking triggers.
6. **Contact Module**: 24/7 Click-to-call, Direct WhatsApp messaging with pre-filled text, validated inquiry form, and Google Maps embed.
7. **Admin Portal (`/admin/login` & `/admin/dashboard`)**:
   - JWT authentication with bcrypt password encryption.
   - Live analytics KPIs (total bookings, pending review, confirmed trips, active services, media count).
   - **Bookings Management**: Table with status filter (`pending`, `confirmed`, `completed`), status updater, direct WhatsApp passenger button, and deletion.
   - **Services Management (CRUD)**: Create, edit, toggle active status, and delete services.
   - **Gallery Management (CRUD)**: Upload media, edit categories, set cover media, and bulk delete.
   - **Site Settings & Theme Manager**: Edit company name, contact numbers, email, address, operating hours, and sync default active theme.
   - **Admin Profile**: Change username, email, and password.

---

## 🗄️ Database Schemas (Mongoose / MongoDB)

### 1. Gallery Schema
```javascript
{
  title: String,
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  url: String,
  thumbnail: String,
  category: String,
  order: Number,
  isCover: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Services Schema
```javascript
{
  title: String,
  description: String,
  icon: String,
  features: [String],
  priceRange: String,
  isActive: Boolean,
  order: Number
}
```

### 3. Booking Schema
```javascript
{
  name: String,
  email: String,
  phone: String,
  service: String,
  date: Date,
  message: String,
  status: { type: String, enum: ['pending', 'confirmed', 'completed'], default: 'pending' },
  createdAt: Date
}
```

### 4. Admin Schema
```javascript
{
  username: { type: String, required: true, unique: true },
  password: String, // Hashed with bcryptjs
  email: String,
  role: String
}
```

### 5. Settings Schema
```javascript
{
  theme: String,
  siteTitle: String,
  tagline: String,
  contactPhone: String,
  whatsappPhone: String,
  contactEmail: String,
  address: String,
  socialLinks: Object,
  businessHours: String
}
```

---

## 📡 REST API Endpoints

| Resource | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/api/health` | Public | Healthcheck status |
| **Gallery** | `GET` | `/api/gallery` | Public | List media (supports `?category=` & `?type=`) |
| | `POST` | `/api/gallery` | Protected | Upload media item (supports file or URL) |
| | `PUT` | `/api/gallery/:id` | Protected | Update media details |
| | `DELETE` | `/api/gallery/:id` | Protected | Delete single media item |
| | `POST` | `/api/gallery/bulk-delete` | Protected | Bulk delete array of IDs |
| **Services** | `GET` | `/api/services` | Public | List active services (`?all=true` for admin) |
| | `POST` | `/api/services` | Protected | Create new travel service |
| | `PUT` | `/api/services/:id` | Protected | Update service details |
| | `DELETE` | `/api/services/:id` | Protected | Delete service |
| **Bookings** | `POST` | `/api/bookings` | Public | Submit customer trip inquiry |
| | `GET` | `/api/bookings` | Protected | List all bookings (`?status=`) |
| | `PUT` | `/api/bookings/:id` | Protected | Update booking status |
| | `DELETE` | `/api/bookings/:id` | Protected | Delete booking record |
| **Admin** | `POST` | `/api/admin/login` | Public | Admin login & JWT generation |
| | `POST` | `/api/admin/register` | Public | Register new admin |
| | `GET` | `/api/admin/profile` | Protected | Get admin profile |
| | `PUT` | `/api/admin/profile` | Protected | Update admin profile & password |
| | `GET` | `/api/admin/stats` | Protected | Dashboard analytics metrics |
| **Settings** | `GET` | `/api/settings` | Public | Get company & theme settings |
| | `PUT` | `/api/settings` | Protected | Update company & theme settings |

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (Tested on Node v20/24)
- [MongoDB](https://www.mongodb.com/) (Optional: The backend has automatic in-memory fallback if MongoDB is not running locally)

---

### 1. Backend Setup & Run
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# (Optional) Copy environment variables
cp .env.example .env

# Start development server (Port 5000)
npm run dev
# OR
npm start
```
The API server will run at `http://localhost:5000`.

---

### 2. Frontend Setup & Run
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Angular development server
npm start
# OR
npx ng serve
```
Open your browser and navigate to `http://localhost:4200`.

---

## 🔐 Default Admin Credentials

For immediate evaluation and local testing:
- **Login URL**: `http://localhost:4200/admin/login`
- **Username**: `admin`
- **Password**: `Admin@12345`

*(The login page also includes a 1-click **"Auto-fill default admin credentials"** button).*

---

## ☁️ Deployment Instructions

### 1. Backend on Render (`https://render.com`)
1. Create a **New Web Service** connected to your repository.
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: `<Your MongoDB Atlas connection URI>`
   - `JWT_SECRET`: `<Your secure random string>`
   - `CLIENT_URL`: `https://your-frontend-domain.vercel.app`
*(Alternatively, use the included `render.yaml` for 1-click Blueprint deployment).*

### 2. Frontend on Vercel (`https://vercel.com`)
1. Create a **New Project** connected to your repository.
2. Root Directory: `frontend`
3. Framework Preset: `Angular`
4. Build Command: `npm run build`
5. Output Directory: `dist/frontend/browser` (or `dist/frontend`)
6. The included `vercel.json` will automatically configure Single Page Application route rewrites.

---

## 📂 Project Directory Structure

```
jai-sai-travels/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection & seeding
│   │   ├── models/
│   │   │   ├── Admin.js              # Admin user schema with bcrypt
│   │   │   ├── Gallery.js            # Media item schema
│   │   │   ├── Service.js            # Travel service schema
│   │   │   ├── Booking.js            # Booking inquiry schema
│   │   │   └── Settings.js           # Business profile & theme schema
│   │   ├── controllers/
│   │   │   ├── adminController.js     # Auth, profile, analytics stats
│   │   │   ├── galleryController.js   # Media CRUD & bulk delete
│   │   │   ├── serviceController.js   # Services CRUD
│   │   │   ├── bookingController.js   # Customer bookings & status updates
│   │   │   └── settingsController.js  # Settings & theme persistence
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── galleryRoutes.js
│   │   │   ├── serviceRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   └── settingsRoutes.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js      # JWT verification
│   │   │   ├── uploadMiddleware.js    # Multer file upload validation
│   │   │   └── errorHandler.js       # Centralized error handler
│   │   └── app.js                     # Express app, Helmet, CORS, Rate Limit
│   ├── server.js                      # Backend entry point
│   ├── package.json
│   ├── .env.example
│   └── render.yaml                    # Render deployment blueprint
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── services/          # Api, Auth, Theme, Lenis, Notification
│   │   │   │   ├── guards/            # AuthGuard
│   │   │   │   └── interceptors/     # JwtInterceptor
│   │   │   ├── shared/
│   │   │   │   ├── components/        # Header, Footer, ThemeSwitcher, Toast, Lightbox, BackToTop, Breadcrumb
│   │   │   │   ├── models/            # GalleryItem, Service, Booking, Settings, Admin
│   │   │   │   └── pipes/             # EncodeUriPipe
│   │   │   ├── modules/
│   │   │   │   ├── home/              # Hero, typing effect, stats, Innova preview, CTA
│   │   │   │   ├── about/             # Timeline, mission/vision, team, 6 pillars
│   │   │   │   ├── vehicles/          # Innova Crysta showcase, specs, packages, zoom
│   │   │   │   ├── services/          # 6 Travel services with booking modal
│   │   │   │   ├── gallery/           # Grid/List media gallery, categories, upload, lightbox
│   │   │   │   ├── contact/           # Contact cards, inquiry form, Google Maps
│   │   │   │   └── admin/             # JWT Login & Admin Dashboard CRUD
│   │   │   ├── app.ts                 # Root App component
│   │   │   ├── app.html
│   │   │   └── app.routes.ts          # Application routes
│   │   ├── styles/
│   │   │   └── themes.css             # 5 Themes & Glassmorphism styles
│   │   ├── environments/
│   │   │   ├── environment.ts
│   │   │   └── environment.prod.ts
│   │   ├── styles.css                 # Tailwind & typography
│   │   ├── index.html                 # SEO & PWA metadata
│   │   └── main.ts
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vercel.json                    # Vercel SPA configuration
└── README.md
```

---

## 🔒 Security Best Practices Implemented
- **JWT Authorization**: Secure token generation with expiry and bearer header checks.
- **Password Hashing**: Strong bcrypt salt hashing before persistence.
- **Helmet.js**: Enterprise HTTP headers (`X-Content-Type-Options`, `X-Frame-Options`, `XSS-Protection`).
- **Express Rate Limiting**: Anti-DDoS and API abuse prevention.
- **CORS Protection**: Restricted and configurable allowed origins.
- **Input Sanitization**: Mongoose schema validation and type checking.

---

## ⚡ Performance
- Initial bundle size: **~99 kB** (transferred), initial total **~400 kB** raw.
- Full lazy loading on all feature modules.
- Lenis hardware-accelerated smooth scrolling.
- PWA manifest ready for progressive web app installation.
