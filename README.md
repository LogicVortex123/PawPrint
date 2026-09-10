<div align="center">

<img src="assets/pawprint-logo.jpeg" alt="PawPrint Logo" width="180"/>

# PawPrint

### Offline-First Pet Care & Health Tracking App

**Care for their health. Keep their memories. Stay connected — even offline.**

[Features](#-features) •
[Tech Stack](#-tech-stack) •
[Architecture](#-architecture) •
[Application Workflow](#-application-workflow) •
[Project Structure](#-project-structure)

</div>

---

## 🐾 About PawPrint

PawPrint is a cross-platform mobile application designed to help pet owners manage their pets' health and care information in one place.

The application allows users to create pet profiles, track vaccinations and weight, manage medical documents, book veterinary appointments, discover nearby clinics, and view their pet's complete health timeline.

The core idea behind PawPrint is **Offline-First**.

Users can continue accessing and updating important pet information even without an internet connection. Changes are stored locally on the device and automatically synchronized with the cloud backend when connectivity is restored.

---

## ✨ Features

### 🐶 Pet Management
- Create and manage multiple pet profiles
- Store pet name, species, breed, gender and date of birth
- Add and update pet photos
- Easily switch between multiple pets

### 💉 Vaccination Tracking
- Add vaccination records
- Store vaccination and next-due dates
- Track completed, upcoming and overdue vaccinations
- Receive vaccination reminders

### ⚖️ Weight Tracking
- Record pet weight over time
- View weight history
- Visualize weight trends
- Get simple, non-diagnostic health insights

### 🏥 Veterinary Appointments
- Book veterinary appointments
- Select pet, clinic, date and time
- Add appointment reasons and notes
- Receive appointment reminders

### 📍 Nearby Veterinary Clinics
- Find nearby veterinary clinics
- Use device location to calculate distance
- Sort clinics based on proximity
- Provide a manual fallback when location permission is unavailable

### 📄 Medical Document Vault
- Store prescriptions and medical reports
- Upload documents from camera or gallery
- Categorize important medical documents
- Access cached documents while offline
- Retry failed uploads when the connection returns

### 🕐 Health Timeline
View important health activities in one chronological timeline:

- Vaccinations
- Weight records
- Vet appointments
- Medical documents

### 📶 Offline-First
PawPrint is designed to remain functional without an internet connection.

Records are first saved locally and marked as pending synchronization. Once the device reconnects, the application automatically synchronizes the pending changes with the backend.

---

# 🛠️ Tech Stack

## 📱 Mobile Application

| Technology | Purpose |
|---|---|
| **React Native** | Cross-platform mobile application |
| **Expo** | Development framework and native device capabilities |
| **TypeScript** | Type-safe application development |
| **React Navigation** | Navigation between application screens |
| **Zustand** | Global state management |

## 💾 Local Storage

| Technology | Purpose |
|---|---|
| **Expo SQLite** | Local offline database |
| **AsyncStorage** | Lightweight local preferences and settings |

## ☁️ Backend

| Technology | Purpose |
|---|---|
| **Node.js** | Backend runtime |
| **Express.js** | REST API development |
| **MongoDB** | Cloud database |
| **Axios** | Client-server API communication |

## 🔐 Security

| Technology | Purpose |
|---|---|
| **JWT** | Authentication and API authorization |
| **bcrypt** | Secure password hashing |

## 📱 Native Device Features

| Technology | Purpose |
|---|---|
| **Expo Image Picker** | Pet photos and medical documents |
| **Expo Notifications** | Vaccination and appointment reminders |
| **Expo Location** | Nearby clinic discovery |

## 🧪 Testing & Deployment

| Technology | Purpose |
|---|---|
| **Jest** | Automated testing |
| **React Native Testing Library** | UI and component testing |
| **EAS Build** | Android and iOS builds |
| **Render / Vercel** | Backend deployment |

---

# 🏗️ Architecture

PawPrint follows an **offline-first architecture** where the local database acts as the first point of persistence.

```text
                    ┌─────────────────────┐
                    │      PawPrint       │
                    │   React Native App  │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
         React UI          Zustand          Native APIs
                                                │
                              ┌─────────────────┼───────────────┐
                              │                 │               │
                              ▼                 ▼               ▼
                         Image Picker     Notifications      Location
                             
                               │
                               ▼
                      ┌─────────────────┐
                      │   Expo SQLite   │
                      │  Local Storage  │
                      └────────┬────────┘
                               │
                         Pending Changes
                               │
                               ▼
                       ┌───────────────┐
                       │  Sync Engine  │
                       └───────┬───────┘
                               │
                         Internet Available
                               │
                               ▼
                            Axios
                               │
                               ▼
                      ┌─────────────────┐
                      │ Node + Express  │
                      │    REST API     │
                      └────────┬────────┘
                               │
                               ▼
                         ┌───────────┐
                         │  MongoDB  │
                         │   Cloud   │
                         └───────────┘
