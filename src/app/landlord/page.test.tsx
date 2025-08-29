import { render, screen, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import LandlordDashboardPage from './page'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as landlordDataHooks from '@/hooks/use-landlord-data'

const mockStats = {
  totalProperties: 5,
  totalUnits: 50,
  occupiedUnits: 45,
  totalTenants: 48,
  monthlyRevenue: 120000,
  openMaintenanceRequests: 3,
  occupancyRate: 90,
}

// Mock the hook
vi.spyOn(landlordDataHooks, 'useDashboardStats').mockReturnValue({
  data: mockStats,
  isLoading: false,
  isError: false,
} as any)

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
})

test('LandlordDashboardPage renders stats correctly', async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <LandlordDashboardPage />
    </QueryClientProvider>
  )

  // Wait for the stats to be displayed
  await waitFor(() => {
    expect(screen.getByText('Total Properties')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()

    expect(screen.getByText('Total Units')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()

    expect(screen.getByText('Active Tenants')).toBeInTheDocument()
    expect(screen.getByText('48')).toBeInTheDocument()

    expect(screen.getByText('Occupancy Rate')).toBeInTheDocument()
    expect(screen.getByText('90.00%')).toBeInTheDocument()

    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument()
    expect(screen.getByText('$120,000.00')).toBeInTheDocument()

    expect(screen.getByText('Open Maintenance')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
