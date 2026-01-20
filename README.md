<div align="center">

# 🏋️ ICoach

> **ICoach** is a comprehensive AI-powered fitness and nutrition platform designed to help users achieve their health goals through intelligent workout tracking, food recognition, and personalized guidance.


### Your AI-Powered Personal Fitness & Nutrition Assistant

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**A comprehensive fitness and nutrition platform combining mobile app, backend services, and AI-powered food recognition**

[Features](#-key-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Tech Stack](#-technology-stack)

</div>

---

## 📖 Overview

**ICoach** is a full-stack health and fitness application that empowers users to track their workouts, monitor nutrition, and achieve their fitness goals with the help of AI. The platform combines a mobile application built with React Native, a robust Node.js backend with multi-database support, and an AI service for intelligent food recognition.

### 🎯 What Makes ICoach Special?

- **🤖 AI-Powered Food Recognition** - Snap a photo of your meal and instantly get nutritional information
- **💪 Comprehensive Workout Library** - Access hundreds of exercises with detailed instructions and GIFs
- **📊 Smart Nutrition Tracking** - Monitor macros, calories, and nutritional goals effortlessly
- **🌍 Multi-language Support** - Available in English, Arabic, French, German, Spanish, and Icelandic
- **🔐 Secure Authentication** - OAuth integration with Google, Facebook, and GitHub
- **📱 Cross-Platform** - iOS, Android, and Web support through React Native

---

## ✨ Key Features

### 📱 Mobile Application
- **Modern UI/UX** - Clean, intuitive interface with smooth animations
- **Authentication Flow** - Sign up, sign in, Google OAuth, password reset
- **Automatic Token Refresh** - Seamless re-authentication when tokens expire
- **Profile Management** - Track body metrics (height, weight, BMI), goals, and progress
- **Body Info Editor** - Update fitness goals, activity level, body measurements
- **Workout Library** - Browse 270+ exercises with GIF demonstrations
- **Save Workouts** - Bookmark favorite exercises for quick access
- **Food Recognition** - AI-powered meal analysis with camera/gallery picker
- **Nutrition Tracking** - Daily calorie intake, macro tracking
- **Multi-language** - i18n support with 6 languages
- **Offline Support** - AsyncStorage for data persistence
- **Deep Linking** - OAuth callback handling

### 🖥️ Backend Server
- **RESTful API** - Comprehensive endpoints for all features (v1 versioned)
- **Dual Database** - PostgreSQL for relational data, MongoDB for flexible schemas
- **JWT Authentication** - Access tokens (15min) + Refresh tokens (7 days)
- **Token Refresh Endpoint** - Automatic token renewal support
- **OAuth 2.0** - Google Sign-In with mobile ID token verification
- **User Management** - Registration, login, profile CRUD, body metrics
- **Workout API** - Full CRUD with filtering by body part, equipment, level
- **Saved Workouts** - User favorites and bookmarks management
- **Food API** - Nutrition data with search and filtering
- **Image Management** - Cloudinary integration for avatars and media
- **Email Service** - Nodemailer for verification and notifications
- **API Documentation** - Interactive Swagger/OpenAPI docs
- **Database Migrations** - Sequelize migrations and seeders
- **Docker Support** - Containerized deployment with docker-compose
- **Error Handling** - Centralized error handling with custom error classes

### 🤖 AI Service
- **Food Recognition** - EfficientNetB0 model trained on 100+ food classes
- **Nutrition Analysis** - Automatic nutritional breakdown from images
- **FastAPI Backend** - High-performance Python API
- **Arabic Cuisine Support** - Specialized recognition for Middle Eastern dishes
- **Confidence Scoring** - Reliable predictions with accuracy metrics
- **Docker Deployment** - Containerized ML model serving

---

## 🏗️ Architecture

```
Icoach-app/
│
├── 📱 application/          # React Native Mobile App (Expo)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── common/     # Buttons, Inputs, GoogleButton, etc.
│   │   │   └── auth/       # Auth-specific components
│   │   ├── screens/        # App screens
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── SignInScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── EditProfileScreen.tsx
│   │   │   ├── EditBodyInfoScreen.tsx
│   │   │   ├── WorkoutsScreen.tsx
│   │   │   ├── FoodsScreen.tsx
│   │   │   ├── MessagesScreen.tsx
│   │   │   ├── OnboardingScreen.tsx
│   │   │   └── AuthCallbackScreen.tsx
│   │   ├── navigation/     # React Navigation setup
│   │   ├── services/       # API integration (api.ts)
│   │   ├── context/        # AuthContext with token management
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Helper functions & validators
│   │   ├── constants/      # Theme, colors, sizes
│   │   └── types/          # TypeScript definitions
│   ├── i18n/               # Internationalization (6 languages)
│   └── assets/             # Fonts, images
│
├── 🖥️ server/              # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   │   ├── authController.ts
│   │   │   ├── userController.ts
│   │   │   ├── workoutController.ts
│   │   │   ├── foodController.ts
│   │   │   └── savedWorkoutController.ts
│   │   ├── routes/v1/      # API endpoints (versioned)
│   │   │   ├── authRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   │   ├── workoutRoutes.ts
│   │   │   ├── foodRoutes.ts
│   │   │   └── savedWorkoutRoutes.ts
│   │   ├── models/         # Database models
│   │   │   ├── sql/        # Sequelize models (User, Workout, Food)
│   │   │   └── nosql/      # Mongoose models
│   │   ├── services/       # Business logic
│   │   │   ├── userService.ts
│   │   │   ├── emailService.ts
│   │   │   └── imageService.ts
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── config/         # Database & JWT configuration
│   │   ├── migrations/     # Database migrations
│   │   └── seeders/        # Database seeders
│   ├── data/               # Seed data (workouts CSV, foods JSON)
│   └── uploads/            # Local file uploads
│
├── 🤖 AI/                  # Python AI Service (FastAPI)
│   ├── AI_API_Features/
│   │   ├── routers/        # FastAPI routes (food.py)
│   │   ├── services/       # ML & DB services
│   │   ├── models/         # Pydantic schemas
│   │   └── config/         # Database & settings
│   ├── food_predict_feature/
│   │   ├── best_model_food100.keras  # Trained EfficientNetB0 model
│   │   └── class_names.json          # 100+ food categories
│   └── main.py             # FastAPI application entry
│
└── 🌐 frontend/            # Web Frontend (Planned)
```

### 🔄 Data Flow

```mermaid
flowchart TB
    subgraph Client["📱 Mobile App - React Native/Expo"]
        direction TB
        UI[/"User Interface"/]
        
        subgraph Screens["Screens"]
            Welcome[Welcome Screen]
            SignIn[Sign In Screen]
            SignUp[Sign Up Screen]
            Home[Home Screen]
            Profile[Profile Screen]
            EditProfile[Edit Profile Screen]
            EditBodyInfo[Edit Body Info Screen]
            Foods[Foods Screen]
            Workouts[Workouts Screen]
            Messages[Messages Screen]
            Onboarding[Onboarding Screen]
        end
        
        subgraph Context["State Management"]
            AuthContext[Auth Context]
            TokenStorage[(AsyncStorage)]
        end
        
        subgraph AppServices["API Services"]
            AuthService[Auth Service]
            APIService[API Service]
            WorkoutService[Workout Service]
            FoodService[Food Service]
        end
        
        subgraph Components["Components"]
            GoogleButton[Google Sign-In Button]
            MediaPicker[Media Picker]
        end
    end

    subgraph Backend["🖥️ Backend Server - Node.js/Express/TypeScript"]
        direction TB
        
        subgraph Routes["API Routes /api/v1"]
            AuthRoutes["/auth/*"]
            UserRoutes["/users/*"]
            WorkoutRoutes["/workouts/*"]
            FoodRoutes["/foods/*"]
            SavedWorkoutRoutes["/saved-workouts/*"]
        end
        
        subgraph Middleware["Middleware"]
            AuthMiddleware[JWT Auth Middleware]
            ValidationMiddleware[Validation Middleware]
            ErrorHandler[Error Handler]
        end
        
        subgraph Controllers["Controllers"]
            AuthController[Auth Controller]
            UserController[User Controller]
            WorkoutController[Workout Controller]
            FoodController[Food Controller]
            SavedWorkoutController[Saved Workout Controller]
        end
        
        subgraph BackendServices["Services"]
            UserService[User Service]
            EmailService[Email Service]
            ImageService[Image Service]
        end
        
        subgraph JWT["JWT Token Management"]
            AccessToken[Access Token - 15 min expiry]
            RefreshToken[Refresh Token - 7 day expiry]
        endA
    end

    subgraph AI["🤖 AI Service - FastAPI/Python"]
        direction TB
        AIRouter[Food Router]
        MLService[ML Service]
        FoodModel[Food Detection Model - EfficientNetB0]
        DBService[DB Service]
    end

    subgraph Database["🗄️ PostgreSQL Database"]
        direction TB
        UsersTable[(Users Table)]
        WorkoutsTable[(Workouts Table)]
        FoodsTable[(Foods Table)]
        SavedWorkoutsTable[(Saved Workouts Table)]
    end

    subgraph External["🌐 External Services"]
        GoogleOAuth[Google OAuth 2.0]
        EmailProvider[Email Service - SMTP]
        Cloudinary[Cloudinary - Images]
    end

    %% User Flow - Authentication
    UI --> Welcome
    Welcome --> SignIn
    Welcome --> SignUp
    SignIn --> AuthService
    SignUp --> AuthService
    SignIn --> GoogleButton
    SignUp --> GoogleButton
    
    GoogleButton -->|"idToken"| GoogleOAuth
    GoogleOAuth -->|"Verified Token"| AuthRoutes
    
    AuthService -->|"Login/Register"| UserRoutes
    UserRoutes --> AuthMiddleware
    AuthMiddleware --> UserController
    UserController --> UserService
    
    %% Token Flow
    UserService -->|"Generate"| AccessToken
    UserService -->|"Generate"| RefreshToken
    AccessToken -->|"Store"| TokenStorage
    RefreshToken -->|"Store"| TokenStorage
    
    AuthContext -->|"Read/Write"| TokenStorage
    APIService -->|"Include Token"| AuthMiddleware
    
    %% Token Refresh Flow
    TokenStorage -->|"Expired Token"| AuthContext
    AuthContext -->|"Refresh Request"| UserRoutes
    UserRoutes -->|"New Tokens"| AuthContext
    
    %% Main App Flow
    AuthContext -->|"Authenticated"| Home
    Home --> Workouts
    Home --> Foods
    Home --> Profile
    Home --> Messages
    Profile --> EditProfile
    Profile --> EditBodyInfo
    
    %% Workout Flow
    Workouts --> WorkoutService
    WorkoutService --> WorkoutRoutes
    WorkoutRoutes --> AuthMiddleware
    AuthMiddleware --> WorkoutController
    WorkoutController --> WorkoutsTable
    WorkoutController --> SavedWorkoutsTable
    
    %% Food Detection Flow
    Foods --> MediaPicker
    MediaPicker -->|"Image"| FoodService
    FoodService -->|"Upload Image"| AIRouter
    AIRouter --> MLService
    MLService --> FoodModel
    FoodModel -->|"Prediction"| DBService
    DBService --> FoodsTable
    DBService -->|"Nutrition Data"| FoodService
    
    %% Profile Flow
    EditProfile --> APIService
    EditBodyInfo --> APIService
    APIService --> UserRoutes
    UserController --> UsersTable
    UserController --> Cloudinary
    
    %% Email Flow
    UserService -->|"Verification Email"| EmailService
    EmailService --> EmailProvider
```

### 🔄 Authentication Flow (Simplified)

```mermaid
sequenceDiagram
    participant User
    participant App as Mobile App
    participant Auth as Auth Context
    participant Storage as AsyncStorage
    participant API as Backend API
    participant Google as Google OAuth
    
    %% Normal Login Flow
    User->>App: Enter credentials
    App->>API: POST /api/v1/users/login
    API->>API: Validate credentials
    API-->>App: {accessToken, refreshToken, user}
    App->>Auth: login(user, accessToken, refreshToken)
    Auth->>Storage: Store tokens & user
    App-->>User: Navigate to Home
    
    %% Google OAuth Flow
    User->>App: Tap "Sign in with Google"
    App->>Google: Request sign-in
    Google-->>App: {idToken, user info}
    App->>API: POST /api/v1/auth/google/mobile
    API->>Google: Verify idToken
    Google-->>API: Token valid
    API-->>App: {accessToken, refreshToken, user}
    App->>Auth: setAuthState(token, user, refreshToken)
    Auth->>Storage: Store tokens & user
    App-->>User: Navigate to Home
    
    %% Token Refresh Flow
    User->>App: Make API request
    App->>API: Request with expired token
    API-->>App: 401 Token expired
    App->>Auth: refreshAccessToken()
    Auth->>Storage: Get refresh token
    Auth->>API: POST /api/v1/users/refresh-token
    API-->>Auth: {new accessToken, refreshToken}
    Auth->>Storage: Update tokens
    App->>API: Retry original request
    API-->>App: Success response
```

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Python** (v3.8 or higher)
- **PostgreSQL** (v13 or higher)
- **MongoDB** (v5 or higher)
- **Docker** & **Docker Compose** (optional, for containerized deployment)
- **Expo CLI** (for mobile development)

### 🎯 Option 1: Manual Setup

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/youssef-m-roushdy/Icoach-app.git
cd Icoach-app
```

#### 2️⃣ Setup Backend Server

```bash
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your database credentials and API keys

# Run migrations
npx sequelize-cli db:migrate

# Seed database with initial data
npx sequelize-cli db:seed:all

# Start development server
npm run dev
```

Server will be running at `http://localhost:3000`

**API Documentation:** `http://localhost:3000/api-docs`

#### 3️⃣ Setup AI Service

```bash
cd ../AI

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements-api.txt

# Create environment file
cp .env.example .env
# Edit .env with your database credentials

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

AI Service will be running at `http://localhost:8000`

**API Documentation:** `http://localhost:8000/docs`

#### 4️⃣ Setup Mobile Application

```bash
cd ../application

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your API endpoints

# Start Expo development server
npm start
```

Scan the QR code with **Expo Go** app (iOS/Android) or press `w` for web.

### 🐳 Option 2: Docker Setup

#### Backend + Database

```bash
cd server
docker-compose up --build
```

#### AI Service + Database

```bash
cd AI
docker-compose up --build
```

---

## 📚 Documentation

Detailed documentation for each component:

### 📱 Mobile Application
- [Quick Start Guide](./application/QUICKSTART.md)
- [Architecture & Structure](./application/STRUCTURE.md)
- [Migration Summary](./application/MIGRATION_SUMMARY.md)

### 🖥️ Backend Server
- [API Documentation](./server/README.md)
- [Database Setup](./server/README.Docker.md)
- [Workout API Guide](./server/WORKOUT_API.md)
- [PgAdmin Guide](./server/PGADMIN_GUIDE.md)

### 🤖 AI Service
- [Setup Guide](./AI/README.md)
- [Docker Guide](./AI/DOCKER_GUIDE.md)
- [Quick Start](./AI/QUICKSTART.md)

---

## 🛠️ Technology Stack

### Mobile Application
| Technology | Purpose |
|------------|---------|
| **React Native** | Cross-platform mobile framework |
| **TypeScript** | Type-safe development |
| **Expo** | Development toolchain |
| **React Navigation** | Navigation & routing |
| **i18next** | Internationalization |
| **AsyncStorage** | Local data persistence |
| **React Context API** | State management |

### Backend Server
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express** | Web framework |
| **TypeScript** | Type safety |
| **PostgreSQL** | Primary database |
| **MongoDB** | Document storage |
| **Sequelize** | PostgreSQL ORM |
| **Mongoose** | MongoDB ODM |
| **Passport.js** | Authentication |
| **JWT** | Token-based auth |
| **Cloudinary** | Image hosting |
| **Nodemailer** | Email service |
| **Swagger** | API documentation |

### AI Service
| Technology | Purpose |
|------------|---------|
| **Python** | Programming language |
| **FastAPI** | Modern web framework |
| **TensorFlow/Keras** | Deep learning |
| **EfficientNetB0** | CNN architecture |
| **PostgreSQL** | Nutrition database |
| **Uvicorn** | ASGI server |
| **Pydantic** | Data validation |

---

## � API Endpoints Overview

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/google` | Initiate Google OAuth flow (web) |
| GET | `/google/callback` | Google OAuth callback |
| POST | `/google/mobile` | Google Sign-In for mobile apps |

### Users (`/api/v1/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user (returns tokens) |
| POST | `/login` | Login user |
| POST | `/logout` | Logout user |
| POST | `/refresh-token` | Refresh access token |
| GET | `/profile` | Get current user profile |
| PUT | `/profile` | Update user profile |
| PUT | `/body-info` | Update body metrics |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password` | Reset password with token |

### Workouts (`/api/v1/workouts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all workouts (with filters) |
| GET | `/:id` | Get workout by ID |
| GET | `/filters` | Get available filter options |
| POST | `/` | Create new workout (admin) |
| PUT | `/:id` | Update workout (admin) |
| DELETE | `/:id` | Delete workout (admin) |

### Saved Workouts (`/api/v1/saved-workouts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get user's saved workouts |
| POST | `/` | Save a workout |
| DELETE | `/:workoutId` | Remove saved workout |

### Foods (`/api/v1/foods`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all foods |
| GET | `/:id` | Get food by ID |
| GET | `/search` | Search foods |

### AI Service (`http://localhost:8000`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/food/predict` | Predict food from image |
| GET | `/api/v1/food/classes` | Get all food classes |
| GET | `/health` | Health check |

---

## �📊 Database Schema

### PostgreSQL Tables

#### Users & Authentication
- `users` - User accounts and profiles (with OAuth support)
- `refresh_tokens` - JWT refresh token storage for token rotation

#### Fitness Data
- `workouts` - Exercise library (270+ exercises with GIFs)
- `saved_workouts` - User's saved/favorite workouts
- `user_workouts` - User workout history and logs

#### Nutrition Data
- `foods` - Food nutrition database (100+ items with Arabic cuisine)
- `user_meals` - Meal tracking
- `daily_nutrition` - Daily calorie/macro logs

### MongoDB Collections
- `activity_logs` - User activity tracking
- `notifications` - Push notifications
- `analytics` - Usage analytics

---

## 🔐 Authentication & Security

### Token-Based Authentication
- **Access Tokens** - Short-lived JWT (15 minutes) for API authorization
- **Refresh Tokens** - Long-lived JWT (7 days) for obtaining new access tokens
- **Automatic Token Refresh** - Seamless token renewal without re-login
- **Secure Storage** - AsyncStorage for mobile, HTTP-only cookies for web

### OAuth 2.0 Integration
- **Google Sign-In** - Native Android/iOS integration with ID token verification
- **Facebook Login** - Social authentication support
- **GitHub OAuth** - Developer-friendly authentication option

### Security Measures
- **Password Hashing** - bcrypt encryption with salt rounds
- **HTTPS Only** - Encrypted data transmission
- **CORS Protection** - Configured allowed origins
- **Rate Limiting** - DDoS and brute-force protection
- **Input Validation** - SQL injection & XSS prevention
- **Session Management** - Secure cookie handling with SameSite policy

---

## 🌍 Internationalization

Supported languages:
- 🇬🇧 English
- 🇸🇦 Arabic (العربية)
- 🇫🇷 French (Français)
- 🇩🇪 German (Deutsch)
- 🇪🇸 Spanish (Español)
- 🇮🇸 Icelandic (Íslenska)

---

## 📱 Supported Platforms

| Platform | Status |
|----------|--------|
| iOS | ✅ Supported |
| Android | ✅ Supported |
| Web | ✅ Supported |
| Windows | 🔄 Planned |
| macOS | 🔄 Planned |

---

## 🚧 Development Workflow

### Running Tests
```bash
# Backend tests
cd server
npm test

# AI service tests
cd AI
pytest
```

### Database Operations
```bash
# Create new migration
npx sequelize-cli migration:generate --name migration-name

# Run migrations
npx sequelize-cli db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo

# Create seeder
npx sequelize-cli seed:generate --name seeder-name

# Run seeders
npx sequelize-cli db:seed:all
```

### Building for Production

#### Mobile App
```bash
cd application

# Android
npm run build:android

# iOS
npm run build:ios
```

#### Backend
```bash
cd server
npm run build
npm start
```

#### AI Service
```bash
cd AI
docker build -t icoach-ai:latest .
docker run -p 8000:8000 icoach-ai:latest
```

---

## 📈 Features Roadmap

### Completed ✅
- [x] User authentication (email/password)
- [x] Google OAuth integration (mobile native)
- [x] JWT access & refresh token system
- [x] Automatic token refresh on expiry
- [x] User profile management
- [x] Body metrics tracking (height, weight, BMI)
- [x] Workout library with 270+ exercises
- [x] Save/bookmark favorite workouts
- [x] AI-powered food recognition
- [x] Multi-language support (6 languages)
- [x] Email verification system

### In Progress 🔄
- [ ] Real-time workout tracking
- [ ] Social features (friends, challenges)
- [ ] Progress photos and comparisons
- [ ] Custom meal plans
- [ ] Advanced analytics dashboard

### Planned 📝
- [ ] Wearable device integration
- [ ] AI-powered workout recommendations
- [ ] Video exercise demonstrations
- [ ] Nutrition planning assistant
- [ ] Community forums
- [ ] Premium subscription tiers
- [ ] Coach/Trainer accounts
- [ ] Barcode scanner for foods
- [ ] Web frontend application

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow existing code style

---

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors

**Youssef M. Roushdy**
- GitHub: [@youssef-m-roushdy](https://github.com/youssef-m-roushdy)

---

## 🙏 Acknowledgments

- **TensorFlow Team** - For the amazing ML framework
- **Expo Team** - For simplifying React Native development
- **OpenAI** - For AI assistance in development
- **Cloudinary** - For image hosting services
- **Community Contributors** - For valuable feedback and contributions

---

## 📞 Support

For support, email support@icoach.app or join our Slack channel.

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

**Made with ❤️ and lots of ☕**

[Report Bug](https://github.com/youssef-m-roushdy/Icoach-app/issues) • [Request Feature](https://github.com/youssef-m-roushdy/Icoach-app/issues)

</div>
