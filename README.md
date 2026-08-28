# 🛒 Multi-Vendor E-Commerce Platform

A modern, scalable, and production-ready **Multi-Vendor E-Commerce Platform** built with a powerful backend architecture using **Node.js, Express.js, TypeScript, Prisma ORM, and PostgreSQL**.

The platform is designed to support multiple vendors, product variants, shopping carts, orders, vendor-wise order management, payments, commissions, vendor wallets, withdrawals, roles, permissions, and more.

The frontend is planned with **Next.js, Ant Design, Lucide React, Zustand, and TanStack Query**.

---

## 🚀 Project Overview

This project is a full-stack multi-vendor e-commerce system where:

* Customers can browse products and manage their carts.
* Customers can place orders containing products from multiple vendors.
* Each vendor receives a separate `VendorOrder` for their products.
* Vendors can manage products, inventory, orders, commissions, wallets, and withdrawals.
* The system supports product variants such as size, color, etc.
* Orders maintain product snapshots so historical orders remain accurate even if products change later.
* Multiple payment methods are supported.
* Role-based access control and permissions are available.
* The architecture is designed to be scalable and maintainable.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────┐
│                FRONTEND                     │
│                                             │
│  Next.js                                    │
│  Ant Design                                 │
│  Lucide React                               │
│  Zustand                                    │
│  TanStack Query                             │
│                                             │
└───────────────────┬─────────────────────────┘
                    │
                    │ REST API
                    ▼
┌─────────────────────────────────────────────┐
│                 BACKEND                     │
│                                             │
│  Node.js                                    │
│  Express.js                                 │
│  TypeScript                                 │
│  JWT Authentication                         │
│  Helmet                                     │
│  CORS                                       │
│  Morgan                                     │
│  Multer                                     │
│  Nodemailer                                 │
│                                             │
└───────────────────┬─────────────────────────┘
                    │
                    │ Prisma ORM
                    ▼
┌─────────────────────────────────────────────┐
│                DATABASE                     │
│                                             │
│              PostgreSQL                     │
│                                             │
└─────────────────────────────────────────────┘
```

---

# ✨ Core Features

## 👤 Customer

* User registration
* Email OTP verification
* Login
* JWT authentication
* Profile management
* Product browsing
* Product variants
* Shopping cart
* Multi-vendor checkout
* Order placement
* Order tracking
* Order history
* Order cancellation
* Multiple payment methods

---

## 🏪 Vendor

* Vendor registration
* Vendor profile
* Vendor verification
* Vendor status management
* Product management
* Product variants
* Inventory management
* Vendor order management
* Order status management
* Commission calculation
* Vendor wallet
* Withdrawal requests
* Withdrawal tracking
* Vendor staff management

---

## 📦 Product Management

The system supports:

* Products
* Categories
* Nested categories
* Brands
* Product images
* Product attributes
* Attribute values
* Product variants
* Variant images
* SKU
* Barcode
* Price
* Compare-at price
* Cost price
* Stock quantity
* Reserved quantity
* Low-stock threshold
* Featured products
* Product status
* SEO information

---

# 🗄️ Database Architecture

The application uses **PostgreSQL** with **Prisma ORM**.

## Database Modules

```text
Users
│
├── Roles
│   └── Permissions
│
├── Vendor
│   ├── Vendor Staff
│   ├── Vendor Wallet
│   ├── Vendor Withdrawals
│   └── Products
│
├── Cart
│   └── Cart Items
│
└── Orders
    ├── Order Items
    ├── Vendor Orders
    ├── Order Addresses
    └── Order Payments
```

---

# 📊 Main Database Models

## Authentication & Authorization

| Model            | Purpose                        |
| ---------------- | ------------------------------ |
| `User`           | Customer, vendor/admin users   |
| `Role`           | User roles                     |
| `Permission`     | Application permissions        |
| `RoleUser`       | User ↔ Role relationship       |
| `PermissionRole` | Role ↔ Permission relationship |
| `Otp`            | Email OTP verification         |

---

## Vendor Management

| Model              | Purpose                    |
| ------------------ | -------------------------- |
| `Vendor`           | Vendor information         |
| `VendorStaff`      | Vendor team members        |
| `VendorWallet`     | Vendor balance             |
| `VendorWithdrawal` | Vendor withdrawal requests |

---

## Catalog Management

| Model                   | Purpose                   |
| ----------------------- | ------------------------- |
| `Category`              | Product categories        |
| `Brand`                 | Product brands            |
| `Attribute`             | Product attributes        |
| `AttributeValue`        | Attribute values          |
| `Product`               | Main product information  |
| `ProductImage`          | Product images            |
| `ProductAttribute`      | Product ↔ Attribute       |
| `ProductVariant`        | Product variations        |
| `VariantAttributeValue` | Variant ↔ Attribute Value |
| `VariantImage`          | Variant images            |

---

## Shopping

| Model      | Purpose                |
| ---------- | ---------------------- |
| `Cart`     | Customer shopping cart |
| `CartItem` | Cart products          |

---

## Orders

| Model          | Purpose                    |
| -------------- | -------------------------- |
| `Order`        | Customer's main order      |
| `VendorOrder`  | Vendor-specific order      |
| `OrderItem`    | Individual ordered product |
| `OrderAddress` | Shipping/Billing address   |
| `OrderPayment` | Payment information        |

---

# 🔄 Multi-Vendor Order Flow

One of the most important features of this platform is **multi-vendor order splitting**.

For example, a customer purchases:

```text
Product A → Vendor A
Product B → Vendor B
Product C → Vendor A
```

The system creates:

```text
Main Order
│
├── Vendor Order → Vendor A
│   ├── Product A
│   └── Product C
│
└── Vendor Order → Vendor B
    └── Product B
```

This allows each vendor to independently manage:

* Order status
* Shipping
* Tracking number
* Courier
* Commission
* Vendor amount
* Delivery status

---

# 💰 Commission & Vendor Earnings

Each `OrderItem` stores:

```text
unitPrice
quantity
total
commissionRate
commissionAmount
```

The `VendorOrder` stores:

```text
subtotal
discount
shippingFee
total
commission
vendorAmount
```

Example:

```text
Product Price       = ৳10,000
Commission Rate     = 10%

Commission          = ৳1,000
Vendor Amount       = ৳9,000
```

This structure allows vendor earnings to be calculated and tracked independently.

---

# 💳 Payment System

The platform supports multiple payment methods:

```text
COD
BKASH
NAGAD
ROCKET
CARD
BANK
ONLINE
```

Payment statuses:

```text
PENDING
PROCESSING
PAID
FAILED
CANCELLED
REFUNDED
PARTIALLY_REFUNDED
```

---

# 📦 Order Status

Orders support the following lifecycle:

```text
PENDING
   ↓
CONFIRMED
   ↓
PROCESSING
   ↓
SHIPPED
   ↓
DELIVERED
```

Alternative flows:

```text
PENDING → CANCELLED
```

```text
DELIVERED → REFUNDED
```

Available statuses:

```text
PENDING
CONFIRMED
PROCESSING
SHIPPED
DELIVERED
CANCELLED
REFUNDED
```

---

# 🔐 Authentication

Authentication is based on:

* JWT
* Password hashing with bcrypt
* Email OTP verification
* Role-based authorization
* Permission-based authorization

Typical authentication flow:

```text
Register
   ↓
Send OTP
   ↓
Verify OTP
   ↓
Create/Activate User
   ↓
Login
   ↓
Generate JWT
   ↓
Authenticated API Requests
```

---

# 🛠️ Backend Tech Stack

### Runtime

* Node.js

### Framework

* Express.js

### Language

* TypeScript

### Database

* PostgreSQL

### ORM

* Prisma

### Authentication

* JSON Web Token
* bcrypt

### Security

* Helmet
* CORS

### Logging

* Morgan

### File Upload

* Multer

### Email

* Nodemailer

### PostgreSQL Driver

* pg
* `@prisma/adapter-pg`

---

# 🎨 Frontend Tech Stack

The frontend will be developed using:

* **Next.js**
* **React**
* **TypeScript**
* **Ant Design**
* **Lucide React**
* **Zustand**
* **TanStack Query**

Planned frontend responsibilities:

```text
Next.js
│
├── Authentication
├── Customer Dashboard
├── Vendor Dashboard
├── Admin Dashboard
├── Product Management
├── Category Management
├── Brand Management
├── Attribute Management
├── Cart
├── Checkout
├── Orders
├── Vendor Orders
├── Payments
├── Wallet
├── Withdrawals
└── Reports
```

---

# 📁 Backend Project Structure

Recommended backend structure:

```text
backend/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   │
│   ├── config/
│   │   └── db.ts
│   │
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── productController.ts
│   │   ├── cartController.ts
│   │   ├── orderController.ts
│   │   ├── vendorController.ts
│   │   └── paymentController.ts
│   │
│   ├── services/
│   │   ├── authService.ts
│   │   ├── productService.ts
│   │   ├── cartService.ts
│   │   ├── orderService.ts
│   │   ├── vendorService.ts
│   │   └── paymentService.ts
│   │
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── productRoutes.ts
│   │   ├── cartRoutes.ts
│   │   ├── orderRoutes.ts
│   │   ├── vendorRoutes.ts
│   │   └── paymentRoutes.ts
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.ts
│   │   ├── errorMiddleware.ts
│   │   └── uploadMiddleware.ts
│   │
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── otp.ts
│   │   └── serializeBigInt.ts
│   │
│   ├── types/
│   │
│   ├── app.ts
│   └── server.ts
│
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

# ⚙️ Backend Installation

## 1. Clone the Repository

```bash
git clone <your-repository-url>
```

Navigate to the backend:

```bash
cd backend
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://username:password@host:5432/database"

PORT=5000

JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-email@example.com"
SMTP_PASS="your-email-password"

FRONTEND_URL="http://localhost:3000"
```

> Never commit `.env` to Git.

---

# 🗃️ Prisma Setup

Generate Prisma Client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

For a new migration:

```bash
npx prisma migrate dev --name migration_name
```

For production:

```bash
npx prisma migrate deploy
```

---

# 🧪 Development

Start the backend development server:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

---

# 🏭 Production Build

Build the TypeScript project:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

---

# 📜 Available Scripts

From `package.json`:

| Command         | Description                           |
| --------------- | ------------------------------------- |
| `npm run dev`   | Start development server with Nodemon |
| `npm run build` | Compile TypeScript                    |
| `npm start`     | Start production server               |

---

# 🔌 API Structure

The backend API follows a versioned REST architecture.

Recommended base URL:

```text
/api/v1
```

Example:

```text
/api/v1/auth
/api/v1/products
/api/v1/categories
/api/v1/brands
/api/v1/cart
/api/v1/orders
/api/v1/vendors
/api/v1/payments
```

---

# 🔑 Example API Structure

## Authentication

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/verify-otp
POST   /api/v1/auth/resend-otp
POST   /api/v1/auth/login
```

## Products

```text
GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products
PUT    /api/v1/products/:id
DELETE /api/v1/products/:id
```

## Cart

```text
GET    /api/v1/cart
POST   /api/v1/cart/items
PUT    /api/v1/cart/items/:id
DELETE /api/v1/cart/items/:id
```

## Orders

```text
POST   /api/v1/orders
GET    /api/v1/orders
GET    /api/v1/orders/:id
POST   /api/v1/orders/:id/cancel
```

## Vendor Orders

```text
GET    /api/v1/vendor/orders
GET    /api/v1/vendor/orders/:id
PATCH  /api/v1/vendor/orders/:id/status
```

---

# 🧱 Database Relationship Overview

```text
User
 │
 ├─────────────── RoleUser ─────────────── Role
 │                                      │
 │                                      └── PermissionRole ── Permission
 │
 ├── Cart
 │    └── CartItem
 │          └── ProductVariant
 │
 ├── Order
 │    ├── OrderItem
 │    ├── OrderAddress
 │    ├── OrderPayment
 │    └── VendorOrder
 │          └── OrderItem
 │
 └── Vendor
      │
      ├── VendorStaff
      ├── VendorWallet
      ├── VendorWithdrawal
      └── Product
           ├── ProductImage
           ├── ProductAttribute
           └── ProductVariant
                ├── VariantImage
                └── VariantAttributeValue
```

---

# 📈 Scalability Considerations

The database and application architecture are designed with scalability in mind.

Current architecture supports:

* Multi-vendor architecture
* Vendor-specific orders
* Product variants
* Inventory tracking
* Reserved inventory
* Vendor commissions
* Vendor wallets
* Withdrawal management
* Role-based permissions
* Product snapshots in orders
* Soft deletion
* Indexed database queries
* REST API versioning

---

# 🔒 Security

The backend implements or is designed to implement:

* Password hashing using bcrypt
* JWT-based authentication
* Role-based authorization
* Permission-based authorization
* Helmet security headers
* CORS configuration
* Input validation
* Protected routes
* Environment-based secrets
* Secure database credentials
* OTP expiration
* Soft deletion for important entities

---

# 🧾 Product Snapshot Strategy

Order items store product information directly:

```text
productName
sku
unitPrice
quantity
total
commissionRate
commissionAmount
```

This is intentional.

For example:

```text
Today:
Product Name = iPhone 17
Price = ৳120,000
```

If the vendor later changes:

```text
Product Name = iPhone 17 Pro
Price = ৳130,000
```

The old order will still contain the original:

```text
iPhone 17
৳120,000
```

This keeps historical order information consistent.

---

# 💼 Vendor Wallet

Each vendor can have one wallet:

```text
Vendor
   │
   └── VendorWallet
          │
          ├── balance
          ├── reservedBalance
          └── currency
```

Default currency:

```text
BDT
```

Vendor withdrawals are tracked separately through:

```text
VendorWithdrawal
```

---

# 🗂️ Soft Delete Support

Important models support soft deletion using:

```text
deletedAt
```

This allows records to be hidden without permanently deleting them from the database.

Examples:

```text
User
Vendor
Category
Brand
Product
ProductVariant
```

---

# 🌍 Currency

The default platform currency is:

```text
BDT
```

Currency is stored at order level and vendor wallet level to support future expansion.

---

# 🧑‍💻 Development Workflow

Recommended workflow:

```text
Create Feature
      ↓
Create/Update Prisma Model
      ↓
Run Prisma Migration
      ↓
Generate Prisma Client
      ↓
Create Service
      ↓
Create Controller
      ↓
Create Route
      ↓
Add Middleware/Validation
      ↓
Test API
      ↓
Connect Frontend
```

---

# 🧪 Recommended Development Commands

After changing the Prisma schema:

```bash
npx prisma format
```

```bash
npx prisma validate
```

```bash
npx prisma generate
```

Create migration:

```bash
npx prisma migrate dev --name your_migration_name
```

Inspect database:

```bash
npx prisma studio
```

---

# 🛠️ Current Backend Dependencies

Main dependencies include:

```text
@prisma/adapter-pg
@prisma/client
bcrypt
cors
dotenv
express
helmet
jsonwebtoken
morgan
multer
nodemailer
pg
```

Development dependencies include:

```text
TypeScript
Prisma
tsx
Nodemon
Webpack
ts-loader
Node.js Types
Express Types
JWT Types
Multer Types
Nodemailer Types
bcrypt Types
CORS Types
Morgan Types
```

---

# 🎯 Future Roadmap

Planned features include:

* [ ] Admin Dashboard
* [ ] Customer Dashboard
* [ ] Vendor Dashboard
* [ ] Product Management UI
* [ ] Category Management
* [ ] Brand Management
* [ ] Attribute Management
* [ ] Inventory Management
* [ ] Advanced Search
* [ ] Product Filtering
* [ ] Wishlist
* [ ] Coupons & Discounts
* [ ] Reviews & Ratings
* [ ] Shipping Management
* [ ] Courier Integration
* [ ] bKash Integration
* [ ] Nagad Integration
* [ ] SSLCommerz/Card Integration
* [ ] Payment Webhooks
* [ ] Refund Management
* [ ] Vendor Reports
* [ ] Sales Reports
* [ ] Admin Reports
* [ ] Notification System
* [ ] Email Notifications
* [ ] SMS Notifications
* [ ] Redis Caching
* [ ] Queue/Background Jobs
* [ ] API Rate Limiting
* [ ] Automated Testing
* [ ] CI/CD
* [ ] Docker Deployment

---

# 🤝 Contribution

Contributions are welcome.

### 1. Fork the repository

```bash
git fork <repository-url>
```

### 2. Create a feature branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Commit your changes

```bash
git add .
git commit -m "feat: add your feature"
```

### 4. Push the branch

```bash
git push origin feature/your-feature-name
```

### 5. Create a Pull Request

---

# 📝 Commit Convention

Recommended commit format:

```text
feat: add product management
fix: resolve cart quantity issue
refactor: improve order service
docs: update README
style: format code
test: add order service tests
chore: update dependencies
```

---

# 📄 License

This project is currently private/proprietary.

All rights reserved.

Unauthorized copying, modification, distribution, or commercial use is prohibited without permission.

---

# 👨‍💻 Development

Built with ❤️ using modern web technologies.

### Backend

```text
Node.js
Express.js
TypeScript
Prisma
PostgreSQL
```

### Frontend

```text
Next.js
React
TypeScript
Ant Design
Lucide React
Zustand
TanStack Query
```

---

## ⭐ Project Status

**Status:** 🚧 Active Development

The backend architecture and core database structure are being actively developed. Frontend development will follow the established REST API and database architecture.
