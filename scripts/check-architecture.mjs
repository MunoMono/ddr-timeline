import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const root = 'src'
const errors = []
function scan(folder) {
  for (const item of readdirSync(folder, { withFileTypes: true })) {
    const path = join(folder, item.name)
    if (item.isDirectory()) { scan(path); continue }
    const file = relative(root, path).split(sep).join('/')
    if (/\.css$/.test(file)) errors.push(`${file}: plain CSS prohibited; use SCSS in components/styles/`)
    if (/\.scss$/.test(file) && !file.startsWith('components/styles/')) errors.push(`${file}: SCSS must be in components/styles/`)
    if (/\.tsx$/.test(file)) {
      const source = readFileSync(path, 'utf8')
      if (/\bstyle\s*=\s*\{/.test(source)) errors.push(`${file}: React inline style prop prohibited`)
    }
  }
}
scan(root)
if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log('Architecture check passed: SCSS centralised, no authored inline React styles or plain CSS.')
}
