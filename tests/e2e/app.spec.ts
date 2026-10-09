import { expect, test } from '@playwright/test'
test('immersive canvas renders sourced bands and accessible controls on mobile', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))
  await page.route('https://api.ddrarchive.org/graphql', (route) => route.abort())
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: /Department of Design Research timeline/i }),
  ).toBeVisible()
  await expect(page.getByText('89', { exact: true })).toBeVisible()
  await expect(page.locator('.interactive-band').first()).toBeVisible()
  await page.getByRole('button', { name: 'Zoom in' }).click()
  await expect(page.getByText(/ZOOM 170%/)).toBeVisible()
  await page.getByRole('button', { name: 'Reset view' }).click()
  await page.getByRole('searchbox').fill('Janet Daley')
  await expect(page.locator('.interactive-band')).toHaveCount(1)
  await page.locator('.interactive-band').first().hover()
  await expect(page.getByRole('tooltip', { name: 'Documented staff details for Janet Daley' })).toBeVisible()
  await expect(page.locator('.person-panel')).toHaveCount(0)
  await page.setViewportSize({ width: 375, height: 812 })
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
  ).toBe(false)
  expect(errors).toEqual([])
})

test('desktop layout uses a unified background and a compact 24px toolbar gap', async ({ page }) => {
  await page.route('https://api.ddrarchive.org/graphql', (route) => route.abort())
  await page.setViewportSize({ width: 1600, height: 900 })
  await page.goto('/')
  const metrics = await page.evaluate(() => {
    const header = document.querySelector('.compact-header')!
    const toolbar = document.querySelector('.timeline-toolbar')!
    const overview = document.querySelector('.overview')!
    const search = document.querySelector('.filter-stripe .cds--search-input')!
    const role = document.querySelector('#role-select')!
    const period = document.querySelector('#period-select')!
    const buttons = document.querySelector('.nav-actions')!
    const rect = (el: Element) => el.getBoundingClientRect()
    return {
      headerColor: getComputedStyle(header).backgroundColor,
      toolbarColor: getComputedStyle(toolbar).backgroundColor,
      bodyColor: getComputedStyle(document.querySelector('.redesign')!).backgroundColor,
      gap: rect(overview).top - rect(search).bottom,
      toolbarHeight: rect(toolbar).height,
      searchTop: rect(search).top,
      roleTop: rect(role).top,
      periodTop: rect(period).top,
      buttonsTop: rect(buttons).top,
    }
  })
  expect(metrics.headerColor).toBe('rgb(22, 22, 22)')
  expect(metrics.toolbarColor).toBe(metrics.bodyColor)
  expect(metrics.gap).toBeGreaterThanOrEqual(20)
  expect(metrics.gap).toBeLessThanOrEqual(40)
  expect(metrics.toolbarHeight).toBeLessThan(125)
  expect(Math.abs(metrics.searchTop - metrics.roleTop)).toBeLessThan(8)
  expect(Math.abs(metrics.roleTop - metrics.periodTop)).toBeLessThan(8)
  expect(Math.abs(metrics.buttonsTop - metrics.searchTop)).toBeLessThan(12)
})
