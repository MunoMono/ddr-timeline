import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../src/App'
describe('DDR immersive temporal atlas', () => {
  it('renders navigation and staff discovery tools', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /Department of Design Research timeline/i }),
    ).toBeVisible()
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Reset view' })).toBeVisible()
    expect(screen.getByRole('searchbox')).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Download CSV' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Download PNG' })).toBeVisible()
  })
})
