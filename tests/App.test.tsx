import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../src/App'

describe('DDR staff atlas', () => {
  it('renders the staff exploration interface', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /People in time/i })).toBeVisible()
    expect(screen.getByRole('heading', { name: /Staff timelines/i })).toBeVisible()
    expect(screen.getByRole('searchbox')).toBeEnabled()
    expect(screen.getByLabelText('ROLE FAMILY')).toBeEnabled()
  })
})
