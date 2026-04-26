import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../lib/auth' // ✅ Ruta corregida (relativa a app/lib)
import { getDashboardMetrics } from '../actions/assets.actions' // ✅ Ruta corregida
import { AssetsChart } from './_components/AssetsChart'
import { RecentActivity } from './_components/RecentActivity'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  // Opcional: Redirigir si no hay sesión, o comentar esto para probar sin login
  // if (!session) redirect('/auth/login')

  const metrics = await getDashboardMetrics()

  // Helper para contar activos por estado
  const countByStatus = (status: string) => 
    metrics.byStatus.find(s => s.status === status)?._count || 0

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard ITAM</h1>
        <p className="text-gray-600">Resumen de activos tecnológicos</p>
      </div>

      {/* KPIs (Reemplazo de Card por divs para evitar errores de imports) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Activos</h3>
          <p className="text-2xl font-bold">{metrics.totalAssets}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">En Mantenimiento</h3>
          <p className="text-2xl font-bold text-orange-600">{countByStatus('MAINTENANCE')}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Costo Mant.</h3>
          <p className="text-2xl font-bold text-green-600">
            ${metrics.totalMaintenanceCost.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Disponibles</h3>
          <p className="text-2xl font-bold text-blue-600">{countByStatus('AVAILABLE')}</p>
        </div>
      </div>

      {/* Gráficos y Actividad */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow col-span-2">
          <h3 className="text-lg font-semibold mb-4">Distribución por Tipo</h3>
          <AssetsChart data={metrics.byType} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow col-span-1">
          <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
