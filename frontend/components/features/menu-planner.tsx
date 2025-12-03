"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChefHat, Users, AlertTriangle, TrendingUp } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MenuPlan {
  id: string
  date: string
  mealType: "breakfast" | "lunch" | "dinner" | "snack"
  recipeName: string
  estimatedPortions: number
  nutritionalInfo: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  allergensPresent: string[]
  cost: number
  status: "planned" | "approved" | "prepared" | "served"
}

export function MenuPlanner() {
  const [menuPlans, setMenuPlans] = useState<MenuPlan[]>([])
  const [selectedWeek, setSelectedWeek] = useState(new Date())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Simulation de données
  useEffect(() => {
    const mockMenuPlans: MenuPlan[] = [
      {
        id: "1",
        date: "2024-01-15",
        mealType: "lunch",
        recipeName: "Riz au poulet et légumes",
        estimatedPortions: 150,
        nutritionalInfo: { calories: 450, protein: 25, carbs: 55, fat: 12 },
        allergensPresent: ["gluten"],
        cost: 3.5,
        status: "planned",
      },
      {
        id: "2",
        date: "2024-01-15",
        mealType: "dinner",
        recipeName: "Soupe de lentilles",
        estimatedPortions: 120,
        nutritionalInfo: { calories: 280, protein: 18, carbs: 45, fat: 3 },
        allergensPresent: [],
        cost: 2.2,
        status: "approved",
      },
    ]
    setMenuPlans(mockMenuPlans)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned":
        return "bg-blue-100 text-blue-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "prepared":
        return "bg-orange-100 text-orange-800"
      case "served":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "🌅"
      case "lunch":
        return "🍽️"
      case "dinner":
        return "🌙"
      case "snack":
        return "🍪"
      default:
        return "🍽️"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Planificateur de Menus</h2>
          <p className="text-gray-600">Planifiez et gérez les menus de la semaine</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <ChefHat className="w-4 h-4 mr-2" />
              Nouveau Menu
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau menu</DialogTitle>
              <DialogDescription>
                Planifiez un nouveau repas avec les détails nutritionnels et les coûts
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input type="date" id="date" />
              </div>
              <div>
                <Label htmlFor="mealType">Type de repas</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Petit-déjeuner</SelectItem>
                    <SelectItem value="lunch">Déjeuner</SelectItem>
                    <SelectItem value="dinner">Dîner</SelectItem>
                    <SelectItem value="snack">Collation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="recipeName">Nom de la recette</Label>
                <Input id="recipeName" placeholder="Ex: Riz au poulet et légumes" />
              </div>
              <div>
                <Label htmlFor="portions">Portions estimées</Label>
                <Input type="number" id="portions" placeholder="150" />
              </div>
              <div>
                <Label htmlFor="cost">Coût par portion (€)</Label>
                <Input type="number" step="0.01" id="cost" placeholder="3.50" />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button className="bg-orange-600 hover:bg-orange-700">Créer le menu</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques de la semaine */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Menus planifiés</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Portions totales</p>
                <p className="text-2xl font-bold">1,850</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Coût moyen</p>
                <p className="text-2xl font-bold">€2.85</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Alertes allergènes</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Planning des menus */}
      <Card>
        <CardHeader>
          <CardTitle>Planning de la semaine</CardTitle>
          <CardDescription>Semaine du 15 au 21 Janvier 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {menuPlans.map((menu) => (
              <div key={menu.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getMealTypeIcon(menu.mealType)}</div>
                  <div>
                    <h3 className="font-semibold">{menu.recipeName}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(menu.date).toLocaleDateString("fr-FR")} • {menu.estimatedPortions} portions
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {menu.nutritionalInfo.calories} cal • €{menu.cost}
                      </span>
                      {menu.allergensPresent.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Allergènes
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(menu.status)}>
                    {menu.status === "planned" && "Planifié"}
                    {menu.status === "approved" && "Approuvé"}
                    {menu.status === "prepared" && "Préparé"}
                    {menu.status === "served" && "Servi"}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Modifier
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
