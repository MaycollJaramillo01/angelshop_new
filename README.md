# Ángel Shop Monorepo

Sistema completo para catálogo, reservas sin pago y administración en tiempo real para Ángel Shop (Orotina, Costa Rica).

## Requisitos
- Node.js 20
- npm 9+
- Docker y Docker Compose

## Inicio rápido
1. Levantar MongoDB en modo réplica (single node):
   ```bash
   docker compose up -d
   ```
2. Instalar dependencias y correr modo desarrollo (backend + frontend):
   ```bash
   npm install
   npm run dev
   ```

Frontend en http://localhost:5173 y backend en http://localhost:4000.

## Variables de entorno
- Backend: `backend/.env.example`
- Frontend: `frontend/.env.example`

## Seed de datos
Crea 30 productos con variantes y usuario admin por defecto (`admin@angelshop.com / admin2025`).
```bash
npm run seed
```

## Endpoints principales
- `GET /api/health`
- `GET /api/products` (filtros category,size,color,minPrice,maxPrice,q,page,limit)
- `GET /api/products/:slug`
- `POST /api/otp/request` { email }
- `POST /api/otp/verify` { email, code }
- `POST /api/reservations` (auth OTP)
- `GET /api/reservations/my` (auth OTP)
- `GET /api/reservations/:code` (auth OTP)
- `POST /api/reservations/:code/cancel` (auth OTP)
- `POST /api/admin/login` { email, password }
- CRUD productos `/api/admin/products` y `PATCH /api/admin/products/:id/stock`
- `GET /api/admin/reservations`
- `PATCH /api/admin/reservations/:code/status`
- `GET /api/admin/reports/summary`

## Eventos Socket.io
- `stock.updated { productId, variantSku }`
- `reservation.created { code, status }`
- `reservation.updated { code, status }`

## Expiración de reservas
- TTL configurable con `RESERVATION_TTL_HOURS` (24/48/72). Job cron cada 5 minutos + índice TTL en Mongo garantizan liberación y limpieza.

## Seguridad
Helmet, CORS restringido, rate limiting, sanitización, validación con Zod y manejo de errores consistente.

## Testing
Backend (Jest):
```bash
npm run test --workspace backend
```
