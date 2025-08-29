"use client"

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['landlordDashboardStats'],
    queryFn: async () => {
      const { data } = await api.get('/landlord/dashboard/stats')
      return data
    },
  })
}
