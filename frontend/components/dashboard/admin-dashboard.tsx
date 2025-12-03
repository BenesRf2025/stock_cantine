"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { apiService } from "@/services/api"
import { useAuth } from "@/contexts/auth-context"
import { Users, UserPlus, BarChart3, Settings, Edit, Trash2, TrendingUp, Download } from "lucide-react"

// Fonction de mapping des noms de rôles
const roleLabel = (roleName: string) => {
  // Les noms de rôles viennent directement de la base de données
  return roleName || "Rôle inconnu"
}

interface AdminDashboardProps {
  activeSection: string
}

export function AdminDashboard({ activeSection }: AdminDashboardProps) {
  const { logout } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [permissions, setPermissions] = useState<any[]>([])
  const [rolePermissions, setRolePermissions] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<any>(null)
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<any>(null)
  const [newRole, setNewRole] = useState({ name: "" })

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role_id: "",
  })

  useEffect(() => {
    if (activeSection === "users" || activeSection === "overview") {
      loadUsers()
      loadRoles()
    }
    if (activeSection === "roles") {
      loadRoles()
      loadPermissions()
    }
    if (activeSection === "reports") {
      loadAnalytics()
    }
  }, [activeSection])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await apiService.getUsers()
      setUsers(data as any[])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement")
      if (err instanceof Error && (err.message === "Session expirée, veuillez vous reconnecter" || err.message === "Token invalide")) {
        logout()
      }
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const data = await apiService.getRoles()
      setRoles(data as any[])
    } catch (err) {
      console.error("Erreur chargement rôles:", err)
      if (err instanceof Error && (err.message === "Session expirée, veuillez vous reconnecter" || err.message === "Token invalide")) {
        logout()
      }
    }
  }

  const loadPermissions = async () => {
    try {
      const data = await apiService.getPermissions()
      setPermissions(data as any[])
    } catch (err) {
      console.error("Erreur chargement permissions:", err)
      if (err instanceof Error && (err.message === "Session expirée, veuillez vous reconnecter" || err.message === "Token invalide")) {
        logout()
      }
    }
  }

  const loadAnalytics = async () => {
    try {
      const data = await apiService.getAnalytics()
      setAnalytics(data)
    } catch (err) {
      console.error("Erreur chargement analytics:", err)
      if (err instanceof Error && (err.message === "Session expirée, veuillez vous reconnecter" || err.message === "Token invalide")) {
        logout()
      }
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiService.createUser(newUser)
      setIsCreateUserOpen(false)
      setNewUser({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        role_id: "",
      })
      loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de création")
    }
  }

  const handleEditUser = (user: any) => {
    setEditingUser(user)
    setNewUser({
      username: user.username,
      email: user.email,
      password: "",
      first_name: user.first_name,
      last_name: user.last_name,
      role_id: user.role_id?.toString() || "",
    })
    setIsEditUserOpen(true)
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    try {
      const updateData = {
        username: newUser.username,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role_id: newUser.role_id,
        is_active: editingUser.is_active,
      }
      await apiService.updateUser(editingUser.id, updateData)
      setIsEditUserOpen(false)
      setEditingUser(null)
      setNewUser({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        role_id: "",
      })
      loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de mise à jour")
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        await apiService.deleteUser(id)
        loadUsers()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de suppression")
      }
    }
  }

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiService.createRole(newRole)
      setIsCreateRoleOpen(false)
      setNewRole({ name: "" })
      loadRoles()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de création")
    }
  }

  const handleEditRole = (role: any) => {
    setEditingRole(role)
    setNewRole({ name: role.name })
    setIsEditRoleOpen(true)
  }

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRole) return
    try {
      await apiService.updateRole(editingRole.id, newRole)
      setIsEditRoleOpen(false)
      setEditingRole(null)
      setNewRole({ name: "" })
      loadRoles()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de mise à jour")
    }
  }

  const handleDeleteRole = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce rôle ?")) {
      try {
        await apiService.deleteRole(id)
        loadRoles()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de suppression")
      }
    }
  }

  const handleSelectRoleForPermissions = async (role: any) => {
    setSelectedRoleForPermissions(role)
    try {
      const data = await apiService.getRolePermissions(role.id)
      setRolePermissions(data as any[])
    } catch (err) {
      console.error("Erreur chargement permissions rôle:", err)
    }
  }

  const handleTogglePermission = async (permission: any) => {
    try {
      if (permission.assigned) {
        await apiService.removePermission(selectedRoleForPermissions.id, permission.id)
      } else {
        await apiService.assignPermission(selectedRoleForPermissions.id, permission.id)
      }
      // Reload permissions
      const data = await apiService.getRolePermissions(selectedRoleForPermissions.id)
      setRolePermissions(data as any[])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de modification permission")
    }
  }

  const handleExportUserReport = async (userId: number, userName: string) => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
      const response = await fetch(`${apiBaseUrl}/users/${userId}/report`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du rapport')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport-${userName.replace(' ', '-')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'export du rapport")
    }
  }

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{users.filter((u: any) => u.is_active).length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{users.filter((u: any) => u.role_name === "Administrateur").length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Responsables</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {users.filter((u: any) => u.role_name === "Responsable Cantine").length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Agents</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{users.filter((u: any) => u.role_name === "Agent de Saisie").length}</div>
        </CardContent>
      </Card>
    </div>
  )

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gestion des Utilisateurs</h3>
        <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Nouvel Utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un Utilisateur</DialogTitle>
              <DialogDescription>Ajoutez un nouvel utilisateur au système</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">Prénom</Label>
                  <Input
                    id="first_name"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Nom</Label>
                  <Input
                    id="last_name"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="role">Rôle</Label>
                <Select value={newUser.role_id} onValueChange={(value) => setNewUser({ ...newUser, role_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role: any) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                Créer
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier un Utilisateur</DialogTitle>
              <DialogDescription>Modifiez les informations de l'utilisateur</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_first_name">Prénom</Label>
                  <Input
                    id="edit_first_name"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_last_name">Nom</Label>
                  <Input
                    id="edit_last_name"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit_username">Nom d'utilisateur</Label>
                <Input
                  id="edit_username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit_role">Rôle</Label>
                <Select value={newUser.role_id} onValueChange={(value) => setNewUser({ ...newUser, role_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role: any) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                Mettre à jour
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
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{roleLabel(user.role_name)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.last_login ? new Date(user.last_login).toLocaleDateString() : "Jamais"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportUserReport(user.id, `${user.first_name} ${user.last_name}`)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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

  const renderRoles = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gestion des Rôles et Permissions</h3>
        <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Nouveau Rôle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un Rôle</DialogTitle>
              <DialogDescription>Ajoutez un nouveau rôle au système</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <Label htmlFor="role_name">Nom du Rôle</Label>
                <Input
                  id="role_name"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ name: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Créer
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rôles</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role: any) => (
                  <TableRow key={role.id}>
                    <TableCell>{role.name}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectRoleForPermissions(role)}
                        >
                          Permissions
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRole(role)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {selectedRoleForPermissions && (
          <Card>
            <CardHeader>
              <CardTitle>Permissions pour {selectedRoleForPermissions.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rolePermissions.map((permission: any) => (
                  <div key={permission.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{permission.name}</div>
                      <div className="text-sm text-muted-foreground">{permission.description}</div>
                    </div>
                    <Button
                      variant={permission.assigned ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTogglePermission(permission)}
                    >
                      {permission.assigned ? "Retirer" : "Assigner"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier un Rôle</DialogTitle>
            <DialogDescription>Modifiez le nom du rôle</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateRole} className="space-y-4">
            <div>
              <Label htmlFor="edit_role_name">Nom du Rôle</Label>
              <Input
                id="edit_role_name"
                value={newRole.name}
                onChange={(e) => setNewRole({ name: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Mettre à jour
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )

  const renderReports = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Rapports et Statistiques</h3>

      {analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Présences Aujourd'hui</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.dailyAttendance}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tendance Hebdomadaire</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {analytics.weeklyTrend > 0 ? '+' : ''}{analytics.weeklyTrend}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coût Total</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalCost}€</div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-8">Chargement des statistiques...</div>
      )}
    </div>
  )

  switch (activeSection) {
    case "overview":
      return renderOverview()
    case "users":
      return renderUsers()
    case "roles":
      return renderRoles()
    case "reports":
      return renderReports()
    default:
      return renderOverview()
  }
}
