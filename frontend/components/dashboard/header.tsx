"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { apiService } from "@/services/api"
import { LogOut, User, Download } from "lucide-react"
import { useState } from "react"

export function Header() {
  const { user, logout } = useAuth()
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadReport = async () => {
    if (!user) return

    setIsDownloading(true)
    try {
      const blob = await apiService.downloadReport(user.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport-${user.first_name}-${user.last_name}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erreur lors du téléchargement du rapport:', error)
      alert('Erreur lors du téléchargement du rapport')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Tableau de bord</h2>
          <p className="text-sm text-gray-600">
            Bienvenue, {user?.first_name} {user?.last_name}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>{user?.role_name}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadReport}
            disabled={isDownloading}
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? 'Téléchargement...' : 'Mon Rapport'}
          </Button>

          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </div>
    </header>
  )
}
