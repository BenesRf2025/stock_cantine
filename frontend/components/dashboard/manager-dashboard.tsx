"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiService } from "@/services/api"
import { Package, Plus, AlertTriangle, TrendingUp, Users } from "lucide-react"

interface ManagerDashboardProps {
  activeSection: string
}

export function ManagerDashboard({ activeSection }: ManagerDashboardProps) {
  const [ingredients, setIngredients] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [stockAlerts, setStockAlerts] = useState<any[]>([])
  const [stockMovements, setStockMovements] = useState<any[]>([])
  const [attendances, setAttendances] = useState<any[]>([])
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isCreateIngredientOpen, setIsCreateIngredientOpen] = useState(false)
  const [isCreateStudentOpen, setIsCreateStudentOpen] = useState(false)
  const [isRecordAttendanceOpen, setIsRecordAttendanceOpen] = useState(false)
  const [isCreateRecipeOpen, setIsCreateRecipeOpen] = useState(false)
  const [isEditIngredientOpen, setIsEditIngredientOpen] = useState(false)
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false)
  const [isEditAttendanceOpen, setIsEditAttendanceOpen] = useState(false)
  const [isEditRecipeOpen, setIsEditRecipeOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  const [newIngredient, setNewIngredient] = useState({
    name: "",
    description: "",
    unit: "",
    current_stock: "",
    critical_threshold: "",
    unit_price: "",
    supplier: "",
    expiry_date: "",
  })

  const [newStudent, setNewStudent] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    grade: "",
    class_name: "",
    parent_name: "",
    parent_phone: "",
    address: "",
    emergency_contact: "",
    emergency_phone: "",
    dietary_restrictions: "",
    allergies: "",
  })

  const [newAttendance, setNewAttendance] = useState({
    beneficiary_id: "",
    attendance_date: new Date().toISOString().split('T')[0],
    meal_type: "lunch",
    is_present: true,
    notes: "",
  })

  const [newRecipe, setNewRecipe] = useState({
    name: "",
    description: "",
    instructions: "",
    prep_time: "",
    cook_time: "",
    servings: "",
  })

  const [attendanceFilters, setAttendanceFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    meal_type: "",
  })

  useEffect(() => {
    loadData()
  }, [activeSection])

  const loadData = async () => {
    try {
      setLoading(true)
      if (activeSection === "ingredients" || activeSection === "overview") {
        const ingredientsData = await apiService.getIngredients()
        setIngredients(ingredientsData)
      }
      if (activeSection === "students" || activeSection === "overview") {
        const studentsData = await apiService.getStudents()
        setStudents(studentsData)
      }
      if (activeSection === "alerts" || activeSection === "overview") {
        const alertsData = await apiService.getStockAlerts()
        setStockAlerts(alertsData)
      }
      if (activeSection === "stock") {
        const ingredientsData = await apiService.getIngredients()
        setIngredients(ingredientsData)
      }
      if (activeSection === "attendances") {
        const attendancesData = await apiService.getAttendances(attendanceFilters)
        setAttendances(attendancesData)
      }
      if (activeSection === "recipes") {
        const recipesData = await apiService.getRecipes()
        setRecipes(recipesData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateIngredient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiService.createIngredient({
        name: newIngredient.name,
        description: newIngredient.description || null,
        unit: newIngredient.unit,
        current_stock: Number.parseFloat(newIngredient.current_stock) || 0,
        critical_threshold: Number.parseFloat(newIngredient.critical_threshold),
        unit_price: newIngredient.unit_price ? Number.parseFloat(newIngredient.unit_price) : null,
        supplier: newIngredient.supplier || null,
        expiry_date: null,
      })
      setIsCreateIngredientOpen(false)
      setNewIngredient({
        name: "",
        description: "",
        unit: "",
        current_stock: "",
        critical_threshold: "",
        unit_price: "",
        supplier: "",
        expiry_date: "",
      })
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de création")
    }
  }

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiService.createStudent(newStudent)
      setIsCreateStudentOpen(false)
      setNewStudent({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        grade: "",
        class_name: "",
        parent_name: "",
        parent_phone: "",
        address: "",
        emergency_contact: "",
        emergency_phone: "",
        dietary_restrictions: "",
        allergies: "",
      })
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de création")
    }
  }

  const handleRecordAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    const studentId = Number.parseInt(newAttendance.beneficiary_id)
    if (isNaN(studentId)) {
      setError("Veuillez sélectionner un élève valide")
      return
    }
    try {
      await apiService.createAttendance({
        student_id: studentId,
        attendance_date: newAttendance.attendance_date,
        meal_type: newAttendance.meal_type,
        is_present: newAttendance.is_present,
        notes: newAttendance.notes,
      })
      setIsRecordAttendanceOpen(false)
      setNewAttendance({
        beneficiary_id: "",
        attendance_date: new Date().toISOString().split('T')[0],
        meal_type: "lunch",
        is_present: true,
        notes: "",
      })
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'enregistrement")
    }
  }

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiService.createRecipe({
        ...newRecipe,
        prep_time: Number.parseInt(newRecipe.prep_time),
        cook_time: Number.parseInt(newRecipe.cook_time),
        servings: Number.parseInt(newRecipe.servings),
      })
      setIsCreateRecipeOpen(false)
      setNewRecipe({
        name: "",
        description: "",
        instructions: "",
        prep_time: "",
        cook_time: "",
        servings: "",
      })
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de création")
    }
  }

  const handleAttendanceFilterChange = () => {
    loadData()
  }

  const handleEditIngredient = (ingredient: any) => {
    setEditingItem(ingredient)
    setNewIngredient({
      name: ingredient.name,
      description: ingredient.description || "",
      unit: ingredient.unit,
      current_stock: ingredient.current_stock?.toString() || "",
      critical_threshold: ingredient.critical_threshold.toString(),
      unit_price: ingredient.unit_price?.toString() || "",
      supplier: ingredient.supplier || "",
      expiry_date: ingredient.expiry_date || "",
    })
    setIsEditIngredientOpen(true)
  }

  const handleUpdateIngredient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    try {
      await apiService.updateIngredient(editingItem.id, {
        name: newIngredient.name,
        description: newIngredient.description || null,
        unit: newIngredient.unit,
        current_stock: Number.parseFloat(newIngredient.current_stock) || 0,
        critical_threshold: Number.parseFloat(newIngredient.critical_threshold),
        unit_price: newIngredient.unit_price ? Number.parseFloat(newIngredient.unit_price) : null,
        supplier: newIngredient.supplier || null,
        expiry_date: null,
      })
      setIsEditIngredientOpen(false)
      setEditingItem(null)
      setNewIngredient({
        name: "",
        description: "",
        unit: "",
        current_stock: "",
        critical_threshold: "",
        unit_price: "",
        supplier: "",
        expiry_date: "",
      })
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de mise à jour")
    }
  }

  const handleDeleteIngredient = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet ingrédient ?")) {
      try {
        await apiService.deleteIngredient(id)
        loadData()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de suppression")
      }
    }
  }

  const handleEditStudent = (student: any) => {
    setEditingItem(student)
    setNewStudent({
      first_name: student.first_name,
      last_name: student.last_name,
      date_of_birth: student.date_of_birth,
      gender: student.gender,
      grade: student.grade,
      class_name: student.class_name,
      parent_name: student.parent_name,
      parent_phone: student.parent_phone,
      address: student.address || "",
      emergency_contact: student.emergency_contact || "",
      emergency_phone: student.emergency_phone || "",
      dietary_restrictions: student.dietary_restrictions || "",
      allergies: student.allergies || "",
    })
    setIsEditStudentOpen(true)
  }

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    try {
      await apiService.updateStudent(editingItem.id, newStudent)
      setIsEditStudentOpen(false)
      setEditingItem(null)
      setNewStudent({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        grade: "",
        class_name: "",
        parent_name: "",
        parent_phone: "",
        address: "",
        emergency_contact: "",
        emergency_phone: "",
        dietary_restrictions: "",
        allergies: "",
      })
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de mise à jour")
    }
  }

  const handleDeleteStudent = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet élève ?")) {
      try {
        await apiService.deleteStudent(id)
        loadData()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de suppression")
      }
    }
  }

  const handleEditAttendance = (attendance: any) => {
    setEditingItem(attendance)
    setNewAttendance({
      beneficiary_id: attendance.student_id.toString(),
      attendance_date: attendance.attendance_date,
      meal_type: attendance.meal_type,
      is_present: attendance.is_present,
      notes: attendance.notes || "",
    })
    setIsEditAttendanceOpen(true)
  }

  const handleUpdateAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    try {
      await apiService.updateAttendance(editingItem.id, {
        ...newAttendance,
        student_id: Number.parseInt(newAttendance.beneficiary_id),
      })
      setIsEditAttendanceOpen(false)
      setEditingItem(null)
      setNewAttendance({
        beneficiary_id: "",
        attendance_date: new Date().toISOString().split('T')[0],
        meal_type: "lunch",
        is_present: true,
        notes: "",
      })
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de mise à jour")
    }
  }

  const handleDeleteAttendance = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette présence ?")) {
      try {
        await apiService.deleteAttendance(id)
        loadData()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de suppression")
      }
    }
  }

  const handleEditRecipe = (recipe: any) => {
    setEditingItem(recipe)
    setNewRecipe({
      name: recipe.name,
      description: recipe.description || "",
      instructions: recipe.instructions,
      prep_time: recipe.prep_time?.toString() || "",
      cook_time: recipe.cook_time?.toString() || "",
      servings: recipe.servings?.toString() || "",
    })
    setIsEditRecipeOpen(true)
  }

  const handleUpdateRecipe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    try {
      await apiService.updateRecipe(editingItem.id, {
        ...newRecipe,
        prep_time: Number.parseInt(newRecipe.prep_time),
        cook_time: Number.parseInt(newRecipe.cook_time),
        servings: Number.parseInt(newRecipe.servings),
      })
      setIsEditRecipeOpen(false)
      setEditingItem(null)
      setNewRecipe({
        name: "",
        description: "",
        instructions: "",
        prep_time: "",
        cook_time: "",
        servings: "",
      })
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de mise à jour")
    }
  }

  const handleDeleteRecipe = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette recette ?")) {
      try {
        await apiService.deleteRecipe(id)
        loadData()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de suppression")
      }
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingrédients</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ingredients.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Élèves</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stockAlerts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Critique</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {ingredients.filter((i: any) => i.current_stock <= i.critical_threshold).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {stockAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
              Alertes de Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stockAlerts.slice(0, 5).map((alert: any) => (
                <Alert key={alert.id}>
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderIngredients = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gestion des Ingrédients</h3>
        <Dialog open={isCreateIngredientOpen} onOpenChange={setIsCreateIngredientOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel Ingrédient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un Ingrédient</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateIngredient} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newIngredient.description}
                  onChange={(e) => setNewIngredient({ ...newIngredient, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="unit">Unité</Label>
                  <Input
                    id="unit"
                    value={newIngredient.unit}
                    onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="critical_threshold">Seuil Critique</Label>
                  <Input
                    id="critical_threshold"
                    type="number"
                    value={newIngredient.critical_threshold}
                    onChange={(e) => setNewIngredient({ ...newIngredient, critical_threshold: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="current_stock">Stock Initial</Label>
                  <Input
                    id="current_stock"
                    type="number"
                    step="0.01"
                    value={newIngredient.current_stock}
                    onChange={(e) => setNewIngredient({ ...newIngredient, current_stock: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unit_price">Prix Unitaire</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    value={newIngredient.unit_price}
                    onChange={(e) => setNewIngredient({ ...newIngredient, unit_price: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="supplier">Fournisseur</Label>
                  <Input
                    id="supplier"
                    value={newIngredient.supplier}
                    onChange={(e) => setNewIngredient({ ...newIngredient, supplier: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Ajouter
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditIngredientOpen} onOpenChange={setIsEditIngredientOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier un Ingrédient</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateIngredient} className="space-y-4">
              <div>
                <Label htmlFor="edit_name">Nom</Label>
                <Input
                  id="edit_name"
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_description">Description</Label>
                <Input
                  id="edit_description"
                  value={newIngredient.description}
                  onChange={(e) => setNewIngredient({ ...newIngredient, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit_unit">Unité</Label>
                  <Input
                    id="edit_unit"
                    value={newIngredient.unit}
                    onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_critical_threshold">Seuil Critique</Label>
                  <Input
                    id="edit_critical_threshold"
                    type="number"
                    value={newIngredient.critical_threshold}
                    onChange={(e) => setNewIngredient({ ...newIngredient, critical_threshold: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_current_stock">Stock Actuel</Label>
                  <Input
                    id="edit_current_stock"
                    type="number"
                    step="0.01"
                    value={newIngredient.current_stock}
                    onChange={(e) => setNewIngredient({ ...newIngredient, current_stock: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_unit_price">Prix Unitaire</Label>
                  <Input
                    id="edit_unit_price"
                    type="number"
                    step="0.01"
                    value={newIngredient.unit_price}
                    onChange={(e) => setNewIngredient({ ...newIngredient, unit_price: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_supplier">Fournisseur</Label>
                  <Input
                    id="edit_supplier"
                    value={newIngredient.supplier}
                    onChange={(e) => setNewIngredient({ ...newIngredient, supplier: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Mettre à jour
              </Button>
            </form>
          </DialogContent>
        </Dialog>


      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Stock Actuel</TableHead>
                <TableHead>Seuil Critique</TableHead>
                <TableHead>Unité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ingredient: any) => (
                <TableRow key={ingredient.id}>
                  <TableCell>{ingredient.name}</TableCell>
                  <TableCell>{ingredient.current_stock || 0}</TableCell>
                  <TableCell>{ingredient.critical_threshold}</TableCell>
                  <TableCell>{ingredient.unit}</TableCell>
                  <TableCell>
                    <Badge
                      variant={ingredient.current_stock <= ingredient.critical_threshold ? "destructive" : "default"}
                    >
                      {ingredient.current_stock <= ingredient.critical_threshold ? "Critique" : "Normal"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditIngredient(ingredient)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteIngredient(ingredient.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const renderStudents = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gestion des Élèves</h3>
        <Dialog open={isCreateStudentOpen} onOpenChange={setIsCreateStudentOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel Élève
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un Élève</DialogTitle>
              <DialogDescription>Remplissez les informations de l'élève à ajouter.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">Prénom</Label>
                  <Input
                    id="first_name"
                    value={newStudent.first_name}
                    onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Nom</Label>
                  <Input
                    id="last_name"
                    value={newStudent.last_name}
                    onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date_of_birth">Date de naissance</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={newStudent.date_of_birth}
                    onChange={(e) => setNewStudent({ ...newStudent, date_of_birth: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Genre</Label>
                  <select
                    id="gender"
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Sélectionner</option>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                    <option value="Other">Autre</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="grade">Classe</Label>
                  <select
                    id="grade"
                    value={newStudent.grade}
                    onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Sélectionner</option>
                    <option value="PS">Petite Section</option>
                    <option value="MS">Moyenne Section</option>
                    <option value="GS">Grande Section</option>
                    <option value="CP">CP</option>
                    <option value="CE1">CE1</option>
                    <option value="CE2">CE2</option>
                    <option value="CM1">CM1</option>
                    <option value="CM2">CM2</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="class_name">Nom de classe</Label>
                  <Input
                    id="class_name"
                    value={newStudent.class_name}
                    onChange={(e) => setNewStudent({ ...newStudent, class_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="parent_name">Nom du parent</Label>
                  <Input
                    id="parent_name"
                    value={newStudent.parent_name}
                    onChange={(e) => setNewStudent({ ...newStudent, parent_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parent_phone">Téléphone parent</Label>
                  <Input
                    id="parent_phone"
                    value={newStudent.parent_phone}
                    onChange={(e) => setNewStudent({ ...newStudent, parent_phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={newStudent.address}
                    onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergency_contact">Contact d'urgence</Label>
                  <Input
                    id="emergency_contact"
                    value={newStudent.emergency_contact}
                    onChange={(e) => setNewStudent({ ...newStudent, emergency_contact: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_phone">Téléphone d'urgence</Label>
                  <Input
                    id="emergency_phone"
                    value={newStudent.emergency_phone}
                    onChange={(e) => setNewStudent({ ...newStudent, emergency_phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dietary_restrictions">Restrictions alimentaires</Label>
                <Input
                  id="dietary_restrictions"
                  value={newStudent.dietary_restrictions}
                  onChange={(e) => setNewStudent({ ...newStudent, dietary_restrictions: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="allergies">Allergies</Label>
                <Input
                  id="allergies"
                  value={newStudent.allergies}
                  onChange={(e) => setNewStudent({ ...newStudent, allergies: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                Ajouter
              </Button>
            </form>
          </DialogContent>
        </Dialog>


        <Dialog open={isEditStudentOpen} onOpenChange={setIsEditStudentOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier un Élève</DialogTitle>
              <DialogDescription>Modifiez les informations de l'élève.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_first_name">Prénom</Label>
                  <Input
                    id="edit_first_name"
                    value={newStudent.first_name}
                    onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_last_name">Nom</Label>
                  <Input
                    id="edit_last_name"
                    value={newStudent.last_name}
                    onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit_date_of_birth">Date de naissance</Label>
                  <Input
                    id="edit_date_of_birth"
                    type="date"
                    value={newStudent.date_of_birth}
                    onChange={(e) => setNewStudent({ ...newStudent, date_of_birth: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_gender">Genre</Label>
                  <select
                    id="edit_gender"
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Sélectionner</option>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                    <option value="Other">Autre</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit_grade">Classe</Label>
                  <select
                    id="edit_grade"
                    value={newStudent.grade}
                    onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Sélectionner</option>
                    <option value="PS">Petite Section</option>
                    <option value="MS">Moyenne Section</option>
                    <option value="GS">Grande Section</option>
                    <option value="CP">CP</option>
                    <option value="CE1">CE1</option>
                    <option value="CE2">CE2</option>
                    <option value="CM1">CM1</option>
                    <option value="CM2">CM2</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_class_name">Nom de classe</Label>
                  <Input
                    id="edit_class_name"
                    value={newStudent.class_name}
                    onChange={(e) => setNewStudent({ ...newStudent, class_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_parent_name">Nom du parent</Label>
                  <Input
                    id="edit_parent_name"
                    value={newStudent.parent_name}
                    onChange={(e) => setNewStudent({ ...newStudent, parent_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_parent_phone">Téléphone parent</Label>
                  <Input
                    id="edit_parent_phone"
                    value={newStudent.parent_phone}
                    onChange={(e) => setNewStudent({ ...newStudent, parent_phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_address">Adresse</Label>
                  <Input
                    id="edit_address"
                    value={newStudent.address}
                    onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_emergency_contact">Contact d'urgence</Label>
                  <Input
                    id="edit_emergency_contact"
                    value={newStudent.emergency_contact}
                    onChange={(e) => setNewStudent({ ...newStudent, emergency_contact: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_emergency_phone">Téléphone d'urgence</Label>
                  <Input
                    id="edit_emergency_phone"
                    value={newStudent.emergency_phone}
                    onChange={(e) => setNewStudent({ ...newStudent, emergency_phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit_dietary_restrictions">Restrictions alimentaires</Label>
                <Input
                  id="edit_dietary_restrictions"
                  value={newStudent.dietary_restrictions}
                  onChange={(e) => setNewStudent({ ...newStudent, dietary_restrictions: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_allergies">Allergies</Label>
                <Input
                  id="edit_allergies"
                  value={newStudent.allergies}
                  onChange={(e) => setNewStudent({ ...newStudent, allergies: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                Mettre à jour
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Allergies</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student: any) => (
                <TableRow key={student.id}>
                  <TableCell>
                    {student.first_name} {student.last_name}
                  </TableCell>
                  <TableCell>{student.grade} - {student.class_name}</TableCell>
                  <TableCell>{student.parent_name}</TableCell>
                  <TableCell>{student.allergies || "Aucune"}</TableCell>
                  <TableCell>
                    <Badge variant={student.is_active ? "default" : "secondary"}>
                      {student.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditStudent(student)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const renderStockMovements = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Gestion du Stock</h3>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Stock Actuel</TableHead>
                <TableHead>Seuil Critique</TableHead>
                <TableHead>Unité</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ingredient: any) => (
                <TableRow key={ingredient.id}>
                  <TableCell>{ingredient.name}</TableCell>
                  <TableCell>{ingredient.current_stock}</TableCell>
                  <TableCell>{ingredient.critical_threshold}</TableCell>
                  <TableCell>{ingredient.unit}</TableCell>
                  <TableCell>
                    <Badge
                      variant={ingredient.current_stock <= ingredient.critical_threshold ? "destructive" : "default"}
                    >
                      {ingredient.current_stock <= ingredient.critical_threshold ? "Critique" : "Normal"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const renderAlerts = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Alertes de Stock</h3>
      {stockAlerts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Aucune alerte active</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {stockAlerts.map((alert: any) => (
            <Alert key={alert.id} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex justify-between items-center">
                <span>{alert.message}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await apiService.resolveStockAlert(alert.id)
                      loadData()
                    } catch (err) {
                      setError("Erreur lors de la résolution de l'alerte")
                    }
                  }}
                >
                  Résoudre
                </Button>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  )

  const renderAttendances = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gestion des Présences</h3>
        <Dialog open={isRecordAttendanceOpen} onOpenChange={setIsRecordAttendanceOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Enregistrer Présence
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enregistrer une Présence</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRecordAttendance} className="space-y-4">
              <div>
                <Label htmlFor="beneficiary">Bénéficiaire</Label>
                <select
                  id="beneficiary"
                  value={newAttendance.beneficiary_id}
                  onChange={(e) => setNewAttendance({ ...newAttendance, beneficiary_id: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Sélectionner un bénéficiaire</option>
                  {students.map((student: any) => (
                    <option key={student.id} value={student.id}>
                      {student.first_name} {student.last_name} - {student.grade} {student.class_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="attendance_date">Date</Label>
                  <Input
                    id="attendance_date"
                    type="date"
                    value={newAttendance.attendance_date}
                    onChange={(e) => setNewAttendance({ ...newAttendance, attendance_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="meal_type">Type de Repas</Label>
                  <select
                    id="meal_type"
                    value={newAttendance.meal_type}
                    onChange={(e) => setNewAttendance({ ...newAttendance, meal_type: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="breakfast">Petit-déjeuner</option>
                    <option value="lunch">Déjeuner</option>
                    <option value="dinner">Dîner</option>
                    <option value="snack">Collation</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_present"
                  checked={newAttendance.is_present}
                  onChange={(e) => setNewAttendance({ ...newAttendance, is_present: e.target.checked })}
                />
                <Label htmlFor="is_present">Présent</Label>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={newAttendance.notes}
                  onChange={(e) => setNewAttendance({ ...newAttendance, notes: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                Enregistrer
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditAttendanceOpen} onOpenChange={setIsEditAttendanceOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier une Présence</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateAttendance} className="space-y-4">
              <div>
                <Label htmlFor="edit_beneficiary">Bénéficiaire</Label>
                <select
                  id="edit_beneficiary"
                  value={newAttendance.beneficiary_id}
                  onChange={(e) => setNewAttendance({ ...newAttendance, beneficiary_id: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Sélectionner un bénéficiaire</option>
                  {students.map((student: any) => (
                    <option key={student.id} value={student.id}>
                      {student.first_name} {student.last_name} - {student.grade} {student.class_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_attendance_date">Date</Label>
                  <Input
                    id="edit_attendance_date"
                    type="date"
                    value={newAttendance.attendance_date}
                    onChange={(e) => setNewAttendance({ ...newAttendance, attendance_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_meal_type">Type de Repas</Label>
                  <select
                    id="edit_meal_type"
                    value={newAttendance.meal_type}
                    onChange={(e) => setNewAttendance({ ...newAttendance, meal_type: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="breakfast">Petit-déjeuner</option>
                    <option value="lunch">Déjeuner</option>
                    <option value="dinner">Dîner</option>
                    <option value="snack">Collation</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_is_present"
                  checked={newAttendance.is_present}
                  onChange={(e) => setNewAttendance({ ...newAttendance, is_present: e.target.checked })}
                />
                <Label htmlFor="edit_is_present">Présent</Label>
              </div>
              <div>
                <Label htmlFor="edit_notes">Notes</Label>
                <Input
                  id="edit_notes"
                  value={newAttendance.notes}
                  onChange={(e) => setNewAttendance({ ...newAttendance, notes: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                Mettre à jour
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 mb-4">
        <div>
          <Label htmlFor="filter_date">Date</Label>
          <Input
            id="filter_date"
            type="date"
            value={attendanceFilters.date}
            onChange={(e) => setAttendanceFilters({ ...attendanceFilters, date: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="filter_meal">Type de Repas</Label>
          <select
            id="filter_meal"
            value={attendanceFilters.meal_type}
            onChange={(e) => setAttendanceFilters({ ...attendanceFilters, meal_type: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="">Tous</option>
            <option value="breakfast">Petit-déjeuner</option>
            <option value="lunch">Déjeuner</option>
            <option value="dinner">Dîner</option>
            <option value="snack">Collation</option>
          </select>
        </div>
        <Button onClick={handleAttendanceFilterChange} className="mt-6">
          Filtrer
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Élève</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Repas</TableHead>
                <TableHead>Présent</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Enregistré par</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendances.map((attendance: any) => (
                <TableRow key={attendance.id}>
                  <TableCell>{attendance.first_name} {attendance.last_name}</TableCell>
                  <TableCell>{attendance.grade} {attendance.class_name}</TableCell>
                  <TableCell>{new Date(attendance.attendance_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {attendance.meal_type === "breakfast" ? "Petit-déjeuner" :
                       attendance.meal_type === "lunch" ? "Déjeuner" :
                       attendance.meal_type === "dinner" ? "Dîner" :
                       attendance.meal_type === "snack" ? "Collation" : attendance.meal_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={attendance.is_present ? "default" : "secondary"}>
                      {attendance.is_present ? "Oui" : "Non"}
                    </Badge>
                  </TableCell>
                  <TableCell>{attendance.notes || "N/A"}</TableCell>
                  <TableCell>{attendance.recorded_by_name}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAttendance(attendance)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteAttendance(attendance.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const renderRecipes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gestion des Recettes</h3>
        <Dialog open={isCreateRecipeOpen} onOpenChange={setIsCreateRecipeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Recette
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une Recette</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateRecipe} className="space-y-4">
              <div>
                <Label htmlFor="recipe_name">Nom</Label>
                <Input
                  id="recipe_name"
                  value={newRecipe.name}
                  onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="recipe_description">Description</Label>
                <Input
                  id="recipe_description"
                  value={newRecipe.description}
                  onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="prep_time">Temps de préparation (min)</Label>
                  <Input
                    id="prep_time"
                    type="number"
                    value={newRecipe.prep_time}
                    onChange={(e) => setNewRecipe({ ...newRecipe, prep_time: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cook_time">Temps de cuisson (min)</Label>
                  <Input
                    id="cook_time"
                    type="number"
                    value={newRecipe.cook_time}
                    onChange={(e) => setNewRecipe({ ...newRecipe, cook_time: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="servings">Portions</Label>
                  <Input
                    id="servings"
                    type="number"
                    value={newRecipe.servings}
                    onChange={(e) => setNewRecipe({ ...newRecipe, servings: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <textarea
                  id="instructions"
                  value={newRecipe.instructions}
                  onChange={(e) => setNewRecipe({ ...newRecipe, instructions: e.target.value })}
                  className="w-full p-2 border rounded"
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Ajouter
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Temps Total</TableHead>
                <TableHead>Portions</TableHead>
                <TableHead>Créé par</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes.map((recipe: any) => (
                <TableRow key={recipe.id}>
                  <TableCell>{recipe.name}</TableCell>
                  <TableCell>{recipe.description || "N/A"}</TableCell>
                  <TableCell>{(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</TableCell>
                  <TableCell>{recipe.servings}</TableCell>
                  <TableCell>{recipe.created_by_name || "N/A"}</TableCell>
                  <TableCell>{new Date(recipe.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditRecipe(recipe)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteRecipe(recipe.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <>
      {(() => {
        switch (activeSection) {
          case "overview":
            return renderOverview()
          case "ingredients":
            return renderIngredients()
          case "stock":
            return renderStockMovements()
          case "recipes":
            return renderRecipes()
          case "students":
            return renderStudents()
          case "attendances":
            return renderAttendances()
          case "alerts":
            return renderAlerts()
          default:
            return renderOverview()
        }
      })()}

      <Dialog open={isEditRecipeOpen} onOpenChange={setIsEditRecipeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier une Recette</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateRecipe} className="space-y-4">
            <div>
              <Label htmlFor="edit_recipe_name">Nom</Label>
              <Input
                id="edit_recipe_name"
                value={newRecipe.name}
                onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_recipe_description">Description</Label>
              <Input
                id="edit_recipe_description"
                value={newRecipe.description}
                onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit_prep_time">Temps de préparation (min)</Label>
                <Input
                  id="edit_prep_time"
                  type="number"
                  value={newRecipe.prep_time}
                  onChange={(e) => setNewRecipe({ ...newRecipe, prep_time: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_cook_time">Temps de cuisson (min)</Label>
                <Input
                  id="edit_cook_time"
                  type="number"
                  value={newRecipe.cook_time}
                  onChange={(e) => setNewRecipe({ ...newRecipe, cook_time: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_servings">Portions</Label>
                <Input
                  id="edit_servings"
                  type="number"
                  value={newRecipe.servings}
                  onChange={(e) => setNewRecipe({ ...newRecipe, servings: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_instructions">Instructions</Label>
              <textarea
                id="edit_instructions"
                value={newRecipe.instructions}
                onChange={(e) => setNewRecipe({ ...newRecipe, instructions: e.target.value })}
                className="w-full p-2 border rounded"
                rows={4}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Mettre à jour
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
