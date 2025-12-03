"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Users, DollarSign, Package, Clock, Download, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AnalyticsData {
  totalBeneficiaries: number
  dailyAttendance: number
  weeklyTrend: number
  totalCost: number
  costPerMeal: number
  stockValue: number
  wastePercentage: number
  popularMeals: Array<{ name: string; count: number }>
  attendanceByDay: Array<{ day: string; count: number }>
  costTrend: Array<{ month: string; cost: number }>
}

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState("week")
  const [selectedMetric, setSelectedMetric] = useState("attendance")

  useEffect(() => {
    // Simulation de données analytiques
    const mockData: AnalyticsData = {
      totalBeneficiaries: 245,
      dailyAttendance: 189,
      weeklyTrend: 12.5,
      totalCost: 1850.75,
      costPerMeal: 2.85,
      stockValue: 4250.0,
      wastePercentage: 8.2,
      popularMeals: [
        { name: "Riz au poulet", count: 156 },
        { name: "Couscous aux légumes", count: 142 },
        { name: "Pâtes bolognaise", count: 138 },
        { name: "Soupe de lentilles", count: 125 },
      ],
      attendanceByDay: [
        { day: "Lun", count: 195 },
        { day: "Mar", count: 187 },
        { day: "Mer", count: 203 },
        { day: "Jeu", count: 178 },
        { day: "Ven", count: 165 },
        { day: "Sam", count: 145 },
        { day: "Dim", count: 132 },
      ],
      costTrend: [
        { month: "Oct", cost: 1650 },
        { month: "Nov", cost: 1720 },
        { month: "Déc", cost: 1890 },
        { month: "Jan", cost: 1850 },
      ],
    }
    setAnalyticsData(mockData)
  }, [selectedPeriod])

  if (!analyticsData) {
    return <div>Chargement des données analytiques...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tableau de Bord Analytique</h2>
          <p className="text-gray-600">Analyses et statistiques détaillées de la cantine</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Jour</SelectItem>
              <SelectItem value="week">Semaine</SelectItem>
              <SelectItem value="month">Mois</SelectItem>
              <SelectItem value="year">Année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Présence Aujourd'hui</p>
                <p className="text-2xl font-bold">{analyticsData.dailyAttendance}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+{analyticsData.weeklyTrend}%</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Coût par Repas</p>
                <p className="text-2xl font-bold">€{analyticsData.costPerMeal}</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                  <span className="text-sm text-red-600">-2.1%</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valeur du Stock</p>
                <p className="text-2xl font-bold">€{analyticsData.stockValue.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <Package className="w-4 h-4 text-blue-600 mr-1" />
                  <span className="text-sm text-blue-600">Stable</span>
                </div>
              </div>
              <Package className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gaspillage</p>
                <p className="text-2xl font-bold">{analyticsData.wastePercentage}%</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">-1.3%</span>
                </div>
              </div>
              <Clock className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Présence par jour */}
        <Card>
          <CardHeader>
            <CardTitle>Présence par Jour</CardTitle>
            <CardDescription>Évolution de la fréquentation cette semaine</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.attendanceByDay.map((day, index) => (
                <div key={day.day} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{day.day}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: `${(day.count / 220) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{day.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Repas populaires */}
        <Card>
          <CardHeader>
            <CardTitle>Repas les Plus Populaires</CardTitle>
            <CardDescription>Classement des plats préférés ce mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.popularMeals.map((meal, index) => (
                <div key={meal.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <span className="text-sm font-medium">{meal.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(meal.count / 160) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{meal.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Évolution des coûts */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des Coûts</CardTitle>
          <CardDescription>Tendance des dépenses sur les 4 derniers mois</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end space-x-4 h-32">
            {analyticsData.costTrend.map((month, index) => (
              <div key={month.month} className="flex flex-col items-center space-y-2">
                <div
                  className="bg-orange-600 rounded-t w-12"
                  style={{ height: `${(month.cost / 2000) * 100}px` }}
                ></div>
                <span className="text-xs text-gray-600">{month.month}</span>
                <span className="text-xs font-medium">€{month.cost}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommandations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommandations Intelligentes</CardTitle>
          <CardDescription>Suggestions basées sur l'analyse des données</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Optimisation des portions</p>
                <p className="text-sm text-blue-700">
                  Réduire les portions de 5% pourrait diminuer le gaspillage de 15% sans affecter la satisfaction
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Économies potentielles</p>
                <p className="text-sm text-green-700">
                  Négocier avec les fournisseurs pourrait réduire les coûts de 8% (€148/mois)
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
              <Users className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium text-orange-900">Planification des menus</p>
                <p className="text-sm text-orange-700">
                  Programmer plus de "Riz au poulet" les lundis pourrait augmenter la satisfaction de 12%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
