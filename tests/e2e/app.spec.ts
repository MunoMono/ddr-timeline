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

test('overview and chart have equal Carbon side gutters', async ({ page }) => {
  await page.route('https://api.ddrarchive.org/graphql', (route) => route.abort())
  await page.setViewportSize({ width: 1600, height: 900 })
  await page.goto('/')
  const spacing = await page.evaluate(() => {
    const section = document.querySelector('.overview')!.getBoundingClientRect()
    const overview = document.querySelector('.minimap')!.getBoundingClientRect()
    const chart = document.querySelector('.main-canvas')!.getBoundingClientRect()
    const title = document.querySelector('.overview-top')!.getBoundingClientRect()
    const labels = document.querySelector('.minimap-labels')!.getBoundingClientRect()
    return {
      left: overview.left - section.left,
      right: section.right - overview.right,
      chartLeft: chart.left - section.left,
      chartRight: section.right - chart.right,
      headingLeft: title.left - section.left,
      labelsLeft: labels.left - section.left,
    }
  })
  expect(Math.abs(spacing.left - spacing.right)).toBeLessThan(2)
  expect(Math.abs(spacing.chartLeft - spacing.left)).toBeLessThan(2)
  expect(Math.abs(spacing.chartRight - spacing.right)).toBeLessThan(20)
  expect(Math.abs(spacing.headingLeft - spacing.left)).toBeLessThan(2)
  expect(Math.abs(spacing.labelsLeft - spacing.left)).toBeLessThan(2)
})

test('critical period selection snaps zoom to its inclusive calendar boundaries', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 })
  await page.route('https://api.ddrarchive.org/graphql', async (route) => {
    const body = route.request().postData() ?? ''
    if (body.includes('ref_ddr_period')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        data: { ref_ddr_period: [
          { slug: '1973-79', label: 'Peak productivity', description: 'Interpretative phase' },
          { slug: '1984-85', label: 'Institutional decline', description: null },
        ] },
      }) })
    } else {
      await route.abort()
    }
  })
  await page.goto('/')
  await page.locator('#period-select').selectOption('1973-79')
  await expect(page.getByText(/ZOOM 300%/)).toBeVisible()
  await expect(page.locator('.overview-top')).toContainText('1973 — 1979')
  await page.locator('#period-select').selectOption('')
  await expect(page.getByText(/ZOOM 100%/)).toBeVisible()
})

test('staff hover details escape the scrollable timeline and overlay the bands', async ({ page }) => {
  await page.route('https://api.ddrarchive.org/graphql', route => route.abort())
  await page.setViewportSize({ width: 1500, height: 900 })
  await page.goto('/')
  const band = page.locator('.interactive-band').first()
  await band.scrollIntoViewIfNeeded()
  await band.hover()
  const tooltip = page.locator('.staff-record-tooltip')
  await expect(tooltip).toBeVisible()
  const data = await tooltip.evaluate(element => {
    const canvas = document.querySelector('.canvas-wrap')!
    return {
      isOutsideCanvas: !canvas.contains(element),
      position: getComputedStyle(element).position,
      zIndex: Number(getComputedStyle(element).zIndex),
      tooltip: element.getBoundingClientRect().toJSON(),
    }
  })
  expect(data.isOutsideCanvas).toBe(true)
  expect(data.position).toBe('fixed')
  expect(data.zIndex).toBeGreaterThan(100)
  expect(data.tooltip.left).toBeGreaterThanOrEqual(0)
  expect(data.tooltip.right).toBeLessThanOrEqual(1500)
})

test('staff names remain visible when zoomed into the final critical period', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 })
  await page.route('https://api.ddrarchive.org/graphql', async route => {
    const body = route.request().postData() ?? ''
    if (body.includes('ref_ddr_period')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
        data: { ref_ddr_period: [{ slug: '1984-85', label: 'Institutional decline', description: null }] },
      }) })
    } else {
      await route.abort()
    }
  })
  await page.goto('/')
  await page.locator('#period-select').selectOption('1984-85')
  await expect(page.getByText(/ZOOM 1000%/)).toBeVisible()
  const labels = await page.locator('.band-label').evaluateAll(nodes => nodes.map(node => ({
    text: node.textContent,
    x: Number(node.getAttribute('x')),
    width: node.ownerSVGElement?.viewBox.baseVal.width ?? 0,
  })))
  expect(labels.length).toBeGreaterThan(0)
  expect(labels.some(label => label.x >= 26 && label.x < label.width - 22)).toBe(true)
})
