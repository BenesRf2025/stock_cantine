import express from "express"
import cors from "cors"
import mysql from "mysql2/promise"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import PDFDocument from "pdfkit"
import { config } from "dotenv"
config()

const app = express()
const PORT = parseInt(process.env.PORT) || 4000

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000'],
  credentials: true
}))
app.use(express.json())

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

// Fonction de génération de rapport PDF pour un utilisateur
function generateUserReportPDF(user, activities) {
  return new Promise((resolve, reject) => {
    try {
      const isAdmin = user.role_name === "Administrateur";

      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // En-tête
      doc.fontSize(24).font('Helvetica-Bold').text('GESTION DE CANTINE AFAKA', { align: 'center' });
      doc.moveDown(0.5);
      const reportTitle = isAdmin ? 'Rapport d\'Administration Système' : 'Rapport d\'Activités Utilisateur';
      doc.fontSize(18).font('Helvetica').text(reportTitle, { align: 'center' });
      doc.moveDown();

      // Informations utilisateur
      doc.fontSize(14).text(`Nom: ${user?.first_name || 'N/A'} ${user?.last_name || 'N/A'}`);
      doc.text(`Email: ${user?.email || 'N/A'}`);
      doc.text(`Rôle: ${user?.role_name || 'N/A'}`);
      doc.text(`Date du rapport: ${new Date().toLocaleDateString('fr-FR')}`);
      doc.moveDown();

    // Statistiques générales
    doc.fontSize(16).font('Helvetica-Bold').text('📊 STATISTIQUES GÉNÉRALES', { underline: true });
    doc.moveDown();

    const stats = activities.stats || {};
    doc.fontSize(12);
    const attendanceLabel = isAdmin ? 'Total présences enregistrées:' : 'Présences enregistrées:';
    const stockLabel = isAdmin ? 'Total mouvements de stock:' : 'Mouvements de stock:';
    const ingredientLabel = isAdmin ? 'Total ingrédients actifs:' : 'Ingrédients gérés:';
    const studentLabel = isAdmin ? 'Total élèves actifs:' : 'Élèves gérés:';
    const userLabel = isAdmin ? 'Total utilisateurs actifs:' : 'Utilisateurs actifs:';

    doc.text(`${attendanceLabel} ${stats.attendancesCount || 0}`);
    doc.text(`${stockLabel} ${stats.stockMovementsCount || 0}`);
    doc.text(`${ingredientLabel} ${stats.ingredientsManaged || 0}`);
    doc.text(`${studentLabel} ${stats.studentsManaged || 0}`);
    doc.text(`${userLabel} ${stats.usersManaged || 0}`);
    doc.moveDown();

    // Détail des activités
    doc.fontSize(16).font('Helvetica-Bold').text('📋 DÉTAIL DES ACTIVITÉS', { underline: true });
    doc.moveDown();

    // Présences
    if (activities.attendances && activities.attendances.length > 0) {
      const attendanceTitle = isAdmin ? '👥 DERNIÈRES PRÉSENCES ENREGISTRÉES:' : '👥 PRÉSENCES ENREGISTRÉES:';
      doc.fontSize(14).font('Helvetica-Bold').text(attendanceTitle, { underline: true });
      doc.moveDown(0.5);
      activities.attendances.forEach(attendance => {
        const date = attendance.attendance_date ? new Date(attendance.attendance_date).toLocaleDateString('fr-FR') : 'N/A';
        const recordedBy = isAdmin && attendance.recorded_by_name ? ` (par ${attendance.recorded_by_name})` : '';
        doc.fontSize(10).text(
          `${date} - ${attendance.student_name || 'N/A'} - ${attendance.meal_type || 'N/A'} - ${attendance.is_present ? 'Présent' : 'Absent'}${recordedBy}`
        );
      });
      doc.moveDown();
    }

    // Mouvements de stock
    if (activities.stockMovements && activities.stockMovements.length > 0) {
      const stockTitle = isAdmin ? '📦 DERNIERS MOUVEMENTS DE STOCK:' : '📦 MOUVEMENTS DE STOCK:';
      doc.fontSize(14).font('Helvetica-Bold').text(stockTitle, { underline: true });
      doc.moveDown(0.5);
      activities.stockMovements.forEach(movement => {
        const date = movement.created_at ? new Date(movement.created_at).toLocaleDateString('fr-FR') : 'N/A';
        const createdBy = isAdmin && movement.created_by_name ? ` (par ${movement.created_by_name})` : '';
        doc.fontSize(10).text(
          `${date} - ${movement.movement_type || 'N/A'} - ${movement.ingredient_name || 'N/A'} - Qté: ${movement.quantity || 0}${createdBy}`
        );
      });
      doc.moveDown();
    }

    // Ingrédients gérés
    if (activities.ingredients && activities.ingredients.length > 0) {
      const ingredientTitle = isAdmin ? '🥕 DERNIERS INGRÉDIENTS CRÉÉS:' : '🥕 INGRÉDIENTS GÉRÉS:';
      doc.fontSize(14).font('Helvetica-Bold').text(ingredientTitle, { underline: true });
      doc.moveDown(0.5);
      activities.ingredients.forEach(ingredient => {
        const date = ingredient.created_at ? new Date(ingredient.created_at).toLocaleDateString('fr-FR') : 'N/A';
        const createdBy = isAdmin && ingredient.created_by_name ? ` (par ${ingredient.created_by_name})` : '';
        doc.fontSize(10).text(
          `${date} - ${ingredient.name || 'N/A'} - Stock: ${ingredient.current_stock || 0} ${ingredient.unit || 'N/A'}${createdBy}`
        );
      });
      doc.moveDown();
    }

    // Élèves gérés
    if (activities.students && activities.students.length > 0) {
      const studentTitle = isAdmin ? '🎓 DERNIERS ÉLÈVES CRÉÉS:' : '🎓 ÉLÈVES GÉRÉS:';
      doc.fontSize(14).font('Helvetica-Bold').text(studentTitle, { underline: true });
      doc.moveDown(0.5);
      activities.students.forEach(student => {
        const date = student.created_at ? new Date(student.created_at).toLocaleDateString('fr-FR') : 'N/A';
        doc.fontSize(10).text(
          `${date} - ${student.first_name || 'N/A'} ${student.last_name || 'N/A'} - ${student.grade || 'N/A'}`
        );
      });
      doc.moveDown();
    }

      // Pied de page
      doc.moveDown(2);
      doc.fontSize(10).font('Helvetica-Bold').text('GESTION DE CANTINE AFAKA', { align: 'center' });
      doc.fontSize(8).font('Helvetica').text('Rapport généré automatiquement par le système de gestion de cantine', { align: 'center' });
      doc.text(`Date de génération: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Token d'accès requis" })
  }

  jwt.verify(token, process.env.JWT_SECRET || "secret_key", (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ error: "Session expirée, veuillez vous reconnecter" })
      }
      return res.status(403).json({ error: "Token invalide" })
    }
    req.user = user
    next()
  })
}

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

// Routes des rôles
app.get("/api/roles", authenticateToken, async (req, res) => {
  try {
    const [roles] = await pool.execute("SELECT id, name FROM roles ORDER BY name")
    res.json(roles)
  } catch (error) {
    console.error("Erreur récupération rôles:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

app.post("/api/roles", authenticateToken, checkPermission("manage_users"), async (req, res) => {
  try {
    const { name } = req.body
    const [result] = await pool.execute("INSERT INTO roles (name) VALUES (?)", [name])
    res.status(201).json({ id: result.insertId, message: "Rôle créé avec succès" })
  } catch (error) {
    console.error("Erreur création rôle:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

app.put("/api/roles/:id", authenticateToken, checkPermission("manage_users"), async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body
    await pool.execute("UPDATE roles SET name = ? WHERE id = ?", [name, id])
    res.json({ message: "Rôle mis à jour avec succès" })
  } catch (error) {
    console.error("Erreur mise à jour rôle:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

app.delete("/api/roles/:id", authenticateToken, checkPermission("manage_users"), async (req, res) => {
  try {
    const { id } = req.params
    await pool.execute("DELETE FROM roles WHERE id = ?", [id])
    res.json({ message: "Rôle supprimé avec succès" })
  } catch (error) {
    console.error("Erreur suppression rôle:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

// Routes des permissions
app.get("/api/permissions", authenticateToken, async (req, res) => {
  try {
    const [permissions] = await pool.execute("SELECT id, name, description FROM permissions ORDER BY name")
    res.json(permissions)
  } catch (error) {
    console.error("Erreur récupération permissions:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

// Routes des permissions de rôle
app.get("/api/role-permissions/:roleId", authenticateToken, async (req, res) => {
  try {
    const { roleId } = req.params
    const [permissions] = await pool.execute(`
      SELECT p.id, p.name, p.description, CASE WHEN rp.role_id IS NOT NULL THEN true ELSE false END as assigned
      FROM permissions p
      LEFT JOIN role_permissions rp ON p.id = rp.permission_id AND rp.role_id = ?
      ORDER BY p.name
    `, [roleId])
    res.json(permissions)
  } catch (error) {
    console.error("Erreur récupération permissions rôle:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

app.post("/api/role-permissions", authenticateToken, checkPermission("manage_users"), async (req, res) => {
  try {
    const { role_id, permission_id } = req.body
    await pool.execute("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)", [role_id, permission_id])
    res.status(201).json({ message: "Permission assignée avec succès" })
  } catch (error) {
    console.error("Erreur assignation permission:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

app.delete("/api/role-permissions/:roleId/:permissionId", authenticateToken, checkPermission("manage_users"), async (req, res) => {
  try {
    const { roleId, permissionId } = req.params
    await pool.execute("DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?", [roleId, permissionId])
    res.json({ message: "Permission retirée avec succès" })
  } catch (error) {
    console.error("Erreur retrait permission:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

// Routes des utilisateurs
app.get("/api/users", authenticateToken, checkPermission("view_users"), async (req, res) => {
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

app.post("/api/users", authenticateToken, checkPermission("manage_users"), async (req, res) => {
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

app.put("/api/users/:id", authenticateToken, checkPermission("manage_users"), async (req, res) => {
  try {
    const { id } = req.params
    const { username, email, first_name, last_name, role_id, is_active } = req.body

    await pool.execute(
      `
            UPDATE users
            SET username = ?, email = ?, first_name = ?, last_name = ?, role_id = ?, is_active = ?, updated_at = NOW()
            WHERE id = ?
        `,
      [username, email, first_name, last_name, role_id, is_active, id],
    )

    res.json({ message: "Utilisateur mis à jour avec succès" })
  } catch (error) {
    console.error("Erreur mise à jour utilisateur:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

app.delete("/api/users/:id", authenticateToken, checkPermission("manage_users"), async (req, res) => {
  try {
    const { id } = req.params

    await pool.execute(
      "UPDATE users SET is_active = false, updated_at = NOW() WHERE id = ?",
      [id]
    )

    res.json({ message: "Utilisateur supprimé avec succès" })
  } catch (error) {
    console.error("Erreur suppression utilisateur:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

// Routes des ingrédients
app.get("/api/ingredients", authenticateToken, checkPermission("view_ingredients"), async (req, res) => {
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

app.post("/api/ingredients", authenticateToken, checkPermission("manage_ingredients"), async (req, res) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const { name, description, unit, current_stock, critical_threshold, unit_price, supplier, expiry_date } = req.body

    const [result] = await connection.execute(
      `
          INSERT INTO ingredients (name, description, unit, critical_threshold, unit_price, supplier, expiry_date, current_stock, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [name, description, unit, critical_threshold, unit_price, supplier, expiry_date, current_stock || 0, req.user.id],
    )

    // Vérifier les alertes de stock après création
    if ((current_stock || 0) <= critical_threshold) {
      await connection.execute(
        `
            INSERT INTO stock_alerts (ingredient_id, alert_type, message)
            VALUES (?, 'low_stock', ?)
        `,
        [result.insertId, `Stock faible pour ${name}: ${current_stock || 0} restant`],
      )
    }

    await connection.commit()
    res.status(201).json({ id: result.insertId, message: "Ingrédient créé avec succès" })
  } catch (error) {
    await connection.rollback()
    console.error("Erreur création ingrédient:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  } finally {
    connection.release()
  }
})

app.put("/api/ingredients/:id", authenticateToken, checkPermission("manage_ingredients"), async (req, res) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const { id } = req.params
    const { name, description, unit, current_stock, critical_threshold, unit_price, supplier, expiry_date } = req.body

    await connection.execute(
      `
          UPDATE ingredients
          SET name = ?, description = ?, unit = ?, current_stock = ?, critical_threshold = ?,
              unit_price = ?, supplier = ?, expiry_date = ?, updated_at = NOW()
          WHERE id = ?
      `,
      [name, description, unit, current_stock || 0, critical_threshold, unit_price, supplier, expiry_date, id],
    )

    // Vérifier les alertes de stock après mise à jour
    const [ingredient] = await connection.execute(
      `
          SELECT current_stock, critical_threshold, name
          FROM ingredients
          WHERE id = ?
      `,
      [id],
    )

    if (ingredient[0]) {
      if (ingredient[0].current_stock <= ingredient[0].critical_threshold) {
        // Créer une alerte si le stock est faible
        const [existingAlert] = await connection.execute(
          `
              SELECT id FROM stock_alerts
              WHERE ingredient_id = ? AND alert_type = 'low_stock' AND is_resolved = false
          `,
          [id],
        )

        if (existingAlert.length === 0) {
          await connection.execute(
            `
                INSERT INTO stock_alerts (ingredient_id, alert_type, message)
                VALUES (?, 'low_stock', ?)
            `,
            [id, `Stock faible pour ${ingredient[0].name}: ${ingredient[0].current_stock} restant`],
          )
        }
      } else {
        // Résoudre les alertes existantes si le stock est maintenant suffisant
        await connection.execute(
          `
              UPDATE stock_alerts
              SET is_resolved = true, resolved_at = NOW()
              WHERE ingredient_id = ? AND alert_type = 'low_stock' AND is_resolved = false
          `,
          [id],
        )
      }
    }

    await connection.commit()
    res.json({ message: "Ingrédient mis à jour avec succès" })
  } catch (error) {
    await connection.rollback()
    console.error("Erreur mise à jour ingrédient:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  } finally {
    connection.release()
  }
})

app.delete("/api/ingredients/:id", authenticateToken, checkPermission("manage_ingredients"), async (req, res) => {
  try {
    const { id } = req.params

    await pool.execute(
      "UPDATE ingredients SET is_active = false, updated_at = NOW() WHERE id = ?",
      [id]
    )

    res.json({ message: "Ingrédient supprimé avec succès" })
  } catch (error) {
    console.error("Erreur suppression ingrédient:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

// Routes des mouvements de stock
app.get("/api/stock-movements", authenticateToken, checkPermission("view_stock_movements"), async (req, res) => {
  try {
    const [movements] = await pool.execute(`
            SELECT sm.*, i.name as ingredient_name, i.unit, u.username as created_by_name
            FROM stock_movements sm
            JOIN ingredients i ON sm.ingredient_id = i.id
            JOIN users u ON sm.created_by = u.id
            ORDER BY sm.created_at DESC
            LIMIT 100
        `)
    res.json(movements)
  } catch (error) {
    console.error("Erreur récupération mouvements:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

app.post("/api/stock-movements", authenticateToken, checkPermission("manage_stock_movements"), async (req, res) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const { ingredient_id, movement_type, quantity, unit_price, reason, reference_number, notes } = req.body
    const total_cost = unit_price ? quantity * unit_price : null

    // Enregistrer le mouvement
    const [result] = await connection.execute(
      `
            INSERT INTO stock_movements (ingredient_id, movement_type, quantity, unit_price, total_cost, reason, reference_number, notes, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      [ingredient_id, movement_type, quantity, unit_price, total_cost, reason, reference_number, notes, req.user.id],
    )

    // Mettre à jour le stock
    const stockChange = movement_type === "IN" ? quantity : -quantity
    await connection.execute(
      `
            UPDATE ingredients 
            SET current_stock = current_stock + ?, updated_at = NOW()
            WHERE id = ?
        `,
      [stockChange, ingredient_id],
    )

    // Vérifier les alertes de stock
    const [ingredient] = await connection.execute(
      `
            SELECT current_stock, critical_threshold, name 
            FROM ingredients 
            WHERE id = ?
        `,
      [ingredient_id],
    )

    if (ingredient[0] && ingredient[0].current_stock <= ingredient[0].critical_threshold) {
      await connection.execute(
        `
                INSERT INTO stock_alerts (ingredient_id, alert_type, message)
                VALUES (?, 'low_stock', ?)
            `,
        [ingredient_id, `Stock faible pour ${ingredient[0].name}: ${ingredient[0].current_stock} restant`],
      )
    }

    await connection.commit()
    res.status(201).json({ id: result.insertId, message: "Mouvement de stock enregistré avec succès" })
  } catch (error) {
    await connection.rollback()
    console.error("Erreur mouvement stock:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  } finally {
    connection.release()
  }
})

// Routes des élèves
app.get("/api/students", authenticateToken, checkPermission("view_students"), async (req, res) => {
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

app.post("/api/students", authenticateToken, checkPermission("manage_students"), async (req, res) => {
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

app.put("/api/students/:id", authenticateToken, checkPermission("manage_students"), async (req, res) => {
  try {
    const { id } = req.params
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

    await pool.execute(
      `
            UPDATE students
            SET first_name = ?, last_name = ?, date_of_birth = ?, gender = ?, grade = ?, class_name = ?,
                parent_name = ?, parent_phone = ?, address = ?, emergency_contact = ?, emergency_phone = ?,
                dietary_restrictions = ?, allergies = ?, updated_at = NOW()
            WHERE id = ?
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
        id,
      ],
    )

    res.json({ message: "Élève mis à jour avec succès" })
  } catch (error) {
    console.error("Erreur mise à jour élève:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

app.delete("/api/students/:id", authenticateToken, checkPermission("manage_students"), async (req, res) => {
  try {
    const { id } = req.params

    await pool.execute(
      "UPDATE students SET is_active = false, updated_at = NOW() WHERE id = ?",
      [id]
    )

    res.json({ message: "Élève supprimé avec succès" })
  } catch (error) {
    console.error("Erreur suppression élève:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

// Routes des présences
app.post("/api/attendances", authenticateToken, checkPermission("manage_attendances"), async (req, res) => {
  try {
    const { student_id, attendance_date, meal_type, is_present, notes } = req.body

    // Validation du type de repas
    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack']
    if (!meal_type || !validMealTypes.includes(meal_type)) {
      return res.status(400).json({ error: "Type de repas invalide. Valeurs autorisées: breakfast, lunch, dinner, snack" })
    }

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

app.get("/api/attendances", authenticateToken, checkPermission("view_attendances"), async (req, res) => {
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

app.put("/api/attendances/:id", authenticateToken, checkPermission("manage_attendances"), async (req, res) => {
  try {
    const { id } = req.params
    const { student_id, attendance_date, meal_type, is_present, notes } = req.body

    await pool.execute(
      `
            UPDATE attendances
            SET student_id = ?, attendance_date = ?, meal_type = ?, is_present = ?, notes = ?, recorded_by = ?, recorded_at = NOW()
            WHERE id = ?
        `,
      [student_id, attendance_date, meal_type, is_present, notes, req.user.id, id],
    )

    res.json({ message: "Présence mise à jour avec succès" })
  } catch (error) {
    console.error("Erreur mise à jour présence:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

app.delete("/api/attendances/:id", authenticateToken, checkPermission("manage_attendances"), async (req, res) => {
  try {
    const { id } = req.params

    await pool.execute("DELETE FROM attendances WHERE id = ?", [id])

    res.json({ message: "Présence supprimée avec succès" })
  } catch (error) {
    console.error("Erreur suppression présence:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

// Routes des alertes de stock
app.get("/api/stock-alerts", authenticateToken, checkPermission("view_stock_movements"), async (req, res) => {
  try {
    const [alerts] = await pool.execute(`
            SELECT sa.*, i.name as ingredient_name, i.unit, i.current_stock, i.critical_threshold
            FROM stock_alerts sa
            JOIN ingredients i ON sa.ingredient_id = i.id
            WHERE sa.is_resolved = false
            ORDER BY sa.created_at DESC
        `)
    res.json(alerts)
  } catch (error) {
    console.error("Erreur récupération alertes:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

app.put("/api/stock-alerts/:id/resolve", authenticateToken, checkPermission("manage_stock_movements"), async (req, res) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const { id } = req.params

    // Récupérer l'alerte pour obtenir l'ingredient_id
    const [alerts] = await connection.execute(
      "SELECT ingredient_id FROM stock_alerts WHERE id = ?",
      [id]
    )

    if (alerts.length === 0) {
      await connection.rollback()
      return res.status(404).json({ error: "Alerte non trouvée" })
    }

    const ingredientId = alerts[0].ingredient_id

    // Récupérer le seuil critique de l'ingrédient
    const [ingredients] = await connection.execute(
      "SELECT critical_threshold FROM ingredients WHERE id = ?",
      [ingredientId]
    )

    if (ingredients.length === 0) {
      await connection.rollback()
      return res.status(404).json({ error: "Ingrédient non trouvé" })
    }

    const criticalThreshold = ingredients[0].critical_threshold

    // Augmenter le stock actuel du seuil critique + 1 pour s'assurer qu'il dépasse le seuil
    const quantityAdded = criticalThreshold + 1
    await connection.execute(
      "UPDATE ingredients SET current_stock = current_stock + ?, updated_at = NOW() WHERE id = ?",
      [quantityAdded, ingredientId]
    )

    // Enregistrer le mouvement de stock
    await connection.execute(
      `
        INSERT INTO stock_movements (ingredient_id, movement_type, quantity, reason, created_by)
        VALUES (?, 'IN', ?, 'Résolution d\'alerte de stock', ?)
      `,
      [ingredientId, quantityAdded, req.user.id]
    )

    // Marquer l'alerte comme résolue
    await connection.execute(
      "UPDATE stock_alerts SET is_resolved = true, resolved_at = NOW() WHERE id = ?",
      [id]
    )

    await connection.commit()
    res.json({ message: "Alerte résolue avec succès et stock augmenté" })
  } catch (error) {
    await connection.rollback()
    console.error("Erreur résolution alerte:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  } finally {
    connection.release()
  }
})

// Routes des recettes
app.get("/api/recipes", authenticateToken, checkPermission("view_ingredients"), async (req, res) => {
  try {
    const [recipes] = await pool.execute(`
            SELECT r.*, u.username as created_by_name
            FROM recipes r
            LEFT JOIN users u ON r.created_by = u.id
            WHERE r.is_active = true
            ORDER BY r.created_at DESC
        `)
    res.json(recipes)
  } catch (error) {
    console.error("Erreur récupération recettes:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

app.post("/api/recipes", authenticateToken, checkPermission("manage_ingredients"), async (req, res) => {
  try {
    const { name, description, instructions, prep_time, cook_time, servings, ingredients } = req.body

    const [result] = await pool.execute(
      `
            INSERT INTO recipes (name, description, instructions, prep_time, cook_time, servings, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
      [name, description, instructions, prep_time, cook_time, servings, req.user.id],
    )

    res.status(201).json({ id: result.insertId, message: "Recette créée avec succès" })
  } catch (error) {
    console.error("Erreur création recette:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

app.put("/api/recipes/:id", authenticateToken, checkPermission("manage_ingredients"), async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, instructions, prep_time, cook_time, servings } = req.body

    await pool.execute(
      `
            UPDATE recipes
            SET name = ?, description = ?, instructions = ?, prep_time = ?, cook_time = ?, servings = ?, updated_at = NOW()
            WHERE id = ?
        `,
      [name, description, instructions, prep_time, cook_time, servings, id],
    )

    res.json({ message: "Recette mise à jour avec succès" })
  } catch (error) {
    console.error("Erreur mise à jour recette:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

app.delete("/api/recipes/:id", authenticateToken, checkPermission("manage_ingredients"), async (req, res) => {
  try {
    const { id } = req.params

    await pool.execute(
      "UPDATE recipes SET is_active = false, updated_at = NOW() WHERE id = ?",
      [id]
    )

    res.json({ message: "Recette supprimée avec succès" })
  } catch (error) {
    console.error("Erreur suppression recette:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

// Routes des fournisseurs
app.get("/api/suppliers", authenticateToken, checkPermission("view_ingredients"), async (req, res) => {
  try {
    const [suppliers] = await pool.execute(`
            SELECT * FROM suppliers
            WHERE is_active = true
            ORDER BY name
        `)
    res.json(suppliers)
  } catch (error) {
    console.error("Erreur récupération fournisseurs:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

app.post("/api/suppliers", authenticateToken, checkPermission("manage_ingredients"), async (req, res) => {
  try {
    const { name, category, contact_phone, contact_email, address, rating, delivery_time } = req.body

    const [result] = await pool.execute(
      `
            INSERT INTO suppliers (name, category, contact_phone, contact_email, address, rating, delivery_time)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
      [name, category, contact_phone, contact_email, address, rating || 0, delivery_time],
    )

    res.status(201).json({ id: result.insertId, message: "Fournisseur créé avec succès" })
  } catch (error) {
    console.error("Erreur création fournisseur:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

// Routes des commandes
app.get("/api/orders", authenticateToken, checkPermission("view_ingredients"), async (req, res) => {
  try {
    const [orders] = await pool.execute(`
            SELECT o.*, s.name as supplier_name, u.username as created_by_name
            FROM orders o
            LEFT JOIN suppliers s ON o.supplier_id = s.id
            LEFT JOIN users u ON o.created_by = u.id
            ORDER BY o.created_at DESC
        `)
    res.json(orders)
  } catch (error) {
    console.error("Erreur récupération commandes:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

app.post("/api/orders", authenticateToken, checkPermission("manage_ingredients"), async (req, res) => {
  try {
    const { supplier_id, delivery_date, priority, notes, items } = req.body
    const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)

    const [result] = await pool.execute(
      `
            INSERT INTO orders (supplier_id, delivery_date, priority, notes, total_amount, created_by)
            VALUES (?, ?, ?, ?, ?, ?)
        `,
      [supplier_id, delivery_date, priority || "normal", notes, total_amount, req.user.id],
    )

    res.status(201).json({ id: result.insertId, message: "Commande créée avec succès" })
  } catch (error) {
    console.error("Erreur création commande:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

// Routes des profils allergènes
app.get("/api/allergen-profiles", authenticateToken, checkPermission("view_students"), async (req, res) => {
  try {
    const [profiles] = await pool.execute(`
            SELECT ap.*, s.first_name, s.last_name
            FROM allergen_profiles ap
            JOIN students s ON ap.student_id = s.id
            WHERE ap.is_active = true
            ORDER BY s.last_name, s.first_name
        `)
    res.json(profiles)
  } catch (error) {
    console.error("Erreur récupération profils allergènes:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

app.post("/api/allergen-profiles", authenticateToken, checkPermission("manage_students"), async (req, res) => {
  try {
    const { student_id, allergies, dietary_restrictions, severity, emergency_contact } = req.body

    const [result] = await pool.execute(
      `
            INSERT INTO allergen_profiles (student_id, allergies, dietary_restrictions, severity, emergency_contact)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            allergies = VALUES(allergies),
            dietary_restrictions = VALUES(dietary_restrictions),
            severity = VALUES(severity),
            emergency_contact = VALUES(emergency_contact),
            updated_at = NOW()
        `,
      [student_id, JSON.stringify(allergies), JSON.stringify(dietary_restrictions), severity, emergency_contact],
    )

    res.status(201).json({ id: result.insertId, message: "Profil allergène créé avec succès" })
  } catch (error) {
    console.error("Erreur création profil allergène:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

// Routes des menus planifiés
app.get("/api/menu-plans", authenticateToken, checkPermission("view_ingredients"), async (req, res) => {
  try {
    const [plans] = await pool.execute(`
            SELECT mp.*, r.name as recipe_name, u.username as created_by_name
            FROM menu_plans mp
            LEFT JOIN recipes r ON mp.recipe_id = r.id
            LEFT JOIN users u ON mp.created_by = u.id
            ORDER BY mp.planned_date DESC, mp.meal_type
        `)
    res.json(plans)
  } catch (error) {
    console.error("Erreur récupération plans de menu:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

app.post("/api/menu-plans", authenticateToken, checkPermission("manage_ingredients"), async (req, res) => {
  try {
    const { planned_date, meal_type, recipe_id, estimated_portions, cost_per_portion } = req.body

    const [result] = await pool.execute(
      `
            INSERT INTO menu_plans (planned_date, meal_type, recipe_id, estimated_portions, cost_per_portion, created_by)
            VALUES (?, ?, ?, ?, ?, ?)
        `,
      [planned_date, meal_type, recipe_id, estimated_portions, cost_per_portion, req.user.id],
    )

    res.status(201).json({ id: result.insertId, message: "Plan de menu créé avec succès" })
  } catch (error) {
    console.error("Erreur création plan de menu:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

// Route pour les statistiques analytiques
app.get("/api/analytics", authenticateToken, checkPermission("view_attendances"), async (req, res) => {
  try {
    // Statistiques de base
    const [activeUsersCount] = await pool.execute("SELECT COUNT(*) as count FROM users WHERE is_active = true")
    const [todayAttendances] = await pool.execute(`
            SELECT COUNT(*) as count FROM attendances
            WHERE attendance_date = CURDATE() AND is_present = true
        `)
    const [weeklyTrend] = await pool.execute(`
            SELECT
                (SELECT COUNT(*) FROM attendances WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND is_present = true) as current_week,
                (SELECT COUNT(*) FROM attendances WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) AND attendance_date < DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND is_present = true) as previous_week
        `)

    const currentWeek = weeklyTrend[0].current_week || 0
    const previousWeek = weeklyTrend[0].previous_week || 1
    const trend = ((currentWeek - previousWeek) / previousWeek * 100).toFixed(1)

    // Calculer la valeur du stock
    const [stockValueResult] = await pool.execute(`
      SELECT SUM(current_stock * unit_price) as total_value
      FROM ingredients
      WHERE is_active = true AND unit_price IS NOT NULL
    `)
    const stockValue = parseFloat(stockValueResult[0].total_value || 0)

    // Calculer le coût total des mouvements de stock récents (dernière semaine)
    const [totalCostResult] = await pool.execute(`
      SELECT SUM(total_cost) as total_cost
      FROM stock_movements
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND total_cost IS NOT NULL
    `)
    const totalCost = parseFloat(totalCostResult[0].total_cost || 0)

    // Nombre de repas servis cette semaine
    const [mealsServed] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM attendances
      WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND is_present = true
    `)
    const mealsCount = mealsServed[0].count || 1
    const costPerMeal = mealsCount > 0 ? (totalCost / mealsCount).toFixed(2) : 0

    // Pourcentage de gaspillage (simulé pour l'instant, pourrait être calculé à partir de données réelles)
    const wastePercentage = 8.2 // Simulé

    const analytics = {
      totalStudents: activeUsersCount[0].count,
      dailyAttendance: todayAttendances[0].count,
      weeklyTrend: parseFloat(trend),
      totalCost: parseFloat(totalCost.toFixed(2)),
      costPerMeal: parseFloat(costPerMeal),
      stockValue: parseFloat(stockValue.toFixed(2)),
      wastePercentage: wastePercentage,
    }

    res.json(analytics)
  } catch (error) {
    console.error("Erreur récupération analytics:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

// Fonction pour vérifier et créer des alertes de stock pour les ingrédients existants
async function checkAndCreateStockAlerts() {
  try {
    const connection = await pool.getConnection()
    await connection.beginTransaction()

    // Récupérer tous les ingrédients actifs avec stock faible
    const [lowStockIngredients] = await connection.execute(`
      SELECT id, name, current_stock, critical_threshold
      FROM ingredients
      WHERE is_active = true AND current_stock <= critical_threshold
    `)

    for (const ingredient of lowStockIngredients) {
      // Vérifier si une alerte existe déjà pour cet ingrédient
      const [existingAlert] = await connection.execute(`
        SELECT id FROM stock_alerts
        WHERE ingredient_id = ? AND alert_type = 'low_stock' AND is_resolved = false
      `, [ingredient.id])

      if (existingAlert.length === 0) {
        // Créer une alerte
        await connection.execute(`
          INSERT INTO stock_alerts (ingredient_id, alert_type, message)
          VALUES (?, 'low_stock', ?)
        `, [ingredient.id, `Stock faible pour ${ingredient.name}: ${ingredient.current_stock} restant`])
      }
    }

    await connection.commit()
    connection.release()
    console.log("Vérification des alertes de stock terminée")
  } catch (error) {
    console.error("Erreur lors de la vérification des alertes de stock:", error)
  }
}

// Route pour vérifier manuellement les alertes de stock
app.post("/api/stock-alerts/check", authenticateToken, checkPermission("manage_stock_movements"), async (req, res) => {
  try {
    await checkAndCreateStockAlerts()
    res.json({ message: "Vérification des alertes de stock terminée" })
  } catch (error) {
    console.error("Erreur vérification alertes:", error)
    res.status(500).json({ error: "Erreur interne du serveur" })
  }
})

// Route pour exporter le rapport PDF d'un utilisateur
app.get("/api/users/:id/report", authenticateToken, async (req, res) => {
  // Allow users to download their own reports or admins with view_users permission
  if (req.user.id != req.params.id) {
    try {
      const [rows] = await pool.execute(
        `
                SELECT p.name
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                WHERE rp.role_id = ? AND p.name = ?
            `,
        [req.user.role_id, "view_users"],
      )

      if (rows.length === 0) {
        return res.status(403).json({ error: "Permission insuffisante" })
      }
    } catch (error) {
      return res.status(500).json({ error: "Erreur de vérification des permissions" })
    }
  }
  try {
    const { id } = req.params;

    // Récupérer les informations de l'utilisateur
    const [users] = await pool.execute(`
      SELECT u.*, r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [id]);

    if (users.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    const user = users[0];

    // Vérifier si l'utilisateur est un administrateur
    const isAdmin = user.role_name === "Administrateur";

    let attendancesCount, stockMovementsCount, ingredientsCount, studentsCount, usersManagedCount;

    if (isAdmin) {
      // Pour l'admin, afficher les statistiques globales du système
      [attendancesCount] = await pool.execute("SELECT COUNT(*) as count FROM attendances");
      [stockMovementsCount] = await pool.execute("SELECT COUNT(*) as count FROM stock_movements");
      [ingredientsCount] = await pool.execute("SELECT COUNT(*) as count FROM ingredients WHERE is_active = true");
      [studentsCount] = await pool.execute("SELECT COUNT(*) as count FROM students WHERE is_active = true");
      [usersManagedCount] = await pool.execute("SELECT COUNT(*) as count FROM users WHERE is_active = true");
    } else {
      // Pour les autres utilisateurs, afficher leurs activités personnelles
      [attendancesCount] = await pool.execute(
        "SELECT COUNT(*) as count FROM attendances WHERE recorded_by = ?",
        [id]
      );

      [stockMovementsCount] = await pool.execute(
        "SELECT COUNT(*) as count FROM stock_movements WHERE created_by = ?",
        [id]
      );

      [ingredientsCount] = await pool.execute(
        "SELECT COUNT(DISTINCT i.id) as count FROM ingredients i JOIN stock_movements sm ON i.id = sm.ingredient_id WHERE sm.created_by = ?",
        [id]
      );

      [studentsCount] = await pool.execute(
        "SELECT COUNT(DISTINCT s.id) as count FROM students s JOIN attendances a ON s.id = a.student_id WHERE a.recorded_by = ?",
        [id]
      );

      [usersManagedCount] = await pool.execute(
        "SELECT COUNT(*) as count FROM users WHERE is_active = true",
        []
      );
    }

    let attendances, stockMovements, ingredients, students;

    if (isAdmin) {
      // Pour l'admin, afficher les activités récentes du système
      [attendances] = await pool.execute(`
        SELECT a.*, CONCAT(s.first_name, ' ', s.last_name) as student_name, u.username as recorded_by_name
        FROM attendances a
        JOIN students s ON a.student_id = s.id
        JOIN users u ON a.recorded_by = u.id
        WHERE a.recorded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY a.recorded_at DESC
        LIMIT 50
      `);

      [stockMovements] = await pool.execute(`
        SELECT sm.*, i.name as ingredient_name, u.username as created_by_name
        FROM stock_movements sm
        JOIN ingredients i ON sm.ingredient_id = i.id
        JOIN users u ON sm.created_by = u.id
        WHERE sm.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY sm.created_at DESC
        LIMIT 50
      `);

      [ingredients] = await pool.execute(`
        SELECT i.*, u.username as created_by_name
        FROM ingredients i
        LEFT JOIN users u ON i.created_by = u.id
        WHERE i.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY i.created_at DESC
        LIMIT 20
      `);

      [students] = await pool.execute(`
        SELECT s.*
        FROM students s
        WHERE s.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY s.created_at DESC
        LIMIT 20
      `);
    } else {
      // Pour les autres utilisateurs, afficher leurs activités personnelles
      [attendances] = await pool.execute(`
        SELECT a.*, CONCAT(s.first_name, ' ', s.last_name) as student_name
        FROM attendances a
        JOIN students s ON a.student_id = s.id
        WHERE a.recorded_by = ? AND a.recorded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY a.recorded_at DESC
        LIMIT 50
      `, [id]);

      [stockMovements] = await pool.execute(`
        SELECT sm.*, i.name as ingredient_name
        FROM stock_movements sm
        JOIN ingredients i ON sm.ingredient_id = i.id
        WHERE sm.created_by = ? AND sm.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY sm.created_at DESC
        LIMIT 50
      `, [id]);

      [ingredients] = await pool.execute(`
        SELECT i.* FROM ingredients i
        JOIN stock_movements sm ON i.id = sm.ingredient_id
        WHERE sm.created_by = ? AND sm.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY i.id
        ORDER BY i.created_at DESC
        LIMIT 20
      `, [id]);

      [students] = await pool.execute(`
        SELECT s.* FROM students s
        JOIN attendances a ON s.id = a.student_id
        WHERE a.recorded_by = ? AND a.recorded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY s.id
        ORDER BY s.created_at DESC
        LIMIT 20
      `, [id]);
    }

    const activities = {
      stats: {
        attendancesCount: attendancesCount[0].count,
        stockMovementsCount: stockMovementsCount[0].count,
        ingredientsManaged: ingredientsCount[0].count,
        studentsManaged: studentsCount[0].count,
        usersManaged: usersManagedCount[0].count,
      },
      attendances: attendances,
      stockMovements: stockMovements,
      ingredients: ingredients,
      students: students,
    };

    // Générer le PDF
    try {
      const pdfBuffer = await generateUserReportPDF(user, activities);

      // Envoyer le PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=rapport-${user.first_name}-${user.last_name}.pdf`);
      res.send(pdfBuffer);
    } catch (pdfError) {
      console.error("Erreur génération PDF:", pdfError);
      return res.status(500).json({ error: "Erreur lors de la génération du PDF" });
    }

  } catch (error) {
    console.error("Erreur génération rapport PDF:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Démarrage du serveur
app.listen(PORT, async () => {
  console.log(`Serveur API démarré sur le port ${PORT}`)
  console.log(`Tiako loatra enao`)
  console.log(`Amen fa enao no anjarako ee`)

  // Vérifier les alertes de stock au démarrage
  await checkAndCreateStockAlerts()
})