import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../src/App'

describe('DDR timeline shell', () => {
  it('shows the documented scope without substituting sample records', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'DDR timeline' })).toBeVisible()
    expect(screen.getByText('1965-1985 scope')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'No timeline records yet' })).toBeVisible()
    expect(screen.getByRole('searchbox', { name: 'Search records' })).toBeDisabled()
  })
})
