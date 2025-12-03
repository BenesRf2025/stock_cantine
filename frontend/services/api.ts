const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"

class ApiService {
  private token: string | null = null

  private getAuthHeaders() {
    const token = this.token || localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    }
  }

  setToken(token: string | null) {
    this.token = token
  }

  async login(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
    return this.handleResponse(response)
  }

  async downloadReport(userId: number) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/report`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erreur réseau' }))
      throw new Error(errorData.error || `Erreur HTTP ${response.status}`)
    }

    return response.blob()
  }

  // Ingredients
  async getIngredients(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/ingredients`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async createIngredient(ingredientData: any) {
    const response = await fetch(`${API_BASE_URL}/ingredients`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(ingredientData),
    })
    return this.handleResponse(response)
  }

  async updateIngredient(id: number, ingredientData: any) {
    const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(ingredientData),
    })
    return this.handleResponse(response)
  }

  async deleteIngredient(id: number) {
    const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  // Students
  async getStudents(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/students`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async createStudent(studentData: any) {
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(studentData),
    })
    return this.handleResponse(response)
  }

  async updateStudent(id: number, studentData: any) {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(studentData),
    })
    return this.handleResponse(response)
  }

  async deleteStudent(id: number) {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erreur réseau' }))
      throw new Error(errorData.error || `Erreur HTTP ${response.status}`)
    }
    return response.json()
  }

  // Users
  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async createUser(userData: any) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    })
    return this.handleResponse(response)
  }

  async updateUser(id: number, userData: any) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    })
    return this.handleResponse(response)
  }

  async deleteUser(id: number) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  // Roles
  async getRoles() {
    const response = await fetch(`${API_BASE_URL}/roles`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async createRole(roleData: any) {
    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(roleData),
    })
    return this.handleResponse(response)
  }

  async updateRole(id: number, roleData: any) {
    const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(roleData),
    })
    return this.handleResponse(response)
  }

  async deleteRole(id: number) {
    const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  // Permissions
  async getPermissions() {
    const response = await fetch(`${API_BASE_URL}/permissions`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async getRolePermissions(roleId: number) {
    const response = await fetch(`${API_BASE_URL}/role-permissions/${roleId}`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async assignPermission(roleId: number, permissionId: number) {
    const response = await fetch(`${API_BASE_URL}/role-permissions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ role_id: roleId, permission_id: permissionId }),
    })
    return this.handleResponse(response)
  }

  async removePermission(roleId: number, permissionId: number) {
    const response = await fetch(`${API_BASE_URL}/role-permissions/${roleId}/${permissionId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  // Stock Movements
  async getStockMovements(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/stock-movements`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async createStockMovement(movementData: any) {
    const response = await fetch(`${API_BASE_URL}/stock-movements`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(movementData),
    })
    return this.handleResponse(response)
  }

  // Stock Alerts
  async getStockAlerts(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/stock-alerts`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async resolveStockAlert(id: number) {
    const response = await fetch(`${API_BASE_URL}/stock-alerts/${id}/resolve`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  // Recipes
  async getRecipes(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/recipes`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async createRecipe(recipeData: any) {
    const response = await fetch(`${API_BASE_URL}/recipes`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(recipeData),
    })
    return this.handleResponse(response)
  }

  async updateRecipe(id: number, recipeData: any) {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(recipeData),
    })
    return this.handleResponse(response)
  }

  async deleteRecipe(id: number) {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  // Suppliers
  async getSuppliers() {
    const response = await fetch(`${API_BASE_URL}/suppliers`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async createSupplier(supplierData: any) {
    const response = await fetch(`${API_BASE_URL}/suppliers`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(supplierData),
    })
    return this.handleResponse(response)
  }

  // Orders
  async getOrders() {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async createOrder(orderData: any) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(orderData),
    })
    return this.handleResponse(response)
  }

  // Attendances
  async getAttendances(params?: { date?: string; meal_type?: string }): Promise<any[]> {
    let url = `${API_BASE_URL}/attendances`
    if (params) {
      const searchParams = new URLSearchParams()
      if (params.date) searchParams.append('date', params.date)
      if (params.meal_type) searchParams.append('meal_type', params.meal_type)
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`
      }
    }
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async createAttendance(attendanceData: any) {
    const response = await fetch(`${API_BASE_URL}/attendances`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(attendanceData),
    })
    return this.handleResponse(response)
  }

  async updateAttendance(id: number, attendanceData: any) {
    const response = await fetch(`${API_BASE_URL}/attendances/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(attendanceData),
    })
    return this.handleResponse(response)
  }

  async deleteAttendance(id: number) {
    const response = await fetch(`${API_BASE_URL}/attendances/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  // Allergen Profiles
  async getAllergenProfiles() {
    const response = await fetch(`${API_BASE_URL}/allergen-profiles`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async createAllergenProfile(profileData: any) {
    const response = await fetch(`${API_BASE_URL}/allergen-profiles`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    })
    return this.handleResponse(response)
  }

  // Menu Plans
  async getMenuPlans() {
    const response = await fetch(`${API_BASE_URL}/menu-plans`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async createMenuPlan(planData: any) {
    const response = await fetch(`${API_BASE_URL}/menu-plans`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(planData),
    })
    return this.handleResponse(response)
  }

  // Analytics
  async getAnalytics() {
    const response = await fetch(`${API_BASE_URL}/analytics`, {
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }
}

export const apiService = new ApiService()