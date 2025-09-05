# DayCare

A comprehensive communication platform designed for daycare centers and preschools to facilitate seamless interaction between educators and families.

## 🎯 Overview

DayCare is a full-stack application that enables real-time communication, attendance tracking, timeline sharing, and administrative management for childcare facilities. The platform supports multiple user roles and provides dedicated interfaces for different stakeholders.

## 🏗️ Architecture

This is a monorepo containing multiple applications:

- **Backend** (`/backend`) - NestJS REST API with PostgreSQL
- **Web Admin** (`/web`) - Next.js administrative dashboard
- **Mobile App** (`/mobile`) - React Native/Expo mobile application
- **Shared** (`/shared`) - Common TypeScript interfaces and types

## ✨ Features

### Core Functionality
- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access
- 👥 **Multi-role Support** - Admin, Educator, and Family user types
- 🏫 **Center Management** - Multiple daycare center support
- 🎓 **Classroom Organization** - Classroom and student management
- 📅 **Attendance Tracking** - Daily check-in/check-out functionality
- 📖 **Timeline Sharing** - Daily activities and photo sharing
- 💬 **Messaging System** - Direct communication between educators and families
- 📄 **Consent Management** - Digital permission slips and forms
- 📁 **File Management** - Document and photo storage
- 🔔 **Notifications** - Real-time updates and alerts

### User Roles
- **Admin**: Full system access, center management, user administration
- **Educator**: Classroom management, attendance, timeline updates, messaging
- **Family**: View child's activities, receive updates, communicate with educators

## 🛠️ Technology Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Caching**: Redis
- **API Documentation**: Swagger/OpenAPI
- **Security**: Helmet, rate limiting, CORS

### Frontend
- **Web**: Next.js with React, TypeScript
- **Mobile**: React Native with Expo
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit, React Query
- **Forms**: React Hook Form with Zod validation

### Infrastructure
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Containerization**: Docker Compose
- **Development**: Hot reload, TypeScript, ESLint, Prettier

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Docker & Docker Compose

### Installation

1. **Clone and setup dependencies**
   ```bash
   git clone <repository-url>
   cd DayCare
   npm run setup
   ```

2. **Start infrastructure**
   ```bash
   npm run docker:up
   ```

3. **Configure environment**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Web
   cp web/.env.example web/.env
   
   # Mobile
   cp mobile/.env.example mobile/.env
   ```

4. **Start development servers**
   ```bash
   # All services
   npm run dev:all
   
   # Individual services
   npm run dev:backend    # API server on :3001
   npm run dev:web       # Admin dashboard on :3000
   npm run dev:mobile    # Mobile app (Expo)
   ```

### Access Points
- **API**: http://localhost:3001/api/v1
- **API Docs**: http://localhost:3001/api/docs
- **Web Admin**: http://localhost:3000
- **Mobile**: Expo Go app

### Test User
```
Email: admin@daycare.com
Password: admin123
Role: admin
```

## 📱 Applications

### Web Admin Dashboard
- Center and user management
- Comprehensive reporting
- System configuration
- Desktop-optimized interface

### Mobile App
- Parent/family focused
- Real-time notifications
- Photo sharing
- Attendance updates
- Messaging with educators

## 🗃️ Database Schema

Key entities include:
- **Users** - Authentication and profile management
- **Centers** - Daycare facility information
- **Classrooms** - Group organization
- **Children** - Student profiles and enrollment
- **Attendance** - Daily check-in/out records
- **Timeline** - Activity posts and photos
- **Messages** - Communication threads
- **Consents** - Permission forms and approvals

## 🔧 Development

### Available Scripts
```bash
npm run dev:all          # Start all development servers
npm run build:all        # Build all applications
npm run test:all         # Run all test suites
npm run clean           # Clean all node_modules
```

### Code Quality
- TypeScript for type safety
- ESLint + Prettier for code formatting
- Jest for testing
- Husky for git hooks (if configured)

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting and request throttling
- CORS configuration
- Input validation and sanitization
- Role-based access control

## 📚 API Documentation

Interactive API documentation is available at `/api/docs` when running the backend in development mode. The API follows RESTful conventions with consistent response formatting.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the UNLICENSED license - see the package.json files for details.

---

Built with ❤️ for better daycare communication