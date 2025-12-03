"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Truck, Phone, Star, TrendingUp, Package, Clock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Supplier {
  id: string
  name: string
  category: string
  contact: {
    phone: string
    email: string
    address: string
  }
  rating: number
  deliveryTime: string
  lastDelivery: string
  totalOrders: number
  reliability: number
  priceRange: "low" | "medium" | "high"
  status: "active" | "inactive" | "pending"
  specialties: string[]
}

interface Order {
  id: string
  supplierId: string
  supplierName: string
  items: Array<{ name: string; quantity: number; unit: string; price: number }>
  totalAmount: number
  orderDate: string
  deliveryDate: string
  status: "pending" | "confirmed" | "delivered" | "cancelled"
}

export function SupplierManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isCreateSupplierOpen, setIsCreateSupplierOpen] = useState(false)
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false)

  useEffect(() => {
    // Simulation de données
    const mockSuppliers: Supplier[] = [
      {
        id: "1",
        name: "Ferme Bio du Soleil",
        category: "Légumes & Fruits",
        contact: {
          phone: "04 56 78 90 12",
          email: "contact@fermedusoleil.fr",
          address: "123 Route des Champs, 69000 Lyon",
        },
        rating: 4.8,
        deliveryTime: "24h",
        lastDelivery: "2024-01-12",
        totalOrders: 45,
        reliability: 95,
        priceRange: "medium",
        status: "active",
        specialties: ["Bio", "Local", "Saisonnier"],
      },
      {
        id: "2",
        name: "Boucherie Traditionnelle Martin",
        category: "Viandes",
        contact: {
          phone: "04 12 34 56 78",
          email: "martin.boucherie@email.fr",
          address: "45 Avenue de la République, 69000 Lyon",
        },
        rating: 4.6,
        deliveryTime: "48h",
        lastDelivery: "2024-01-10",
        totalOrders: 32,
        reliability: 88,
        priceRange: "high",
        status: "active",
        specialties: ["Halal", "Qualité Premium", "Traçabilité"],
      },
      {
        id: "3",
        name: "Épicerie Solidaire",
        category: "Épicerie Sèche",
        contact: {
          phone: "04 98 76 54 32",
          email: "commandes@epiceriesolidaire.org",
          address: "78 Rue de la Paix, 69000 Lyon",
        },
        rating: 4.2,
        deliveryTime: "72h",
        lastDelivery: "2024-01-08",
        totalOrders: 28,
        reliability: 92,
        priceRange: "low",
        status: "active",
        specialties: ["Prix Solidaires", "Vrac", "Commerce Équitable"],
      },
    ]

    const mockOrders: Order[] = [
      {
        id: "1",
        supplierId: "1",
        supplierName: "Ferme Bio du Soleil",
        items: [
          { name: "Carottes bio", quantity: 20, unit: "kg", price: 2.5 },
          { name: "Pommes de terre", quantity: 30, unit: "kg", price: 1.8 },
        ],
        totalAmount: 104.0,
        orderDate: "2024-01-13",
        deliveryDate: "2024-01-15",
        status: "confirmed",
      },
      {
        id: "2",
        supplierId: "2",
        supplierName: "Boucherie Martin",
        items: [{ name: "Poulet fermier", quantity: 15, unit: "kg", price: 8.5 }],
        totalAmount: 127.5,
        orderDate: "2024-01-12",
        deliveryDate: "2024-01-14",
        status: "delivered",
      },
    ]

    setSuppliers(mockSuppliers)
    setOrders(mockOrders)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriceRangeColor = (range: string) => {
    switch (range) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Fournisseurs</h2>
          <p className="text-gray-600">Gérez vos fournisseurs et commandes</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Package className="w-4 h-4 mr-2" />
                Nouvelle Commande
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle commande</DialogTitle>
                <DialogDescription>Passez une commande auprès d'un fournisseur</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="supplier">Fournisseur</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un fournisseur" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deliveryDate">Date de livraison souhaitée</Label>
                    <Input type="date" id="deliveryDate" />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priorité</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Normale" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Basse</SelectItem>
                        <SelectItem value="normal">Normale</SelectItem>
                        <SelectItem value="high">Haute</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes de commande</Label>
                  <Textarea id="notes" placeholder="Instructions spéciales..." />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setIsCreateOrderOpen(false)}>
                  Annuler
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700">Créer la commande</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateSupplierOpen} onOpenChange={setIsCreateSupplierOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Truck className="w-4 h-4 mr-2" />
                Nouveau Fournisseur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau fournisseur</DialogTitle>
                <DialogDescription>Enregistrez les informations d'un nouveau fournisseur</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplierName">Nom du fournisseur</Label>
                  <Input id="supplierName" placeholder="Ex: Ferme Bio du Soleil" />
                </div>
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetables">Légumes & Fruits</SelectItem>
                      <SelectItem value="meat">Viandes</SelectItem>
                      <SelectItem value="dairy">Produits Laitiers</SelectItem>
                      <SelectItem value="dry">Épicerie Sèche</SelectItem>
                      <SelectItem value="beverages">Boissons</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" placeholder="04 56 78 90 12" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="contact@fournisseur.fr" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input id="address" placeholder="123 Route des Champs, 69000 Lyon" />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setIsCreateSupplierOpen(false)}>
                  Annuler
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700">Ajouter le fournisseur</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Fournisseurs actifs</p>
                <p className="text-2xl font-bold">{suppliers.filter((s) => s.status === "active").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Commandes ce mois</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Fiabilité moyenne</p>
                <p className="text-2xl font-bold">
                  {Math.round(suppliers.reduce((acc, s) => acc + s.reliability, 0) / suppliers.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Délai moyen</p>
                <p className="text-2xl font-bold">36h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des fournisseurs */}
      <Card>
        <CardHeader>
          <CardTitle>Fournisseurs</CardTitle>
          <CardDescription>Liste de tous vos fournisseurs avec leurs informations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{supplier.name}</h3>
                    <p className="text-sm text-gray-600">{supplier.category}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        {renderStars(supplier.rating)}
                        <span className="text-sm text-gray-600 ml-1">{supplier.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{supplier.contact.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{supplier.deliveryTime}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {supplier.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(supplier.status)}>
                    {supplier.status === "active" && "Actif"}
                    {supplier.status === "inactive" && "Inactif"}
                    {supplier.status === "pending" && "En attente"}
                  </Badge>
                  <Badge className={getPriceRangeColor(supplier.priceRange)}>
                    {supplier.priceRange === "low" && "Prix bas"}
                    {supplier.priceRange === "medium" && "Prix moyen"}
                    {supplier.priceRange === "high" && "Prix élevé"}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Contacter
                  </Button>
                  <Button variant="outline" size="sm">
                    Commander
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Commandes récentes */}
      <Card>
        <CardHeader>
          <CardTitle>Commandes Récentes</CardTitle>
          <CardDescription>Historique des dernières commandes passées</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">Commande #{order.id}</h3>
                  <p className="text-sm text-gray-600">{order.supplierName}</p>
                  <p className="text-sm text-gray-500">
                    {order.items.length} article(s) • €{order.totalAmount}
                  </p>
                  <p className="text-xs text-gray-500">
                    Commandé le {new Date(order.orderDate).toLocaleDateString("fr-FR")} • Livraison prévue le{" "}
                    {new Date(order.deliveryDate).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getOrderStatusColor(order.status)}>
                    {order.status === "pending" && "En attente"}
                    {order.status === "confirmed" && "Confirmée"}
                    {order.status === "delivered" && "Livrée"}
                    {order.status === "cancelled" && "Annulée"}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Détails
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
