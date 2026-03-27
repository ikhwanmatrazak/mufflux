# Mufflux Exhaust System — E-Commerce Website

> Built for the Road. Made to Roar. 🏍️

A full-stack e-commerce platform for Mufflux Exhaust System — Malaysia's premier motorcycle exhaust brand.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + HeroUI v2 + Tailwind CSS |
| State | Zustand |
| i18n | i18next (EN + BM) |
| Backend | Python 3.11 + FastAPI |
| ORM | SQLAlchemy + Alembic |
| Database | MySQL 8.0 |
| Payment | Billplz (FPX / Card / eWallet) |
| Images | Cloudinary |
| Deployment | Dokploy (Docker — 3 containers) |

---

## Dokploy Deployment Guide

### Prerequisites
- A VPS/server with Docker & Docker Compose installed
- Dokploy installed: `curl -sSL https://dokploy.com/install.sh | sh`
- A domain name pointed to your server IP (A record)

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/yourusername/mufflux.git
cd mufflux
```

---

### Step 2 — Configure Environment Variables

```bash
cp .env.example .env
nano .env
```

Fill in all required values:

| Variable | Description |
|---|---|
| `DOMAIN` | Your domain e.g. `mufflux.com` |
| `MYSQL_ROOT_PASSWORD` | Strong MySQL root password |
| `MYSQL_USER` | Database user |
| `MYSQL_PASSWORD` | Database user password |
| `MYSQL_DB` | Database name (`mufflux_db`) |
| `JWT_SECRET` | Random string, min 32 chars |
| `CLOUDINARY_URL` | From Cloudinary Dashboard |
| `BILLPLZ_API_KEY` | From Billplz Settings > API |
| `BILLPLZ_COLLECTION_ID` | Your Billplz collection ID |
| `BILLPLZ_SANDBOX` | `true` for testing, `false` for production |
| `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | E.g. `60123456789` |

---

### Step 3 — Deploy via Dokploy UI

1. Open Dokploy at `http://your-server-ip:3000`
2. Create a new **Docker Compose** project
3. Upload your `docker-compose.yml` or paste its contents
4. Add all environment variables from your `.env` file
5. Click **Deploy**

Or deploy manually:

```bash
docker compose up -d --build
```

---

### Step 4 — Run Database Migrations (Alembic)

After containers are up:

```bash
# Enter the backend container
docker compose exec backend bash

# Run migrations
alembic upgrade head

# Exit
exit
```

The `schema.sql` is automatically loaded when the MySQL container first starts (via `docker-entrypoint-initdb.d`).

---

### Step 5 — Configure Traefik SSL (via Dokploy)

Dokploy manages Traefik automatically. To enable HTTPS:

1. In Dokploy dashboard → **Domains** → Add your domain
2. Enable **Let's Encrypt** for automatic SSL
3. Traefik labels in `docker-compose.yml` handle routing:
   - `mufflux.com` → Frontend (port 3000)
   - `api.mufflux.com` → Backend (port 8000)

---

### Step 6 — Create Admin User

Via the FastAPI interactive docs at `https://api.mufflux.com/docs`:

1. `POST /auth/register` — register a user
2. In MySQL, update the role:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@mufflux.com';
```

Or via the backend container:

```bash
docker compose exec db mysql -u mufflux_user -p mufflux_db -e \
  "UPDATE users SET role='admin' WHERE email='your@email.com';"
```

---

### Step 7 — Configure Billplz Webhook

In Billplz Dashboard:
- Set **Callback URL** to: `https://api.mufflux.com/payments/billplz/callback`
- Set **Redirect URL** to: `https://mufflux.com/checkout/confirmation`

---

### Step 8 — Upload Logo

Place your logo at `frontend/public/logo.png` before building, or use Cloudinary.

---

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env           # fill in values
uvicorn app.main:app --reload
```

Backend available at: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
cp ../.env.example .env.local     # fill in values
npm run dev
```

Frontend available at: `http://localhost:3000`

### Database (local)

```bash
docker run -d \
  --name mufflux-db \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=mufflux_db \
  -e MYSQL_USER=mufflux_user \
  -e MYSQL_PASSWORD=dbpass \
  -p 3306:3306 \
  -v $(pwd)/schema.sql:/docker-entrypoint-initdb.d/schema.sql \
  mysql:8.0
```

---

## Project Structure

```
mufflux/
├── schema.sql                  # MySQL 8.0 database schema
├── docker-compose.yml          # 3-service Docker setup
├── .env.example                # Environment template
├── frontend/
│   ├── app/
│   │   ├── (store)/            # Customer-facing pages
│   │   │   ├── page.tsx        # Homepage
│   │   │   ├── products/       # Catalog + Detail
│   │   │   ├── cart/           # Shopping cart
│   │   │   ├── checkout/       # 3-step checkout
│   │   │   ├── account/        # Orders, Addresses, Wishlist, Profile
│   │   │   ├── blog/           # Blog listing + posts
│   │   │   └── installation/   # Booking form
│   │   ├── (admin)/            # Admin panel (role=admin only)
│   │   │   ├── dashboard/      # Stats + revenue chart
│   │   │   ├── products-admin/ # Product CRUD
│   │   │   ├── orders-admin/   # Order management
│   │   │   ├── customers/      # Customer list
│   │   │   ├── blog-admin/     # Blog editor (TipTap)
│   │   │   ├── bookings/       # Installation bookings
│   │   │   └── settings-admin/ # Store settings
│   │   ├── login/
│   │   └── register/
│   ├── components/
│   │   ├── ui/                 # Navbar, Footer, WhatsApp, MobileNav
│   │   └── store/              # ProductCard, etc.
│   ├── store/                  # Zustand stores
│   ├── lib/                    # API client, i18n
│   └── locales/                # en.json, bm.json
└── backend/
    ├── app/
    │   ├── main.py             # FastAPI app entry point
    │   ├── database.py         # SQLAlchemy engine + session
    │   ├── models/             # SQLAlchemy ORM models
    │   ├── schemas/            # Pydantic request/response schemas
    │   ├── routers/            # API route handlers
    │   └── utils/              # JWT, Cloudinary, Billplz utilities
    ├── alembic/                # Database migrations
    ├── requirements.txt
    └── Dockerfile
```

---

## API Documentation

After starting the backend, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## Brand Colors

| Color | Hex | Usage |
|---|---|---|
| Magenta | `#D400A8` | Primary CTAs, accents |
| Golden Yellow | `#F5C200` | Secondary, loyalty |
| Deep Black | `#0A0A0A` | Background |
| White | `#FFFFFF` | Text |

---

## Support

For issues or questions, contact: info@mufflux.com
