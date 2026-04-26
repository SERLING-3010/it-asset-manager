import { redirect } from 'next/navigation'

export default function Home() {
  // Redirigir automáticamente al dashboard
  redirect('/dashboard')
  
  // O si prefieres una página de bienvenida:
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold gradient-text">🖥️ IT Asset Manager</h1>
        <p className="text-xl text-gray-600">Sistema de Gestión de Activos Tecnológicos</p>
        <div className="space-x-4">
          <a 
            href="/dashboard" 
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Ir al Dashboard
          </a>
          <a 
            href="/dashboard/assets" 
            className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Ver Activos
          </a>
        </div>
      </div>
    </div>
  )
}