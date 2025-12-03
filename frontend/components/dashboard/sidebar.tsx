"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Users, Package, TrendingUp, UserCheck, AlertTriangle, BarChart3, Settings, ChefHat } from "lucide-react"

interface SidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  userRole: string
}

export function Sidebar({ activeSection, setActiveSection, userRole }: SidebarProps) {
  const getMenuItems = () => {
    const baseItems = [{ id: "overview", label: "Vue d'ensemble", icon: BarChart3 }]

    switch (userRole) {
      case "Administrateur":
        return [
          ...baseItems,
          { id: "users", label: "Utilisateurs", icon: Users },
          { id: "roles", label: "Rôles & Permissions", icon: Settings },
          { id: "reports", label: "Rapports", icon: BarChart3 },
        ]

      case "Responsable Cantine":
        return [
          ...baseItems,
          { id: "ingredients", label: "Ingrédients", icon: Package },
          { id: "stock", label: "Gestion Stock", icon: TrendingUp },
          { id: "recipes", label: "Recettes", icon: ChefHat },
          { id: "students", label: "Élèves", icon: Users },
          { id: "attendances", label: "Présences", icon: UserCheck },
          { id: "alerts", label: "Alertes Stock", icon: AlertTriangle },
        ]

      case "Agent de Saisie":
        return [
          ...baseItems,
          { id: "stock-entry", label: "Entrée/Sortie Stock", icon: TrendingUp },
          { id: "attendance-entry", label: "Saisie Présences", icon: UserCheck },
          { id: "meal-service", label: "Service Repas", icon: ChefHat },
          { id: "history", label: "Historiques", icon: BarChart3 },
        ]

      default:
        return baseItems
    }
  }

  const menuItems = getMenuItems()

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2">
          <ChefHat className="h-8 w-8 text-orange-600" />
          <h1 className="text-xl font-bold text-gray-900">Gestion Cantine</h1>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                activeSection === item.id && "bg-orange-100 text-orange-900 hover:bg-orange-200",
              )}
              onClick={() => setActiveSection(item.id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          )
        })}
      </nav>
    </div>
  )
}
