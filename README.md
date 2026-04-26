# LucidPlus Rental Application

Welcome to the **LucidPlus** repository! This is a modern, premium full-stack property rental and booking platform meticulously crafted with an ASP.NET Core backend and a Next.js (React) front-end. It features advanced JWT Security, role-based architecture, and a cutting-edge Glassmorphism UI.

## 🚀 Features

### **Dynamic Frontend (Next.js)**
- **Glassmorphism Design Paradigm**: Fully styled modern UI utilizing dynamic variables, frosted glass layouts (`backdrop-filter`), and CSS micro-animations without relying on heavy external styling libraries.
- **Unified Custom Dashboard**: A master-view UI offering real-time Property Listings mapped directly from the backend payload.
- **Robust Client Authorization**: Dynamic rendering utilizing JWT extraction from `localStorage` seamlessly hiding auth buttons, managing permissions, and surfacing exclusive routing.
- **Admin & Owner Analytics**: A fully featured `/admin` path providing instantaneous Create, Edit, Delete, Approve, and Reject capabilities for all active resources across the platform.

### **Entity Framework Backend (ASP.NET Core)**
- **Role-Based API Structure**: `BookingController`, `AdminController`, and `PropertyController` specifically walled via `.NET` native claims logic to identify internal flags (`Admin`, `Owner`, `Renter`, `Tenant`).
- **RESTful Endpoints**: Full CRUD mapped to Entity Framework Core over Microsoft SQL database contexts.
- **JWT Authentication Pipeline**: `AuthController` engineered to generate, sign, and dispense encrypted `.env`-backed security tokens dictating precise session lifetime.
- **Environment Isolation**: `.env` logic completely extracts Database endpoints, JWT keys, issuers, and audiences out of raw configurations into protected local layers using `DotNetEnv`.

---

## 🛠 Tech Stack

**Frontend Framework**: Next.js 14+ (React)
**Frontend Core**: Axios (Data Fetching), Lucide-React (Iconography), Vanilla CSS (Tokens)
**Backend Framework**: ASP.NET Core Web API (C#)
**ORM Database layer**: Microsoft Entity Framework Core (SQL Server)
**Authentication**: JWT Bearer Tokens

---

## 💻 Local Setup & Installation

### 1. Requirements
Ensure the following build tools are natively accessible on your path:
- [Node.js](https://nodejs.org/) (v18+)
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download)
- [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server)

### 2. Backend Configuration (`/RentalApp`)
1. Navigate to the backend directory:
   ```bash
   cd RentalApp/RentalApp
   ```
2. Set up your `.env` secrets alongside `Program.cs`. Provide database connections:
   ```ini
   DB_CONNECTION=Server=YOUR_SERVER;Database=LucidEstateDB;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=true
   JWT_KEY=VerySecureRandomLongStringValueAtLeast32Bytes
   JWT_ISSUER=LucidAPI
   JWT_AUDIENCE=LucidFrontEnd
   ```
3. Establish your DB Architecture:
   ```bash
   dotnet ef database update
   ```
4. Run the API!
   ```bash
   dotnet run
   ```
   *(Running locally points to: `https://localhost:7249`)*

### 3. Frontend Configuration (`/frontend`)
1. Open a new terminal and navigate to the frontend:
   ```bash
   cd frontend
   ```
2. Define the configuration `.env` at the root of the frontend folder:
   ```env
   NEXT_PUBLIC_API_URL=https://localhost:7249/api
   ```
3. Install strict dependencies and boot it up!
   ```bash
   npm install
   npm run dev
   ```
   *(Runs to: `http://localhost:3000`)*

---

## ✨ Usage Flows
1. **User Sign Up**: Visit the main UI to register as a `Tenant` or an `Owner`. 
2. **Browsing**: Tenants can easily scroll mapped Properties, and automatically ping booking requests through the dynamic "Book Property" date-pickers!
3. **Owner Verifications**: Owners have special privileges allowing them to route directly to `localhost:3000/admin` to instantly **Approve** or **Reject** internal bookings using the dedicated green and red badges, all fully synchronized with SQL!
