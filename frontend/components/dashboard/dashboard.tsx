"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { AdminDashboard } from "./admin-dashboard"
import { ManagerDashboard } from "./manager-dashboard"
import { AgentDashboard } from "./agent-dashboard"

export function Dashboard() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState("overview")

  const renderDashboard = () => {
    if (!user) return null

    switch (user.role_name) {
      case "Administrateur":
        return <AdminDashboard activeSection={activeSection} />
      case "Responsable Cantine":
        return <ManagerDashboard activeSection={activeSection} />
      case "Agent de Saisie":
        return <AgentDashboard activeSection={activeSection} />
      default:
        return <div>Rôle non reconnu</div>
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} userRole={user?.role_name || ""} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{renderDashboard()}</main>
      </div>
    </div>
  )
}
