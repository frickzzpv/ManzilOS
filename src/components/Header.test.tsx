import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { Header } from './Header'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock the NotificationCenter component
vi.mock('@/components/NotificationCenter', () => ({
  NotificationCenter: () => <div data-testid="notification-center-mock"></div>,
}))

const queryClient = new QueryClient()

test('Header component renders correctly', () => {
  render(
    <QueryClientProvider client={queryClient}>
        <Header />
    </QueryClientProvider>
  )

  // Check for the brand name
  expect(screen.getByText('Manzilos')).toBeInTheDocument()

  // Check for the mocked NotificationCenter
  expect(screen.getByTestId('notification-center-mock')).toBeInTheDocument()
})
