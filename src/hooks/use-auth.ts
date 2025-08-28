"use client"

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const useAuth = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/auth/me')
        return data
      } catch (error) {
        return null
      }
    },
    retry: false,
  })
}
