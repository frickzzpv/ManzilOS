"use client"

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const useLeaseInfo = () => {
  return useQuery({
    queryKey: ['leaseInfo'],
    queryFn: async () => {
      const { data } = await api.get('/tenant/lease')
      return data
    },
  })
}

export const usePayments = () => {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data } = await api.get('/tenant/payments')
      return data
    },
  })
}

export const useMaintenanceRequests = () => {
  return useQuery({
    queryKey: ['maintenanceRequests'],
    queryFn: async () => {
      const { data } = await api.get('/tenant/maintenance')
      return data
    },
  })
}

export const useAnnouncements = () => {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data } = await api.get('/announcements')
      return data
    },
  })
}

export const useVisitorPasses = () => {
  return useQuery({
    queryKey: ['visitorPasses'],
    queryFn: async () => {
      const { data } = await api.get('/visitor-passes')
      return data
    },
  })
}
