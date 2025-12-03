"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiService } from "@/services/api"
import { TrendingUp, UserCheck, Plus } from "lucide-react"

interface AgentDashboardProps {
  activeSection: string
}

export function AgentDashboard({ activeSection }: AgentDashboardProps) {
  const [ingredients, setIngredients] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [stockMovements, setStockMovements] = useState<any[]>([])
  const [attendances, setAttendances] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isStockMovementOpen, setIsStockMovementOpen] = useState(false)
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false)

  const [newStockMovement, setNewStockMovement] = useState({
    ingredient_id: "",
    movement_type: "",
    quantity: "",
    unit_price: "",
    reason: "",
    reference_number: "",
    notes: "",
  })

  const [newAttendance, setNewAttendance] = useState({
    student_id: "",
    attendance_date: new Date().toISOString().split("T")[0],
    meal_type: "",
    is_present: true,
    notes: "",
  })

  useEffect(() => {
    loadData()
  }, [activeSection])

  const loadData = async () => {
    try {
      setLoading(true)
      if (activeSection === "stock-entry" || activeSection === "overview") {
        const ingredientsData = await apiService.getIngredients()
        setIngredients(ingredientsData)
        const movementsData = await apiService.getStockMovements()
        setStockMovements(movementsData)
      }
      if (activeSection === "attendance-entry" || activeSection === "meal-service" || activeSection === "overview") {
        const studentsData = await apiService.getStudents()
        setStudents(studentsData)
        const attendancesData = await apiService.getAttendances()
        setAttendances(attendancesData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }

  const handleStockMovement = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiService.createStockMovement({
        ...newStockMovement,
        quantity: Number.parseFloat(newStockMovement.quantity),
        unit_price: newStockMovement.unit_price ? Number.parseFloat(newStockMovement.unit_price) : null,
      })
      setIsStockMovementOpen(false)
      setNewStockMovement({
        ingredient_id: "",
        movement_type: "",
        quantity: "",
        unit_price: "",
        reason: "",
        reference_number: "",
        notes: "",
      })
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'enregistrement")
    }
  }

  const handleAttendance = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation côté client
    if (!newAttendance.student_id || !newAttendance.meal_type) {
      setError("Veuillez sélectionner un élève et un type de repas")
      return
    }

    try {
      await apiService.createAttendance(newAttendance)
      setIsAttendanceOpen(false)
      setNewAttendance({
        student_id: "",
        attendance_date: new Date().toISOString().split("T")[0],
        meal_type: "",
        is_present: true,
        notes: "",
      })
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'enregistrement")
    }
  }

  const handleEditAttendance = (attendance: any) => {
    setNewAttendance({
      student_id: attendance.student_id.toString(),
      attendance_date: attendance.attendance_date,
      meal_type: attendance.meal_type,
      is_present: attendance.is_present,
      notes: attendance.notes || "",
    })
    setIsAttendanceOpen(true)
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

  const handleViewStockMovementDetails = (movement: any) => {
    const details = `
Mouvement de Stock - Détails
---------------------------
Ingrédient: ${movement.ingredient_name}
Type: ${movement.movement_type === "IN" ? "Entrée" : "Sortie"}
Quantité: ${movement.quantity} ${movement.unit}
Prix unitaire: ${movement.unit_price || "N/A"} €
Coût total: ${movement.total_cost || "N/A"} €
Raison: ${movement.reason}
Référence: ${movement.reference_number || "N/A"}
Notes: ${movement.notes || "Aucune"}
Enregistré par: ${movement.created_by_name}
Date: ${new Date(movement.created_at).toLocaleString()}
    `
    alert(details)
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mouvements Aujourd'hui</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                stockMovements.filter((m: any) => new Date(m.created_at).toDateString() === new Date().toDateString())
                  .length
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Présences Aujourd'hui</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                attendances.filter(
                  (a: any) => new Date(a.attendance_date).toDateString() === new Date().toDateString() && a.is_present,
                ).length
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrées Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stockMovements.filter((m: any) => m.movement_type === "IN").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sorties Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stockMovements.filter((m: any) => m.movement_type === "OUT").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Derniers Mouvements de Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stockMovements.slice(0, 5).map((movement: any) => (
                <div key={movement.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium">{movement.ingredient_name}</p>
                    <p className="text-sm text-gray-600">{movement.reason}</p>
                  </div>
                  <Badge variant={movement.movement_type === "IN" ? "default" : "destructive"}>
                    {movement.movement_type === "IN" ? "+" : "-"}
                    {movement.quantity} {movement.unit}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Présences Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attendances.slice(0, 5).map((attendance: any) => (
                <div key={attendance.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium">
                      {attendance.first_name} {attendance.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{attendance.meal_type}</p>
                  </div>
                  <Badge variant={attendance.is_present ? "default" : "secondary"}>
                    {attendance.is_present ? "Présent" : "Absent"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderStockEntry = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Entrée/Sortie de Stock</h3>
        <Dialog open={isStockMovementOpen} onOpenChange={setIsStockMovementOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Mouvement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enregistrer un Mouvement de Stock</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleStockMovement} className="space-y-4">
              <div>
                <Label htmlFor="ingredient">Ingrédient</Label>
                <Select
                  value={newStockMovement.ingredient_id}
                  onValueChange={(value) => setNewStockMovement({ ...newStockMovement, ingredient_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un ingrédient" />
                  </SelectTrigger>
                  <SelectContent>
                    {ingredients.map((ingredient: any) => (
                      <SelectItem key={ingredient.id} value={ingredient.id.toString()}>
                        {ingredient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="movement_type">Type de Mouvement</Label>
                <Select
                  value={newStockMovement.movement_type}
                  onValueChange={(value) => setNewStockMovement({ ...newStockMovement, movement_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">Entrée</SelectItem>
                    <SelectItem value="OUT">Sortie</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantité</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newStockMovement.quantity}
                    onChange={(e) => setNewStockMovement({ ...newStockMovement, quantity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unit_price">Prix Unitaire</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    value={newStockMovement.unit_price}
                    onChange={(e) => setNewStockMovement({ ...newStockMovement, unit_price: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reason">Raison</Label>
                <Input
                  id="reason"
                  value={newStockMovement.reason}
                  onChange={(e) => setNewStockMovement({ ...newStockMovement, reason: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="reference_number">Numéro de Référence</Label>
                <Input
                  id="reference_number"
                  value={newStockMovement.reference_number}
                  onChange={(e) => setNewStockMovement({ ...newStockMovement, reference_number: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={newStockMovement.notes}
                  onChange={(e) => setNewStockMovement({ ...newStockMovement, notes: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full">
                Enregistrer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Ingrédient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Raison</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockMovements.slice(0, 20).map((movement: any) => (
                <TableRow key={movement.id}>
                  <TableCell>{new Date(movement.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{movement.ingredient_name}</TableCell>
                  <TableCell>
                    <Badge variant={movement.movement_type === "IN" ? "default" : "destructive"}>
                      {movement.movement_type === "IN" ? "Entrée" : "Sortie"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {movement.quantity} {movement.unit}
                  </TableCell>
                  <TableCell>{movement.reason}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewStockMovementDetails(movement)}
                    >
                      Voir détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const renderAttendanceEntry = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Saisie des Présences</h3>
        <Dialog open={isAttendanceOpen} onOpenChange={setIsAttendanceOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Présence
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enregistrer une Présence</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAttendance} className="space-y-4">
              <div>
                <Label htmlFor="student">Élève</Label>
                <Select
                  value={newAttendance.student_id}
                  onValueChange={(value) => setNewAttendance({ ...newAttendance, student_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un élève" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student: any) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.first_name} {student.last_name} - {student.grade} {student.class_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <Label htmlFor="meal_type">Type de repas</Label>
                  <Select
                    value={newAttendance.meal_type}
                    onValueChange={(value) => setNewAttendance({ ...newAttendance, meal_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Petit-déjeuner</SelectItem>
                      <SelectItem value="lunch">Déjeuner</SelectItem>
                      <SelectItem value="dinner">Dîner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Présence</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="is_present"
                      checked={newAttendance.is_present === true}
                      onChange={() => setNewAttendance({ ...newAttendance, is_present: true })}
                    />
                    <span>Présent</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="is_present"
                      checked={newAttendance.is_present === false}
                      onChange={() => setNewAttendance({ ...newAttendance, is_present: false })}
                    />
                    <span>Absent</span>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={newAttendance.notes}
                  onChange={(e) => setNewAttendance({ ...newAttendance, notes: e.target.value })}
                  placeholder="Notes optionnelles..."
                />
              </div>

              <Button type="submit" className="w-full">
                Enregistrer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Élève</TableHead>
                <TableHead>Repas</TableHead>
                <TableHead>Présence</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendances.slice(0, 20).map((attendance: any) => (
                <TableRow key={attendance.id}>
                  <TableCell>{new Date(attendance.attendance_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {attendance.first_name} {attendance.last_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {attendance.meal_type === "breakfast" && "Petit-déjeuner"}
                      {attendance.meal_type === "lunch" && "Déjeuner"}
                      {attendance.meal_type === "dinner" && "Dîner"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={attendance.is_present ? "default" : "secondary"}>
                      {attendance.is_present ? "Présent" : "Absent"}
                    </Badge>
                  </TableCell>
                  <TableCell>{attendance.notes || "—"}</TableCell>
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

  const renderMealService = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Service des Repas</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Petit-déjeuner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendances.filter((a: any) => a.meal_type === "breakfast" && a.is_present &&
                new Date(a.attendance_date).toDateString() === new Date().toDateString()).length}
            </div>
            <p className="text-sm text-gray-600">présents aujourd'hui</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Déjeuner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendances.filter((a: any) => a.meal_type === "lunch" && a.is_present &&
                new Date(a.attendance_date).toDateString() === new Date().toDateString()).length}
            </div>
            <p className="text-sm text-gray-600">présents aujourd'hui</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Dîner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendances.filter((a: any) => a.meal_type === "dinner" && a.is_present &&
                new Date(a.attendance_date).toDateString() === new Date().toDateString()).length}
            </div>
            <p className="text-sm text-gray-600">présents aujourd'hui</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Présences du jour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {attendances
              .filter((a: any) => new Date(a.attendance_date).toDateString() === new Date().toDateString())
              .map((attendance: any) => (
                <div key={attendance.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium">
                      {attendance.first_name} {attendance.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{attendance.meal_type}</p>
                  </div>
                  <Badge variant={attendance.is_present ? "default" : "secondary"}>
                    {attendance.is_present ? "Présent" : "Absent"}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderHistory = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Historiques</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mouvements de Stock Récents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stockMovements.slice(0, 10).map((movement: any) => (
                <div key={movement.id} className="flex justify-between items-center p-2 border rounded text-sm">
                  <div>
                    <p className="font-medium">{movement.ingredient_name}</p>
                    <p className="text-gray-600">{new Date(movement.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={movement.movement_type === "IN" ? "default" : "destructive"}>
                    {movement.movement_type === "IN" ? "+" : "-"}{movement.quantity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Présences Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attendances.slice(0, 10).map((attendance: any) => (
                <div key={attendance.id} className="flex justify-between items-center p-2 border rounded text-sm">
                  <div>
                    <p className="font-medium">{attendance.first_name} {attendance.last_name}</p>
                    <p className="text-gray-600">{new Date(attendance.attendance_date).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={attendance.is_present ? "default" : "secondary"}>
                    {attendance.is_present ? "Présent" : "Absent"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  switch (activeSection) {
    case "overview":
      return renderOverview()
    case "stock-entry":
      return renderStockEntry()
    case "attendance-entry":
      return renderAttendanceEntry()
    case "meal-service":
      return renderMealService()
    case "history":
      return renderHistory()
    default:
      return renderOverview()
  }
}
