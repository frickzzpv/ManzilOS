"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'

const leaseFormSchema = z.object({
  tenantId: z.string().min(1, { message: 'Please select a tenant' }),
  unitId: z.string().min(1, { message: 'Please select a unit' }),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().min(1, { message: 'End date is required' }),
  monthlyRent: z.coerce.number().min(1, { message: 'Rent amount is required' }),
})

type LeaseFormValues = z.infer<typeof leaseFormSchema>

const api = axios.create({
  baseURL: '/api',
})

const createLease = (data: LeaseFormValues) => {
  return api.post('/landlord/leases', data)
}

const useTenantsForSelect = () => {
    return useQuery({
        queryKey: ['landlordTenantsForSelect'],
        queryFn: async () => {
            const { data } = await api.get('/landlord/tenants')
            return data
        },
    })
}

const useUnitsForSelect = () => {
    return useQuery({
        queryKey: ['landlordUnitsForSelect'],
        queryFn: async () => {
            const { data } = await api.get('/landlord/properties')
            // We need to flatten the units from all properties
            return data.flatMap((p: any) => p.units.filter((u: any) => u.status === 'available'))
        },
    })
}

export function LeaseForm() {
  const queryClient = useQueryClient()
  const { data: tenants, isLoading: areTenantsLoading } = useTenantsForSelect()
  const { data: units, isLoading: areUnitsLoading } = useUnitsForSelect()

  const form = useForm<LeaseFormValues>({
    resolver: zodResolver(leaseFormSchema),
  })

  const mutation = useMutation({
    mutationFn: createLease,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlordLeases'] })
      toast.success('Lease created successfully')
      // Here you would typically close the dialog
    },
    onError: () => {
      toast.error('Failed to create lease')
    },
  })

  function onSubmit(data: LeaseFormValues) {
    mutation.mutate(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="tenantId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tenant</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tenant" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tenants?.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unitId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {units?.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>{u.number} (Property: {u.propertyId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="monthlyRent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Rent</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating...' : 'Create Lease'}
        </Button>
      </form>
    </Form>
  )
}
