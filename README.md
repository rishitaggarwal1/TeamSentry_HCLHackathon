# TeamSentry_HCLHackathon
This project is a part of HCL Hackathon.

# HealthCare System (Admin • Doctor • Patient)

A role-based healthcare appointment system built with **.NET (Web API)**, **React**, and **SQL Server** using **Dependency Injection** and a **Layered Repository Architecture**.

## ✨ Features

### Login and Register
- Role based login system
- Register Doctor with a approval system to admin

### Role: Admin
- Approve doctors (Onboarding / Verification)
- Remove
- View all doctors, patients, appointments

### Role: Doctor
- Create availability windows (e.g., 09:00–12:00, 14:00–17:00)
- Generate bookable slots (e.g., 30 min slots)
- View upcoming appointments
- View Past patients
- Add goals/plans for the past patients

### Role: Patient
- Browse doctors (approved only)
- View available slots by date
- Book slots (1 booking per slot)
- Track their goals

---

## 🧱 Tech Stack
- **Backend:** .NET Web API
- **Frontend:** React
- **Database:** SQL Server
- **Auth:** JWT (Role-based Authorization)
- **Architecture:** Layered + Repository Pattern + DI, Restful APIs calls
- **Tools:** Docker, CI/CD pipelines for the Code Quality and Security

---

## 🏗️ Architecture Overview

### Backend Layers
- **API Layer**
  - Controllers (AuthController, UserController, DoctorsController, SlotsController, AppointmentsController, AdminController)
  - Middleware (Exception handling, JWT auth)
- **Application Layer**
  - DTOs, Services, Validators
  - Business rules (slot generation, booking constraints)
- **Infrastructure Layer**
  - EF Core DbContext
  - Repository implementations
  - External services
- **Domain Layer**
  - ER Diagram File Created

### Repository Structure (Suggested)
