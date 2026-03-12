<div align="center">

#  GymApp  Plateforme de Gestion de Salles de Sport

**Une application web full-stack permettant aux propriétaires de salles, coachs et membres de gérer leurs activités sportives au quotidien.**

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=flat-square&logo=angular)](https://angular.io/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.2-6DB33F?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/atlas)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

</div>

---

##  Table des Matières

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Stack Technique](#-stack-technique)
- [Prérequis](#-prérequis)
- [Installation & Lancement](#-installation--lancement)
- [Structure du Projet](#-structure-du-projet)
- [API Backend](#-api-backend)
- [Variables d Environnement](#-variables-denvironnement)
- [Contribution](#-contribution)

---

##  Aperçu

GymApp est une plateforme **multi-rôles** destinée à l'écosystème des salles de sport. Trois types d'utilisateurs interagissent avec le système :

| Rôle | Accès |
|------|-------|
| **Membre** | Abonnements, réservations, défis, wallet de points & récompenses |
| **Coach** | Création de programmes, gestion des séances, postulation dans des salles |
| **Propriétaire** | Gestion de sa salle, coachs, programmes, statistiques |

---

##  Fonctionnalités

###  Membre
- Inscription et connexion sécurisée
- Consultation et renouvellement d abonnement
- Réservation de séances et check-in
- Suivi des workouts et défis quotidiens
- **Wallet de points** : gagne des points (abonnement +200 pts, défi +100 pts, avis +15 pts)
- **Boutique de récompenses** : échange ses points contre des coupons promo (code généré automatiquement)
- Système de gym buddy & messagerie

###  Coach
- Dashboard personnalisé avec ses salles affiliées
- Création et gestion de programmes d entraînement
- Postulation dans de nouvelles salles (formulaire inline)
- Consultation des membres et séances

###  Propriétaire
- Création et gestion de sa salle (infos, images, localisation)
- Validation/refus des demandes de coachs
- Création de programmes et challenges
- Gestion des paiements et abonnements

---

##  Architecture

```
+------------------------------------------------------------------+
|                         CLIENT (Browser)                         |
|                                                                  |
|   Angular 21 SPA (port 4200)                                     |
|   +----------+  +-----------+  +--------------------------+      |
|   | Landing  |  |   Auth    |  |      Dashboards          |      |
|   |  Page    |  | (Login /  |  |  Member / Coach / Owner  |      |
|   +----------+  | Register) |  +--------------------------+      |
|                 +-----------+                                    |
|   Services Angular (/api/*) ---> Proxy --> localhost:8080        |
+------------------------------------------------------------------+
                                  |
                    HTTP REST /api/*
                                  |
+------------------------------------------------------------------+
|                    Spring Boot 3.2.2 (port 8080)                 |
|                                                                  |
|   +----------------------------------------------------------+   |
|   |                    Controllers (17)                       |   |
|   |  Auth | User | Gym | Booking | Program | Challenge | ..  |   |
|   +---------------------------+------------------------------+   |
|                               |                                  |
|   +---------------------------v------------------------------+   |
|   |                  Repositories (17)                       |   |
|   |         MongoRepository<Entity, String>                  |   |
|   +---------------------------+------------------------------+   |
|                               |                                  |
+-------------------------------+----------------------------------+
                                |
                    MongoDB Driver (TLS)
                                |
+------------------------------------------------------------------+
|                    MongoDB Atlas (Cloud)                          |
|                    Database : gymapp                              |
|                    Cluster  : cluster0.rctw6wm.mongodb.net       |
|                                                                   |
|  Collections: users | gyms | inscriptions | bookings |           |
|               programs | worklogs | challenges |                  |
|               recompenses | echanges | notifications | ...       |
+-------------------------------------------------------------------+
```

---

##  Stack Technique

### Backend

| Technologie | Version | Rôle |
|-------------|---------|------|
| Java | 17 | Langage |
| Spring Boot | 3.2.2 | Framework REST |
| Spring Data MongoDB | inclus | ORM NoSQL |
| Spring Validation | inclus | Validation des DTOs |
| Maven | 3.x | Build tool |
| Tomcat | embarqué | Serveur HTTP |

### Frontend

| Technologie | Version | Rôle |
|-------------|---------|------|
| Angular | 21.1.x | Framework SPA |
| TypeScript | ~5.9.2 | Langage |
| RxJS | ~7.8.0 | Programmation réactive |
| Angular SSR | inclus | Server-Side Rendering |
| Leaflet | ^1.9.4 | Cartes interactives |
| Vitest | ^4.0.8 | Tests unitaires |

### Infrastructure

| Technologie | Rôle |
|-------------|------|
| MongoDB Atlas | Base de données cloud NoSQL |
| npm 11 | Gestionnaire de paquets frontend |

---

##  Prérequis

Avant de commencer, assurez-vous d avoir installé :

| Outil | Version minimale | Vérification |
|-------|-----------------|--------------|
| **Java JDK** | 17+ | `java -version` |
| **Maven** | 3.8+ | `mvn -version` |
| **Node.js** | 18+ | `node -v` |
| **npm** | 9+ | `npm -v` |
| **Angular CLI** | 17+ | `ng version` |
| **Git** | 2.x | `git --version` |

> **MongoDB Atlas** : Le projet se connecte à un cluster Atlas distant. Assurez-vous que votre adresse IP est autorisée dans les règles réseau Atlas, ou configurez votre propre cluster (voir Variables d Environnement).

**Installation rapide des prérequis Java/Maven (Windows avec Chocolatey) :**

```powershell
# Dans un terminal PowerShell en mode Administrateur
choco install temurin17 maven -y
```

---

##  Installation & Lancement

### 1. Cloner le dépôt

```bash
git clone https://github.com/MouhanedX/Projet_Gym_test.git
cd Projet_Gym_test
```

### 2. Lancer le Backend (Spring Boot)

```bash
cd backend
```

**Windows (PowerShell) :**

```powershell
.\mvnw.cmd spring-boot:run
```

**Linux / macOS :**

```bash
chmod +x mvnw
./mvnw spring-boot:run
```

> Le backend démarre sur **http://localhost:8080**
>
> Vous devriez voir dans les logs :
> `Started BackendApplication in X.XXX seconds`

### 3. Lancer le Frontend (Angular)

Ouvrez un **nouveau terminal** (sans fermer le backend) :

```bash
cd frontend
npm install
ng serve
```

> L application est accessible sur **http://localhost:4200**
>
> Le proxy Angular redirige automatiquement tous les appels `/api/*` vers `http://localhost:8080`.

### 4. Accès à l application

| URL | Description |
|-----|-------------|
| `http://localhost:4200` | Application complète |
| `http://localhost:4200/auth` | Page de connexion / inscription |
| `http://localhost:8080/api/users` | Exemple d endpoint REST |

---

##  Structure du Projet

```
Projet_Gym_test/
|
+-- backend/                          # Spring Boot API
|   +-- pom.xml                       # Dependances Maven
|   +-- mvnw / mvnw.cmd               # Maven Wrapper
|   +-- src/main/
|       +-- java/com/example/demo/
|       |   +-- BackendApplication.java
|       |   +-- config/
|       |   |   +-- WebConfig.java    # CORS (autorise localhost:4200)
|       |   +-- controller/           # 17 controleurs REST
|       |   |   +-- AuthController.java
|       |   |   +-- UserController.java
|       |   |   +-- GymController.java
|       |   |   +-- BookingController.java
|       |   |   +-- CheckInController.java
|       |   |   +-- InscriptionController.java
|       |   |   +-- PaiementController.java
|       |   |   +-- ProgramController.java
|       |   |   +-- WorkoutController.java
|       |   |   +-- ChallengeController.java
|       |   |   +-- RecompenseController.java
|       |   |   +-- EchangeController.java
|       |   |   +-- AvisController.java
|       |   |   +-- ConversationController.java
|       |   |   +-- CoachGymRequestController.java
|       |   |   +-- GymBuddyController.java
|       |   |   +-- NotificationController.java
|       |   +-- model/                # 18 entites MongoDB (@Document)
|       |   |   +-- User.java
|       |   |   +-- Gym.java
|       |   |   +-- Inscription.java
|       |   |   +-- Booking.java
|       |   |   +-- Program.java
|       |   |   +-- Exercise.java     # Embedded (pas de repository)
|       |   |   +-- WorkoutLog.java
|       |   |   +-- Challenge.java
|       |   |   +-- Recompense.java
|       |   |   +-- Echange.java      # Coupon genere a l echange
|       |   |   +-- ...
|       |   +-- repository/           # 17 interfaces MongoRepository
|       +-- resources/
|           +-- application.properties
|
+-- frontend/                         # Angular SPA
    +-- package.json
    +-- angular.json
    +-- proxy.conf.json               # /api -> http://localhost:8080
    +-- tsconfig.json
    +-- src/app/
        +-- app.ts                    # Composant racine
        +-- app.routes.ts             # Routes Angular
        +-- components/
        |   +-- landing/              # Page d accueil publique
        |   +-- auth/                 # Login / Register
        |   +-- member/               # Dashboard Membre
        |   +-- coach/                # Dashboard Coach
        |   +-- owner/                # Dashboard Proprietaire
        +-- services/                 # 17 services HTTP Angular
        +-- models/                   # 17 interfaces TypeScript
        +-- guards/
            +-- auth.guard.ts         # Protection des routes
```

---

##  API Backend

Tous les endpoints sont prefixes par `/api`. Voici les principaux :

| Methode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/auth/login` | Connexion utilisateur |
| `POST` | `/api/auth/register` | Inscription |
| `GET` | `/api/users/{id}` | Detail d un utilisateur |
| `GET` | `/api/gyms` | Liste toutes les salles |
| `GET` | `/api/gyms/owner/{ownerId}` | Salles d un proprietaire |
| `POST` | `/api/gyms` | Creer une salle |
| `POST` | `/api/inscriptions` | S abonner a une salle |
| `GET` | `/api/inscriptions/client/{id}` | Abonnements d un membre |
| `GET` | `/api/bookings/user/{id}` | Reservations d un membre |
| `POST` | `/api/checkins` | Enregistrer un check-in |
| `GET` | `/api/programs/gym/{gymId}` | Programmes d une salle |
| `GET` | `/api/challenges` | Liste des defis |
| `GET` | `/api/recompenses` | Liste des recompenses disponibles |
| `POST` | `/api/echanges` | Echanger des points contre une recompense |
| `GET` | `/api/echanges/client/{id}` | Coupons obtenus par un membre |
| `POST` | `/api/coach-gym-requests` | Demande de postulation coach |
| `GET` | `/api/notifications/user/{id}` | Notifications d un utilisateur |

---

##  Variables d Environnement

La configuration actuelle est dans `backend/src/main/resources/application.properties`.

| Parametre | Valeur par defaut |
|-----------|------------------|
| `server.port` | `8080` |
| `spring.data.mongodb.database` | `gymapp` |
| MongoDB Host | `cluster0.rctw6wm.mongodb.net` |
| CORS allowed origin | `http://localhost:4200` |
| Max upload size | `10MB` |

> **Securite** : Pour un deploiement en production, externalisez les credentials MongoDB :

```properties
# application.properties (production)
spring.data.mongodb.uri=${MONGODB_URI}
spring.data.mongodb.database=${MONGODB_DATABASE:gymapp}
server.port=${PORT:8080}
```

```powershell
# Windows PowerShell
$env:MONGODB_URI = "mongodb+srv://<user>:<password>@<cluster>.mongodb.net/"
```

```bash
# Linux / macOS
export MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/"
```

---

##  Contribution

1. Forkez le depot
2. Creez votre branche : `git checkout -b feature/ma-fonctionnalite`
3. Committez vos changements : `git commit -m "feat: description"`
4. Pushez : `git push origin feature/ma-fonctionnalite`
5. Ouvrez une **Pull Request** sur `main`

### Convention de commits

| Prefixe | Usage |
|---------|-------|
| `feat:` | Nouvelle fonctionnalite |
| `fix:` | Correction de bug |
| `style:` | Changements CSS / UI uniquement |
| `refactor:` | Refactorisation sans changement de comportement |
| `docs:` | Documentation uniquement |

---

<div align="center">

Fait avec coeur -- GymApp 2026

</div>
