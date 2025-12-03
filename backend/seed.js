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

    // Create tables if not exist
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id)
      )
    `)

    // Add updated_at column if it doesn't exist (for existing databases)
    try {
      await connectionWithDB.execute(`
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `)
      console.log("Added updated_at column to users table")
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log("updated_at column already exists in users table")
      } else {
        console.error("Error adding updated_at column:", error.message)
      }
    }

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

    // Add created_by column if it doesn't exist (for existing databases)
    try {
      await connectionWithDB.execute(`
        ALTER TABLE ingredients ADD COLUMN created_by INT,
        ADD FOREIGN KEY (created_by) REFERENCES users(id)
      `)
      console.log("Added created_by column to ingredients table")
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log("created_by column already exists in ingredients table")
      } else {
        console.error("Error adding created_by column:", error.message)
      }
    }

    await connectionWithDB.execute(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ingredient_id INT NOT NULL,
        movement_type ENUM('IN', 'OUT') NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        unit_price DECIMAL(10,2),
        total_cost DECIMAL(10,2),
        reason VARCHAR(255) NOT NULL,
        reference_number VARCHAR(100),
        notes TEXT,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `)

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

    await connectionWithDB.execute("DROP TABLE IF EXISTS attendances")

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

    await connectionWithDB.execute(`
      CREATE TABLE IF NOT EXISTS stock_alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ingredient_id INT NOT NULL,
        alert_type ENUM('low_stock', 'expired', 'expiring_soon') NOT NULL,
        message TEXT NOT NULL,
        is_resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP NULL,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
      )
    `)

    await connectionWithDB.execute(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        instructions TEXT,
        prep_time INT,
        cook_time INT,
        servings INT,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `)

    await connectionWithDB.execute(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50),
        contact_phone VARCHAR(20),
        contact_email VARCHAR(100),
        address TEXT,
        rating DECIMAL(3,2) DEFAULT 0,
        delivery_time VARCHAR(20),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    await connectionWithDB.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        supplier_id INT NOT NULL,
        delivery_date DATE,
        priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
        notes TEXT,
        total_amount DECIMAL(10,2),
        status ENUM('pending', 'confirmed', 'delivered', 'cancelled') DEFAULT 'pending',
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `)

    await connectionWithDB.execute(`
      CREATE TABLE IF NOT EXISTS allergen_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        allergies JSON,
        dietary_restrictions JSON,
        severity ENUM('mild', 'moderate', 'severe') DEFAULT 'mild',
        emergency_contact VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_student (student_id),
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `)

    await connectionWithDB.execute(`
      CREATE TABLE IF NOT EXISTS menu_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        planned_date DATE NOT NULL,
        meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
        recipe_id INT,
        estimated_portions INT,
        cost_per_portion DECIMAL(10,2),
        status ENUM('planned', 'approved', 'prepared', 'served') DEFAULT 'planned',
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
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

    // Insert users
    const users = [
      {
        username: "admin",
        email: "admin@cantine.com",
        password: "admin123",
        first_name: "Admin",
        last_name: "User",
        role_name: "Administrateur",
      },
      {
        username: "manager",
        email: "manager@cantine.com",
        password: "manager123",
        first_name: "Manager",
        last_name: "User",
        role_name: "Responsable Cantine",
      },
      {
        username: "agent",
        email: "agent@cantine.com",
        password: "agent123",
        first_name: "Agent",
        last_name: "User",
        role_name: "Agent de Saisie",
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

    // Insert permissions
    const permissions = [
      { name: "view_users", description: "Voir les utilisateurs" },
      { name: "manage_users", description: "Gérer les utilisateurs" },
      { name: "view_ingredients", description: "Voir les ingrédients" },
      { name: "manage_ingredients", description: "Gérer les ingrédients" },
      { name: "view_stock_movements", description: "Voir les mouvements de stock" },
      { name: "manage_stock_movements", description: "Gérer les mouvements de stock" },
      { name: "view_students", description: "Voir les élèves" },
      { name: "manage_students", description: "Gérer les élèves" },
      { name: "view_attendances", description: "Voir les présences" },
      { name: "manage_attendances", description: "Gérer les présences" },
    ]

    for (const permission of permissions) {
      await connectionWithDB.execute(
        "INSERT IGNORE INTO permissions (name, description) VALUES (?, ?)",
        [permission.name, permission.description]
      )
    }

    console.log("Permissions inserted")

    // Get permission IDs
    const [permissionRows] = await connectionWithDB.execute("SELECT id, name FROM permissions")
    const permissionMap = {}
    permissionRows.forEach(row => {
      permissionMap[row.name] = row.id
    })

    // Assign permissions to roles
    const rolePermissions = [
      // Administrateur - toutes les permissions
      { role: "Administrateur", permissions: Object.keys(permissionMap) },
      // Responsable Cantine - la plupart des permissions
      { role: "Responsable Cantine", permissions: [
        "view_users", "view_ingredients", "manage_ingredients",
        "view_stock_movements", "manage_stock_movements",
        "view_students", "manage_students",
        "view_attendances", "manage_attendances"
      ]},
      // Agent de Saisie - permissions limitées
      { role: "Agent de Saisie", permissions: [
        "view_ingredients", "view_stock_movements", "manage_stock_movements",
        "view_students", "view_attendances", "manage_attendances"
      ]}
    ]

    for (const rolePermission of rolePermissions) {
      const roleId = roleMap[rolePermission.role]
      for (const permissionName of rolePermission.permissions) {
        const permissionId = permissionMap[permissionName]
        await connectionWithDB.execute(
          "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
          [roleId, permissionId]
        )
      }
    }

    console.log("Role permissions assigned")

    // Insert sample ingredients
    const ingredients = [
      { name: "Riz", description: "Riz blanc", unit: "kg", critical_threshold: 10, unit_price: 2.50 },
      { name: "Haricots", description: "Haricots rouges", unit: "kg", critical_threshold: 5, unit_price: 3.00 },
      { name: "Huile", description: "Huile de tournesol", unit: "L", critical_threshold: 3, unit_price: 4.50 },
      { name: "Sel", description: "Sel de cuisine", unit: "kg", critical_threshold: 2, unit_price: 1.00 },
      { name: "Tomates", description: "Tomates fraîches", unit: "kg", critical_threshold: 5, unit_price: 2.00 },
    ]

    for (const ingredient of ingredients) {
      await connectionWithDB.execute(
        "INSERT IGNORE INTO ingredients (name, description, unit, critical_threshold, unit_price) VALUES (?, ?, ?, ?, ?)",
        [ingredient.name, ingredient.description, ingredient.unit, ingredient.critical_threshold, ingredient.unit_price]
      )
    }

    console.log("Sample ingredients inserted")

    // Insert sample students
    const students = [
      { first_name: "Jean", last_name: "Dupont", date_of_birth: "2015-05-15", gender: "M", grade: "CP", class_name: "CP-A", parent_name: "Marie Dupont", parent_phone: "0123456789" },
      { first_name: "Marie", last_name: "Martin", date_of_birth: "2014-08-22", gender: "F", grade: "CE1", class_name: "CE1-B", parent_name: "Pierre Martin", parent_phone: "0987654321" },
      { first_name: "Pierre", last_name: "Durand", date_of_birth: "2016-12-10", gender: "M", grade: "CP", class_name: "CP-A", parent_name: "Sophie Durand", parent_phone: "0147258369" },
      { first_name: "Sophie", last_name: "Bernard", date_of_birth: "2015-03-07", gender: "F", grade: "CE1", class_name: "CE1-B", parent_name: "Jean Bernard", parent_phone: "0369258147" },
    ]

    for (const student of students) {
      await connectionWithDB.execute(
        "INSERT IGNORE INTO students (first_name, last_name, date_of_birth, gender, grade, class_name, parent_name, parent_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [student.first_name, student.last_name, student.date_of_birth, student.gender, student.grade, student.class_name, student.parent_name, student.parent_phone]
      )
    }

    console.log("Sample students inserted")

    // Insert sample attendances for today
    const [studentRows] = await connectionWithDB.execute("SELECT id FROM students LIMIT 4")
    const studentIds = studentRows.map(row => row.id)

    const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD in local time

    const sampleAttendances = [
      { student_id: studentIds[0], meal_type: 'breakfast', is_present: true },
      { student_id: studentIds[1], meal_type: 'breakfast', is_present: true },
      { student_id: studentIds[0], meal_type: 'lunch', is_present: true },
      { student_id: studentIds[1], meal_type: 'lunch', is_present: false },
      { student_id: studentIds[2], meal_type: 'lunch', is_present: true },
      { student_id: studentIds[3], meal_type: 'dinner', is_present: true },
    ]

    // Get agent user ID
    const [agentUser] = await connectionWithDB.execute("SELECT id FROM users WHERE username = 'agent'")
    const agentId = agentUser[0].id

    for (const attendance of sampleAttendances) {
      await connectionWithDB.execute(
        "INSERT IGNORE INTO attendances (student_id, attendance_date, meal_type, is_present, recorded_by) VALUES (?, ?, ?, ?, ?)",
        [attendance.student_id, today, attendance.meal_type, attendance.is_present, agentId]
      )
    }

    console.log("Sample attendances inserted")
    console.log("Seeding completed successfully")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await connectionWithDB.end()
  }
}

seedDatabase()