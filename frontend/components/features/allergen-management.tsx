"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Shield, Users, Heart } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"

interface AllergenProfile {
  id: string
  beneficiaryName: string
  allergies: string[]
  dietaryRestrictions: string[]
  severity: "mild" | "moderate" | "severe"
  emergencyContact: string
  lastUpdated: string
}

interface AllergenAlert {
  id: string
  menuItem: string
  allergen: string
  affectedBeneficiaries: number
  severity: "low" | "medium" | "high"
  date: string
}

export function AllergenManagement() {
  const [allergenProfiles, setAllergenProfiles] = useState<AllergenProfile[]>([])
  const [allergenAlerts, setAllergenAlerts] = useState<AllergenAlert[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const commonAllergens = [
    "Gluten",
    "Lactose",
    "Œufs",
    "Arachides",
    "Fruits à coque",
    "Poisson",
    "Crustacés",
    "Soja",
    "Céleri",
    "Moutarde",
    "Sésame",
  ]

  const dietaryOptions = [
    "Végétarien",
    "Végétalien",
    "Halal",
    "Casher",
    "Sans sucre",
    "Hypocalorique",
    "Riche en protéines",
    "Sans sel",
  ]

  useEffect(() => {
    // Simulation de données
    const mockProfiles: AllergenProfile[] = [
      {
        id: "1",
        beneficiaryName: "Marie Dubois",
        allergies: ["Arachides", "Fruits à coque"],
        dietaryRestrictions: ["Végétarien"],
        severity: "severe",
        emergencyContact: "06 12 34 56 78",
        lastUpdated: "2024-01-10",
      },
      {
        id: "2",
        beneficiaryName: "Ahmed Hassan",
        allergies: ["Lactose"],
        dietaryRestrictions: ["Halal"],
        severity: "moderate",
        emergencyContact: "06 98 76 54 32",
        lastUpdated: "2024-01-08",
      },
    ]

    const mockAlerts: AllergenAlert[] = [
      {
        id: "1",
        menuItem: "Salade de noix",
        allergen: "Fruits à coque",
        affectedBeneficiaries: 3,
        severity: "high",
        date: "2024-01-15",
      },
      {
        id: "2",
        menuItem: "Sauce béchamel",
        allergen: "Lactose",
        affectedBeneficiaries: 5,
        severity: "medium",
        date: "2024-01-16",
      },
    ]

    setAllergenProfiles(mockProfiles)
    setAllergenAlerts(mockAlerts)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild":
        return "bg-yellow-100 text-yellow-800"
      case "moderate":
        return "bg-orange-100 text-orange-800"
      case "severe":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "border-yellow-200 bg-yellow-50"
      case "medium":
        return "border-orange-200 bg-orange-50"
      case "high":
        return "border-red-200 bg-red-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Allergènes</h2>
          <p className="text-gray-600">Gérez les allergies et régimes alimentaires des bénéficiaires</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Shield className="w-4 h-4 mr-2" />
              Nouveau Profil
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un profil allergène</DialogTitle>
              <DialogDescription>
                Enregistrez les allergies et restrictions alimentaires d'un bénéficiaire
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="beneficiaryName">Nom du bénéficiaire</Label>
                <Input id="beneficiaryName" placeholder="Ex: Marie Dubois" />
              </div>

              <div>
                <Label>Allergies alimentaires</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {commonAllergens.map((allergen) => (
                    <div key={allergen} className="flex items-center space-x-2">
                      <Checkbox id={allergen} />
                      <Label htmlFor={allergen} className="text-sm">
                        {allergen}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Restrictions alimentaires</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {dietaryOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox id={option} />
                      <Label htmlFor={option} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="emergencyContact">Contact d'urgence</Label>
                <Input id="emergencyContact" placeholder="06 12 34 56 78" />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button className="bg-orange-600 hover:bg-orange-700">Créer le profil</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Profils enregistrés</p>
                <p className="text-2xl font-bold">{allergenProfiles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Allergies sévères</p>
                <p className="text-2xl font-bold">{allergenProfiles.filter((p) => p.severity === "severe").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Régimes spéciaux</p>
                <p className="text-2xl font-bold">
                  {allergenProfiles.reduce((acc, p) => acc + p.dietaryRestrictions.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Alertes actives</p>
                <p className="text-2xl font-bold">{allergenAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes actives */}
      {allergenAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Alertes Allergènes Actives</span>
            </CardTitle>
            <CardDescription>Menus contenant des allergènes affectant des bénéficiaires</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allergenAlerts.map((alert) => (
                <Alert key={alert.id} className={getAlertSeverityColor(alert.severity)}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <strong>{alert.menuItem}</strong> contient <strong>{alert.allergen}</strong>
                        <br />
                        <span className="text-sm text-gray-600">
                          {alert.affectedBeneficiaries} bénéficiaire(s) affecté(s) •{" "}
                          {new Date(alert.date).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        Résoudre
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profils allergènes */}
      <Card>
        <CardHeader>
          <CardTitle>Profils Allergènes</CardTitle>
          <CardDescription>Liste des bénéficiaires avec allergies et restrictions alimentaires</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allergenProfiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{profile.beneficiaryName}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getSeverityColor(profile.severity)}>
                        {profile.severity === "mild" && "Léger"}
                        {profile.severity === "moderate" && "Modéré"}
                        {profile.severity === "severe" && "Sévère"}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Mis à jour le {new Date(profile.lastUpdated).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {profile.allergies.map((allergy) => (
                        <Badge key={allergy} variant="outline" className="text-xs bg-red-50 text-red-700">
                          {allergy}
                        </Badge>
                      ))}
                      {profile.dietaryRestrictions.map((restriction) => (
                        <Badge key={restriction} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          {restriction}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm">
                    Urgence
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
