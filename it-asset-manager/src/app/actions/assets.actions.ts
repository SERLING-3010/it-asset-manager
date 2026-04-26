'use server'

import { prisma } from '../lib/prisma'
import { revalidatePath } from 'next/cache'
import { AssetType } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../lib/auth'

// Crear activo
export async function createAsset(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('No autorizado')

  const warrantyEnd = formData.get('warrantyEndDate') as string
  const warrantyDate = warrantyEnd ? new Date(warrantyEnd) : null

  try {
    await prisma.asset.create({
      data: {
        name: formData.get('name') as string,
        serialNumber: formData.get('serialNumber') as string,
        type: formData.get('type') as AssetType,
        status: 'AVAILABLE',
        brand: formData.get('brand') as string,
        model: formData.get('model') as string,
        purchaseDate: new Date(formData.get('purchaseDate') as string),
        warrantyEndDate: warrantyDate,
        purchasePrice: parseFloat(formData.get('purchasePrice') as string),
        currentValue: parseFloat(formData.get('currentValue') as string) || 0,
        notes: formData.get('notes') as string,
        location: formData.get('location') as string,
      },
    })
    
    revalidatePath('/dashboard/assets')
    revalidatePath('/dashboard')
  } catch (error) {
    console.error('Error creando activo:', error)
    throw error
  }
}

// Listar activos con filtros
export async function getAssets(filters?: {
  type?: AssetType
  status?: string
  search?: string
}) {
  const where: any = {}
  
  if (filters?.type) where.type = filters.type
  if (filters?.status && filters.status !== 'ALL') where.status = filters.status
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { serialNumber: { contains: filters.search } },
      { brand: { contains: filters.search } },
    ]
  }

  return await prisma.asset.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
}

// Asignar activo a empleado
export async function assignAsset(assetId: string, userId: string, notes?: string) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('No autorizado')

  try {
    await prisma.assetAssignment.create({
      data: {
        assetId,
        userId,
        notes,
      },
    })

    await prisma.asset.update({
      where: { id: assetId },
      data: { status: 'ASSIGNED' }
    })

    revalidatePath('/dashboard/assets')
  } catch (error) {
    console.error('Error asignando activo:', error)
    throw error
  }
}

// Registrar mantenimiento
export async function createMaintenance(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) throw new Error('No autorizado')

  try {
    // Asumimos que el usuario logueado es el técnico para este ejemplo
    // En una app real, buscaríamos el ID del usuario por su email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) throw new Error('Usuario no encontrado')

    await prisma.maintenance.create({
      data: {
        assetId: formData.get('assetId') as string,
        technicianId: user.id,
        type: formData.get('type') as any,
        description: formData.get('description') as string,
        cost: parseFloat(formData.get('cost') as string),
        provider: formData.get('provider') as string,
      },
    })
    
    revalidatePath('/dashboard/assets')
  } catch (error) {
    console.error('Error registrando mantenimiento:', error)
    throw error
  }
}

// Dashboard metrics
export async function getDashboardMetrics() {
  const totalAssets = await prisma.asset.count()
  
  const byStatus = await prisma.asset.groupBy({
    by: ['status'],
    _count: true
  })

  const byType = await prisma.asset.groupBy({
    by: ['type'],
    _count: true
  })

  const totalMaintenanceCost = await prisma.maintenance.aggregate({
    _sum: { cost: true }
  })

  const assetsInMaintenance = await prisma.asset.count({
    where: { status: 'MAINTENANCE' }
  })

  return {
    totalAssets,
    byStatus,
    byType,
    totalMaintenanceCost: totalMaintenanceCost._sum.cost || 0,
    assetsInMaintenance,
  }
}