import { expect, test } from '@playwright/test'

test('staff atlas loads source snapshot, filters, and works on mobile', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('https://api.ddrarchive.org/graphql', route => route.abort())
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /People in time/i })).toBeVisible()
  await expect(page.getByText('Bruce Archer').first()).toBeVisible()
  await page.getByRole('searchbox').fill('Janet Daley')
  await expect(page.getByText('Janet Daley')).toBeVisible()
  await expect(page.getByText('Bruce Archer')).toHaveCount(0)
  await page.getByRole('button', { name: /Janet Daley/ }).click()
  await expect(page.getByText(/PERSON RECORD · JANETDALEY/)).toBeVisible()
  await page.setViewportSize({ width: 375, height: 812 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false)
  expect(errors).toEqual([])
})
