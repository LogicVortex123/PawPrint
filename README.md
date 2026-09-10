<div align="center">

<p>
  <img src="./PawPrint%20logo.jpeg" alt="PawPrint Logo" width="180">
</p>

<h1>🐾 PawPrint</h1>

<h3>Offline-First Pet Care & Health Tracking App</h3>

<p>
  <strong>Care for their health. Keep their memories. Stay connected — even offline.</strong>
</p>

<p>
  <a href="#-features">✨ Features</a> •
  <a href="#️-tech-stack">🛠️ Tech Stack</a> •
  <a href="#️-architecture">🏗️ Architecture</a> •
  <a href="#-application-workflow">🔄 Application Workflow</a> •
  <a href="#-project-structure">📁 Project Structure</a>
</p>

</div>

---

# 🐾 About PawPrint

PawPrint is a cross-platform mobile application designed to help pet owners manage their pets' health and care records in one place.

The application allows users to manage **pet profiles, vaccination records, weight history, medical documents, and veterinary appointments**. Its key feature is an **offline-first architecture**, which allows users to access and update their pet's information even without an internet connection.

When the device reconnects to the internet, locally stored changes are automatically synchronized with the cloud backend.

---

# ✨ Features

<table>
<tr>
<td width="50%">

### 🐶 Pet Profile Management

* Create and edit pet profiles
* Add pet name, species, breed, gender, date of birth and photo
* Support for multiple pets
* Quickly switch between pets

### 💉 Vaccination Tracking

* Add vaccination records
* Store vaccine name, administration date, next due date and veterinarian
* Automatically identify:

  * 🟢 Completed
  * 🟡 Upcoming
  * 🔴 Overdue
* Schedule vaccination reminders

### ⚖️ Weight Tracking

* Record pet weight over time
* View chronological weight history
* Display weight trends using a line chart
* Provide simple, non-diagnostic weight insights

### 🏥 Vet Appointments

* Book appointments for a specific pet
* Select veterinary clinic, date and time
* Add appointment reason and notes
* Receive appointment reminders

### 📍 Nearby Clinic Discovery

* Find nearby veterinary clinics using device location
* Sort clinics based on distance
* Provide a manual fallback when location access is unavailable

### 📄 Medical Document Vault

* Capture documents using camera or gallery
* Categorize documents as:

  * Prescription
  * Medical Report
  * Insurance
  * Adoption
* Cache documents for offline access
* Automatically retry failed uploads when connectivity returns

### 🕐 Health Timeline

View vaccinations, weight records, appointments and documents together in a chronological health timeline.

### 📶 Offline-First Support

PawPrint remains functional even without an internet connection.

All important records are first stored locally and marked as pending synchronization. Once the device is online again, the application automatically synchronizes the pending changes with the backend.

---

# 🛠️ Tech Stack

## 📱 Mobile Application

| Technology           | Purpose                                             |
| -------------------- | --------------------------------------------------- |
| **React Native**     | Cross-platform mobile application                   |
| **Expo**             | React Native development and native device features |
| **TypeScript**       | Type-safe application development                   |
| **React Navigation** | Screen navigation and routing                       |
| **Zustand**          | Lightweight global state management                 |

## 💾 Local Storage

| Technology       | Purpose                                                   |
| ---------------- | --------------------------------------------------------- |
| **Expo SQLite**  | Offline storage for pets, health records and appointments |
| **AsyncStorage** | Small settings and preferences                            |

## ☁️ Backend

| Technology     | Purpose                                      |
| -------------- | -------------------------------------------- |
| **Node.js**    | Backend runtime                              |
| **Express.js** | REST API development                         |
| **MongoDB**    | Cloud database                               |
| **Axios**      | Communication between mobile app and backend |

## 🔐 Authentication & Security

| Technology | Purpose                                   |
| ---------- | ----------------------------------------- |
| **JWT**    | User authentication and API authorization |
| **bcrypt** | Secure password hashing                   |

## 📱 Native Features

| Expo Technology        | Purpose                               |
| ---------------------- | ------------------------------------- |
| **Expo Image Picker**  | Pet photos and medical documents      |
| **Expo Notifications** | Vaccination and appointment reminders |
| **Expo Location**      | Nearby veterinary clinic discovery    |

## 🧪 Testing & Deployment

| Technology                       | Purpose                           |
| -------------------------------- | --------------------------------- |
| **Jest**                         | Automated testing                 |
| **React Native Testing Library** | Component and UI testing          |
| **EAS Build**                    | Android and iOS production builds |
| **Render / Vercel**              | Deployment                        |

---

# 🏗️ Application Architecture

```text
                    🐾 PawPrint
                        │
                        ▼
              ┌────────────────────┐
              │   React Native App │
              │    Expo + TS       │
              └─────────┬──────────┘
                        │
              ┌─────────┴──────────┐
              │                    │
              ▼                    ▼
       ┌─────────────┐      ┌─────────────┐
       │ Zustand     │      │ Expo SQLite │
       │ State       │      │ Local Data  │
       └─────────────┘      └──────┬──────┘
                                    │
                              Offline Changes
                                    │
                                    ▼
                              Sync Engine
                                    │
                             Internet Available
                                    │
                                    ▼
                              Axios / REST API
                                    │
                                    ▼
                         ┌────────────────────┐
                         │ Node.js + Express  │
                         │      Backend       │
                         └─────────┬──────────┘
                                   │
                                   ▼
                              ┌──────────┐
                              │ MongoDB  │
                              │  Cloud   │
                              └──────────┘
```

---

# 📶 Offline-First Workflow

The core workflow of PawPrint is designed around offline usage.

```text
User creates/updates a record
              │
              ▼
        Save to SQLite
              │
              ▼
       Mark as Pending
              │
              ▼
       UI updates instantly
              │
              ▼
      Is internet available?
          /           \
        No             Yes
        │               │
        ▼               ▼
 Pending Queue      Sync Engine
                        │
                        ▼
                     Axios
                        │
                        ▼
                  Express API
                        │
                        ▼
                    MongoDB
                        │
                        ▼
                  Sync Successful
                        │
                        ▼
               Mark record Synced
```

This approach ensures that users can continue managing their pet's records even in areas with poor or no connectivity.

---

# 🔄 Main User Workflow

```text
App Launch
    │
    ▼
Splash Screen
    │
    ▼
Onboarding
    │
    ▼
Login / Register
    │
    ▼
Home Dashboard
    │
    ├── 🐶 Manage Pets
    │
    ├── 💉 Vaccinations
    │
    ├── ⚖️ Weight Tracking
    │
    ├── 🏥 Appointments
    │
    ├── 📄 Medical Documents
    │
    ├── 🕐 Health Timeline
    │
    └── 📍 Find Clinics
```

---

# 🔐 Authentication Flow

```text
Register / Login
       │
       ▼
Backend Validation
       │
       ▼
bcrypt Password Verification
       │
       ▼
JWT Generated
       │
       ▼
JWT Stored on Device
       │
       ▼
Authenticated API Requests
```

All synchronized user data is protected through authenticated API requests.

---

# 📱 Planned Screens

* Splash Screen
* Onboarding
* Login
* Registration
* Home Dashboard
* Pets
* Pet Profile
* Vaccination Records
* Add Vaccination
* Weight Tracker
* Appointments
* Book Appointment
* Nearby Clinics
* Medical Documents
* Health Timeline
* Profile / Settings

---

# 🎯 Project Goals

PawPrint aims to provide:

* **Offline-first reliability**
* **Fast health record logging**
* **Simple pet management**
* **Secure cloud synchronization**
* **Useful reminders**
* **Easy access to important medical information**
* **Support for multiple pets**

The goal is to make managing a pet's health information simple, reliable and accessible — even without an internet connection.

---

# 🚀 Future Enhancements

PawPrint is designed to evolve beyond its core pet-care experience. Future enhancements may include:

* 🚨 **Emergency Mode**  
  Quick access to important pet information, emergency contacts, and essential medical details during urgent situations.

* 👨‍👩‍👧 **Family / Shared Pet Access**  
  Allow multiple family members or caretakers to securely access and manage the same pet's information.

* 📊 **Advanced Health Trend Insights**  
  Provide deeper insights from vaccination history, weight trends, and other recorded health data while keeping the system non-diagnostic.

* 🌐 **Multilingual Support**  
  Make PawPrint more accessible to pet owners by supporting multiple languages.

* ♿ **Improved Accessibility**  
  Enhance accessibility through better screen-reader support, scalable text, improved contrast, and accessible interaction patterns.

* 🧪 **Expanded Automated Test Coverage**  
  Increase unit, integration, and UI test coverage to improve application reliability as PawPrint grows.

* 📦 **Automated Android / iOS Build Pipeline**  
  Introduce CI/CD automation for testing and generating production-ready Android and iOS builds.

Features such as a dedicated vet portal, teleconsultation and wearable integration are currently outside the MVP scope.

---

# 🧪 Testing

The application will use:

* **Jest** for automated tests
* **React Native Testing Library** for UI/component testing

Testing will focus on:

* State management
* Offline storage
* Synchronization logic
* Authentication
* Core user flows
* UI components

---

# 📦 Build & Deployment

The mobile application is intended to support:

* Android
* iOS

Production builds will be generated using **EAS Build**.

The backend can be deployed using **Render/Vercel**, with MongoDB used for cloud data storage.

---

## 💙 Vision

> **Care for your pets. Track their health. Stay prepared — even offline.**

PawPrint brings your pet's essential health information together in one simple, reliable application.
