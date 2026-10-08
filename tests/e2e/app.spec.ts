import { expect, test } from '@playwright/test'

test('shell renders at desktop and mobile widths without overflow or browser errors', async ({
  page,
}) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'DDR timeline' })).toBeVisible()
  await expect(page.getByText('No timeline records yet')).toBeVisible()
  await expect(page.getByRole('searchbox', { name: 'Search records' })).toBeDisabled()

  const desktopHasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
  expect(desktopHasOverflow).toBe(false)
  await page.screenshot({ path: 'docs/acceptance/SOW-01-desktop.png', fullPage: true })

  await page.setViewportSize({ width: 375, height: 812 })
  const mobileHasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )

  expect(mobileHasOverflow).toBe(false)
  expect(pageErrors).toEqual([])
  await page.screenshot({ path: 'docs/acceptance/SOW-01-mobile.png', fullPage: true })
})
