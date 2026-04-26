'use client'

import { useQuery } from '@tanstack/react-query'
import { AssetType, AssetStatus } from '@prisma/client'
import { useState } from 'react'

interface AssetsTableProps {
  initialData: any[]
}

export function AssetsTable({ initialData }: AssetsTableProps) {
  const [filter, setFilter] = useState<string>('ALL')

  const { data: assets, isLoading } = useQuery({
    queryKey: ['assets', filter],
    queryFn: async () => {
      const res = await fetch(`/api/assets?status=${filter === 'ALL' ? '' : filter}`)
      return res.json()
    },
    initialData
  })

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      AVAILABLE: 'bg-green-100 text-green-800',
      ASSIGNED: 'bg-blue-100 text-blue-800',
      MAINTENANCE: 'bg-orange-100 text-orange-800',
      REPAIR: 'bg-red-100 text-red-800',
      RETIRED: 'bg-gray-100 text-gray-800',
      STOLEN: 'bg-purple-100 text-purple-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) return <div className="p-4">Cargando...</div>

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'AVAILABLE', 'ASSIGNED', 'MAINTENANCE'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border'
            }`}
          >
            {status === 'ALL' ? 'Todos' : status}
          </button>
        ))}
      </div>

      {/* Tabla nativa con Tailwind */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Tipo</th>
              <th className="px-6 py-3">Serial</th>
              <th className="px-6 py-3">Marca/Modelo</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Ubicación</th>
            </tr>
          </thead>
          <tbody>
            {assets?.map((asset: any) => (
              <tr key={asset.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{asset.name}</td>
                <td className="px-6 py-4">{asset.type}</td>
                <td className="px-6 py-4 font-mono text-xs">{asset.serialNumber}</td>
                <td className="px-6 py-4">{asset.brand} {asset.model}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(asset.status)}`}>
                    {asset.status}
                  </span>
                </td>
                <td className="px-6 py-4">{asset.location || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {assets?.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay activos registrados.
        </div>
      )}
    </div>
  )
}