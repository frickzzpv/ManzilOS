import { expect, test } from 'vitest'
import { cn } from './utils'

test('cn merges classes correctly', () => {
  expect(cn('bg-red-500', 'p-4', 'bg-blue-500')).toBe('p-4 bg-blue-500')
})

test('cn handles conditional classes', () => {
  expect(cn('p-4', true && 'bg-blue-500', false && 'text-white')).toBe('p-4 bg-blue-500')
})
