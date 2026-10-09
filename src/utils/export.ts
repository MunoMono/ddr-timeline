import type { Staff } from '../models/employment'

function save(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function csvCell(value: unknown): string {
  const raw = value == null ? '' : String(value)
  const safe = /^\s*[=+@-]/.test(raw) ? "'" + raw : raw
  return '"' + safe.replace(/"/g, '""') + '"'
}

export function downloadCSV(people: Staff[]): void {
  const columns = ['staff_code', 'agent_name', 'job_title_label', 'start_date', 'end_date'] as const
  const lines = [
    columns.join(','),
    ...people.map(person => columns.map(key => csvCell(person[key])).join(',')),
  ]
  save(new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'ddr-timeline-staff.csv')
}

export async function downloadSVGAsPNG(svg: SVGSVGElement, filename: string): Promise<void> {
  const clone = svg.cloneNode(true) as SVGSVGElement
  const parts = (svg.getAttribute('viewBox') || '').trim().split(/\s+/).map(Number)
  if (parts.length !== 4 || !parts.every(Number.isFinite) || parts[2] <= 0 || parts[3] <= 0) {
    throw new Error('SVG requires a valid viewBox')
  }
  const width = parts[2]
  const height = parts[3]
  clone.setAttribute('width', String(width))
  clone.setAttribute('height', String(height))
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const style = getComputedStyle(svg)
  clone.querySelectorAll('*').forEach(element => {
    for (const attribute of ['fill', 'stroke']) {
      const value = element.getAttribute(attribute)
      const match = value?.match(/^var\((--cds-[\w-]+)\)$/)
      if (match) {
        const computed = style.getPropertyValue(match[1]).trim()
        if (computed) element.setAttribute(attribute, computed)
      }
    }
  })
  const serialized = new XMLSerializer().serializeToString(clone)
  const svgUrl = URL.createObjectURL(new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    const image = new Image()
    image.src = svgUrl
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(width * 2)
    canvas.height = Math.ceil(height * 2)
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas is not available')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(output => output ? resolve(output) : reject(new Error('PNG conversion failed')), 'image/png')
    })
    save(blob, filename)
  } finally {
    URL.revokeObjectURL(svgUrl)
  }
}
