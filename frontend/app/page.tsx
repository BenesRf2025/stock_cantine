"use client"
import { LoginForm } from "@/components/auth/login-form"
import { Dashboard } from "@/components/dashboard/dashboard"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" suppressHydrationWarning={true}>
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return <main className="min-h-screen bg-background">{user ? <Dashboard /> : <LoginForm />}</main>
}
