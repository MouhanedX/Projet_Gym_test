# Spring Boot + Angular + MongoDB Atlas

This workspace contains two folders:
- backend: Spring Boot REST API using MongoDB Atlas
- frontend: Angular app that calls the REST API

## Prerequisites
- JDK 17
- Maven
- Node.js (already installed)
- Angular CLI (already installed)
- A MongoDB Atlas connection string

If JDK 17 and Maven are missing, you can install them with Chocolatey in an
elevated PowerShell:

```powershell
choco install temurin17 maven -y
```

## Configure MongoDB Atlas
1. Create a MongoDB Atlas cluster and user.
2. Copy the connection string and set it as the environment variable `MONGODB_URI`.

PowerShell example:

```powershell
$env:MONGODB_URI = "mongodb+srv://<user>:<password>@<cluster>.mongodb.net/appdb?retryWrites=true&w=majority"
```

## Run the backend

```powershell
Set-Location "C:\Users\GIGABYTE\Desktop\TEST\test_stack\backend"
mvn spring-boot:run
```

The API runs at http://localhost:8080/api/items

## Run the frontend

```powershell
Set-Location "C:\Users\GIGABYTE\Desktop\TEST\test_stack\frontend"
npm install
npm start
```

The app runs at http://localhost:4200

## Notes
- The Angular dev server proxies `/api` to `http://localhost:8080` using `proxy.conf.json`.
- Update `backend/src/main/resources/application.properties` if you need a different port.
