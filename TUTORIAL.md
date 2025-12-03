# Tutoriel Complet : Système de Gestion de Cantine Scolaire

## Introduction

Ce tutoriel vous guide pas à pas dans la création d'un système complet de gestion de cantine scolaire. Le projet comprend :

- **Backend** : API REST avec Node.js, Express, MySQL et authentification JWT
- **Frontend** : Application web moderne avec Next.js, React, TypeScript et Tailwind CSS
- **Fonctionnalités** : Gestion des utilisateurs, inventaire, élèves, présences, planification des menus, analytics

Le système supporte trois rôles d'utilisateurs :
- **Administrateur** : Accès complet à toutes les fonctionnalités
- **Responsable Cantine** : Gestion opérationnelle
- **Agent de Saisie** : Saisie des données quotidiennes

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 18 ou supérieure)
- **MySQL** (version 8.0 ou supérieure)
- **VS Code** (avec extensions recommandées)
- **Git** pour le contrôle de version

### Connaissances requises

- Bases de JavaScript/TypeScript
- Concepts de base des API REST
- Notions de base de SQL et bases de données
- Familiarité avec React (optionnel mais recommandé)

---

## Étape 1 : Configuration de l'environnement de développement

### 1.1 Installation de Node.js

```bash
# Vérifiez si Node.js est installé
node --version
npm --version

# Si pas installé, téléchargez depuis https://nodejs.org
```

### 1.2 Installation de MySQL

```bash
# Sur Windows, téléchargez MySQL depuis https://dev.mysql.com/downloads/mysql/
# Ou utilisez XAMPP qui inclut MySQL

# Sur Linux/Ubuntu :
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation

# Sur macOS avec Homebrew :
brew install mysql
brew services start mysql
mysql_secure_installation
```

### 1.3 Configuration de VS Code

Installez ces extensions :
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Prettier - Code formatter
- ESLint
- MySQL de Jun Han

### 1.4 Création du projet

```bash
# Créez le dossier du projet
mkdir cantine-management-system
cd cantine-management-system

# Initialisez Git
git init
```

---

## Étape 2 : Initialisation du backend

### 2.1 Création de la structure du projet

```bash
# Créez les dossiers
mkdir backend
cd backend

# Initialisez le projet Node.js
npm init -y
```

### 2.2 Installation des dépendances

```bash
npm install express mysql2 bcryptjs jsonwebtoken cors dotenv
npm install --save-dev nodemon
```

### 2.3 Configuration du package.json

Modifiez le fichier `package.json` :

```json
{
  "name": "backend",
  "private": true,
  "type": "module",
  "version": "0.1.0",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  },
  "dependencies": {
    "bcryptjs": "latest",
    "cors": "latest",
    "dotenv": "^17.2.2",
    "express": "latest",
    "jsonwebtoken": "latest",
    "mysql2": "latest"
  },
  "devDependencies": {
    "nodemon": "latest"
  }
}
```

### 2.4 Création du fichier serveur de base

Créez le fichier `server.js` :

```javascript
import express from "express"
import cors from "cors"
import { config } from "dotenv"

config()

const app = express()
const PORT = parseInt(process.env.PORT) || 4000

// Middleware
app.use(cors())
app.use(express.json())

// Route de test
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "API is running" })
})

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur API démarré sur le port ${PORT}`)
})
```

### 2.5 Configuration des variables d'environnement

Créez le fichier `.env` :

```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=cantine_management
JWT_SECRET=votre_cle_secrete_jwt_tres_longue_et_complexe
```

---

## Étape 3 : Configuration de la base de données

### 3.1 Création du script de seeding

Créez le fichier `seed.js` :

```javascript
import mysql from "mysql2/promise"
import bcrypt from "bcryptjs"
import { config } from "dotenv"

config()

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
}

const dbName = process.env.DB_NAME || "cantine_management"

async function seedDatabase() {
  // Connect without database to create it if needed
  const connection = await mysql.createConnection(dbConfig)
  await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``)
  await connection.end()

  // Now connect with database
  const dbConfigWithDB = { ...dbConfig, database: dbName }
  const connectionWithDB = await mysql.createConnection(dbConfigWithDB)

  try {
    console.log("Seeding database...")

    // Create tables
    await connectionWithDB.execute(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL
      )
    `)

    await connectionWithDB.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        role_id INT,
        is_active BOOLEAN DEFAULT TRUE,
        last_login DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id)
      )
    `)

    // Insert roles
    const roles = [
      { name: "Administrateur" },
      { name: "Responsable Cantine" },
      { name: "Agent de Saisie" },
    ]

    for (const role of roles) {
      await connectionWithDB.execute(
        "INSERT IGNORE INTO roles (name) VALUES (?)",
        [role.name]
      )
    }

    console.log("Roles inserted")

    // Get role IDs
    const [roleRows] = await connectionWithDB.execute("SELECT id, name FROM roles")
    const roleMap = {}
    roleRows.forEach(row => {
      roleMap[row.name] = row.id
    })

    // Insert default users
    const users = [
      {
        username: "admin",
        email: "admin@cantine.com",
        password: "admin123",
        first_name: "Admin",
        last_name: "User",
        role_name: "Administrateur",
      },
    ]

    for (const user of users) {
      const password_hash = await bcrypt.hash(user.password, 10)
      await connectionWithDB.execute(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, role_id)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         email = VALUES(email),
         password_hash = VALUES(password_hash),
         first_name = VALUES(first_name),
         last_name = VALUES(last_name),
         role_id = VALUES(role_id)`,
        [
          user.username,
          user.email,
          password_hash,
          user.first_name,
          user.last_name,
          roleMap[user.role_name],
        ]
      )
    }

    console.log("Users inserted")
    console.log("Seeding completed successfully")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await connectionWithDB.end()
  }
}

seedDatabase()
```

### 3.2 Exécution du script de seeding

```bash
# Exécutez le script pour créer la base de données
node seed.js
```

---

## Étape 4 : Système d'authentification

### 4.1 Middleware d'authentification

Ajoutez au fichier `server.js` :

```javascript
// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Token d'accès requis" })
  }

  jwt.verify(token, process.env.JWT_SECRET || "secret_key", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token invalide" })
    }
    req.user = user
    next()
  })
}
```

### 4.2 Route de connexion

Ajoutez cette route dans `server.js` :

```javascript
// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cantine_management",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

const pool = mysql.createPool(dbConfig)

// Routes d'authentification
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body

    const [users] = await pool.execute(
      `
            SELECT u.*, r.name as role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.username = ? AND u.is_active = true
        `,
      [username],
    )

    if (users.length === 0) {
      return res.status(401).json({ error: "Identifiants invalides" })
    }

    const user = users[0]
    const validPassword = await bcrypt.compare(password, user.password_hash)

    if (!validPassword) {
      return res.status(401).json({ error: "Identifiants invalides" })
    }

    // Mise à jour de la dernière connexion
    await pool.execute("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id])

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role_id: user.role_id,
        role_name: user.role_name,
      },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "24h" },
    )

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role_name: user.role_name,
      },
    })
  } catch (error) {
    console.error("Erreur de connexion:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})
```

---

## Étape 5 : API de gestion des utilisateurs

### 5.1 Routes des utilisateurs

Ajoutez ces routes dans `server.js` :

```javascript
// Routes des utilisateurs
app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(`
            SELECT u.id, u.username, u.email, u.first_name, u.last_name,
                   u.is_active, u.last_login, u.created_at, r.name as role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            ORDER BY u.created_at DESC
        `)
    res.json(users)
  } catch (error) {
    console.error("Erreur récupération utilisateurs:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

app.post("/api/users", authenticateToken, async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, role_id } = req.body
    const password_hash = await bcrypt.hash(password, 10)

    const [result] = await pool.execute(
      `
            INSERT INTO users (username, email, password_hash, first_name, last_name, role_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `,
      [username, email, password_hash, first_name, last_name, role_id],
    )

    res.status(201).json({ id: result.insertId, message: "Utilisateur créé avec succès" })
  } catch (error) {
    console.error("Erreur création utilisateur:", error)
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "Nom d'utilisateur ou email déjà existant" })
    } else {
      res.status(500).json({ error: "Erreur interne du serveur" })
    }
  }
})
```

---

## Étape 6 : Système de permissions basé sur les rôles

### 6.1 Tables de permissions

Ajoutez ces tables dans le script `seed.js` :

```javascript
await connectionWithDB.execute(`
  CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
  )
`)

await connectionWithDB.execute(`
  CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT,
    permission_id INT,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id)
  )
`)
```

### 6.2 Middleware de vérification des permissions

Ajoutez dans `server.js` :

```javascript
// Middleware de vérification des permissions
const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const [rows] = await pool.execute(
        `
                SELECT p.name
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                WHERE rp.role_id = ? AND p.name = ?
            `,
        [req.user.role_id, permission],
      )

      if (rows.length === 0) {
        return res.status(403).json({ error: "Permission insuffisante" })
      }
      next()
    } catch (error) {
      res.status(500).json({ error: "Erreur de vérification des permissions" })
    }
  }
}
```

---

## Étape 7 : Gestion de l'inventaire

### 7.1 Table des ingrédients

Ajoutez dans `seed.js` :

```javascript
await connectionWithDB.execute(`
  CREATE TABLE IF NOT EXISTS ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    unit VARCHAR(20) NOT NULL,
    current_stock DECIMAL(10,2) DEFAULT 0,
    critical_threshold DECIMAL(10,2) DEFAULT 0,
    unit_price DECIMAL(10,2),
    supplier VARCHAR(100),
    expiry_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`)
```

### 7.2 Routes des ingrédients

Ajoutez dans `server.js` :

```javascript
// Routes des ingrédients
app.get("/api/ingredients", authenticateToken, async (req, res) => {
  try {
    const [ingredients] = await pool.execute(`
            SELECT * FROM ingredients
            WHERE is_active = true
            ORDER BY name
        `)
    res.json(ingredients)
  } catch (error) {
    console.error("Erreur récupération ingrédients:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

app.post("/api/ingredients", authenticateToken, async (req, res) => {
  try {
    const { name, description, unit, critical_threshold, unit_price, supplier, expiry_date } = req.body

    const [result] = await pool.execute(
      `
            INSERT INTO ingredients (name, description, unit, critical_threshold, unit_price, supplier, expiry_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
      [name, description, unit, critical_threshold, unit_price, supplier, expiry_date],
    )

    res.status(201).json({ id: result.insertId, message: "Ingrédient créé avec succès" })
  } catch (error) {
    console.error("Erreur création ingrédient:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})
```

---

## Étape 8 : Gestion des élèves

### 8.1 Table des élèves

Ajoutez dans `seed.js` :

```javascript
await connectionWithDB.execute(`
  CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    gender ENUM('M', 'F', 'Other'),
    grade VARCHAR(20),
    class_name VARCHAR(20),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(20),
    address TEXT,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    dietary_restrictions TEXT,
    allergies TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`)
```

### 8.2 Routes des élèves

Ajoutez dans `server.js` :

```javascript
// Routes des élèves
app.get("/api/students", authenticateToken, async (req, res) => {
  try {
    const [students] = await pool.execute(`
            SELECT * FROM students
            WHERE is_active = true
            ORDER BY last_name, first_name
        `)
    res.json(students)
  } catch (error) {
    console.error("Erreur récupération élèves:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

app.post("/api/students", authenticateToken, async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      date_of_birth,
      gender,
      grade,
      class_name,
      parent_name,
      parent_phone,
      address,
      emergency_contact,
      emergency_phone,
      dietary_restrictions,
      allergies,
    } = req.body

    const [result] = await pool.execute(
      `
            INSERT INTO students (first_name, last_name, date_of_birth, gender, grade, class_name, parent_name, parent_phone, address, emergency_contact, emergency_phone, dietary_restrictions, allergies)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      [
        first_name,
        last_name,
        date_of_birth,
        gender,
        grade,
        class_name,
        parent_name,
        parent_phone,
        address,
        emergency_contact,
        emergency_phone,
        dietary_restrictions,
        allergies,
      ],
    )

    res.status(201).json({ id: result.insertId, message: "Élève créé avec succès" })
  } catch (error) {
    console.error("Erreur création élève:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})
```

---

## Étape 9 : Système de présence

### 9.1 Table des présences

Ajoutez dans `seed.js` :

```javascript
await connectionWithDB.execute(`
  CREATE TABLE attendances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
    is_present BOOLEAN DEFAULT TRUE,
    notes TEXT,
    recorded_by INT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_attendance (student_id, attendance_date, meal_type),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (recorded_by) REFERENCES users(id)
  )
`)
```

### 9.2 Routes des présences

Ajoutez dans `server.js` :

```javascript
// Routes des présences
app.post("/api/attendances", authenticateToken, async (req, res) => {
  try {
    const { student_id, attendance_date, meal_type, is_present, notes } = req.body

    const [result] = await pool.execute(
      `
            INSERT INTO attendances (student_id, attendance_date, meal_type, is_present, notes, recorded_by)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            is_present = VALUES(is_present),
            notes = VALUES(notes),
            recorded_by = VALUES(recorded_by),
            recorded_at = NOW()
        `,
      [student_id, attendance_date, meal_type, is_present, notes, req.user.id],
    )

    res.status(201).json({ message: "Présence enregistrée avec succès" })
  } catch (error) {
    console.error("Erreur enregistrement présence:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

app.get("/api/attendances", authenticateToken, async (req, res) => {
  try {
    const { date, meal_type } = req.query
    let query = `
            SELECT a.*, s.first_name, s.last_name, s.grade, s.class_name, u.username as recorded_by_name
            FROM attendances a
            JOIN students s ON a.student_id = s.id
            JOIN users u ON a.recorded_by = u.id
            WHERE 1=1
        `
    const params = []

    if (date) {
      query += " AND a.attendance_date = ?"
      params.push(date)
    }

    if (meal_type) {
      query += " AND a.meal_type = ?"
      params.push(meal_type)
    }

    query += " ORDER BY a.attendance_date DESC, s.last_name, s.first_name"

    const [attendances] = await pool.execute(query, params)
    res.json(attendances)
  } catch (error) {
    console.error("Erreur récupération présences:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})
```

---

## Étape 10 : Initialisation du frontend

### 10.1 Création du projet Next.js

```bash
# Depuis la racine du projet
cd ..
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
cd frontend
```

### 10.2 Installation des dépendances supplémentaires

```bash
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-toast lucide-react recharts date-fns @hookform/resolvers zod react-hook-form
```

### 10.3 Configuration de Tailwind CSS

Modifiez `tailwind.config.js` :

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 10.4 Variables CSS globales

Modifiez `app/globals.css` :

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## Étape 11 : Service API et contexte d'authentification

### 11.1 Service API

Créez le fichier `services/api.ts` :

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

class ApiService {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      }
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Une erreur est survenue')
    }

    return response.json()
  }

  async login(username: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  }

  async getUsers() {
    return this.request('/api/users')
  }

  async createUser(userData: any) {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getStudents() {
    return this.request('/api/students')
  }

  async createStudent(studentData: any) {
    return this.request('/api/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    })
  }

  async getIngredients() {
    return this.request('/api/ingredients')
  }

  async createIngredient(ingredientData: any) {
    return this.request('/api/ingredients', {
      method: 'POST',
      body: JSON.stringify(ingredientData),
    })
  }

  async recordAttendance(attendanceData: any) {
    return this.request('/api/attendances', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    })
  }

  async getAttendances(params?: { date?: string; meal_type?: string }) {
    const queryParams = params ? new URLSearchParams(params).toString() : ''
    return this.request(`/api/attendances?${queryParams}`)
  }

  async getAnalytics() {
    return this.request('/api/analytics')
  }
}

export const apiService = new ApiService()
```

### 11.2 Contexte d'authentification

Créez le fichier `contexts/auth-context.tsx` :

```typescript
"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiService } from "@/services/api"

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role_name: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier si un token existe dans le localStorage
    const savedToken = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      apiService.setToken(savedToken)
    }

    setLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await apiService.login(username, password)
      setUser(response.user)
      setToken(response.token)

      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))
      apiService.setToken(response.token)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    apiService.setToken(null)
  }

  return <AuthContext.Provider value={{ user, token, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
```

---

## Étape 12 : Formulaire de connexion

### 12.1 Composant de formulaire de connexion

Créez le fichier `components/auth/login-form.tsx` :

```typescript
"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const { login } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(username, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Connexion</CardTitle>
          <CardDescription className="text-center">
            Système de Gestion de Cantine Scolaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se connecter
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Comptes de test :</p>
            <p>Admin: admin / admin123</p>
            <p>Manager: manager / manager123</p>
            <p>Agent: agent / agent123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## Étape 13 : Layout principal et navigation

### 13.1 Layout de l'application

Modifiez `app/layout.tsx` :

```typescript
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Système de Gestion de Cantine",
  description: "Application de gestion de cantine scolaire",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 13.2 Page principale

Modifiez `app/page.tsx` :

```typescript
"use client"
import { LoginForm } from "@/components/auth/login-form"
import { Dashboard } from "@/components/dashboard/dashboard"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return <main className="min-h-screen bg-background">{user ? <Dashboard /> : <LoginForm />}</main>
}
```

---

## Étape 14 : Composants UI de base

### 14.1 Composant Button

Créez le fichier `components/ui/button.tsx` :

```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### 14.2 Composant Input

Créez le fichier `components/ui/input.tsx` :

```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

### 14.3 Utilitaires

Créez le fichier `lib/utils.ts` :

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## Étape 15 : Dashboard et navigation

### 15.1 Composant Sidebar

Créez le fichier `components/dashboard/sidebar.tsx` :

```typescript
"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Users,
  Package,
  UserCheck,
  BarChart3,
  Settings,
  ChefHat,
  Truck,
  AlertTriangle,
  Calendar,
  LogOut
} from "lucide-react"

interface SidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  userRole: string
}

const menuItems = {
  admin: [
    { id: "overview", label: "Vue d'ensemble", icon: BarChart3 },
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "students", label: "Élèves", icon: Users },
    { id: "ingredients", label: "Ingrédients", icon: Package },
    { id: "attendance", label: "Présences", icon: UserCheck },
    { id: "menu-planning", label: "Planification menus", icon: Calendar },
    { id: "suppliers", label: "Fournisseurs", icon: Truck },
    { id: "analytics", label: "Analyses", icon: BarChart3 },
    { id: "settings", label: "Paramètres", icon: Settings },
  ],
  manager: [
    { id: "overview", label: "Vue d'ensemble", icon: BarChart3 },
    { id: "students", label: "Élèves", icon: Users },
    { id: "ingredients", label: "Ingrédients", icon: Package },
    { id: "attendance", label: "Présences", icon: UserCheck },
    { id: "menu-planning", label: "Planification menus", icon: Calendar },
    { id: "suppliers", label: "Fournisseurs", icon: Truck },
    { id: "analytics", label: "Analyses", icon: BarChart3 },
  ],
  agent: [
    { id: "attendance", label: "Présences", icon: UserCheck },
    { id: "ingredients", label: "Ingrédients", icon: Package },
    { id: "stock-movements", label: "Mouvements stock", icon: Package },
  ],
}

export function Sidebar({ activeSection, setActiveSection, userRole }: SidebarProps) {
  const { logout, user } = useAuth()
  const roleKey = userRole === "Administrateur" ? "admin" : userRole === "Responsable Cantine" ? "manager" : "agent"
  const items = menuItems[roleKey as keyof typeof menuItems] || []

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Cantine</h1>
        <p className="text-sm text-gray-600 mt-1">{user?.first_name} {user?.last_name}</p>
        <p className="text-xs text-gray-500">{userRole}</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <Button
                  variant={activeSection === item.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    activeSection === item.id && "bg-blue-50 text-blue-700"
                  )}
                  onClick={() => setActiveSection(item.id)}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              </li>
            )
          })}
        </ul>
      </nav>

