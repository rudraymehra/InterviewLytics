/**
 * Generates scripts/fixtures/sample-resume.pdf — a small realistic resume PDF
 * used by the e2e test and manual QA. Run with: npm run fixtures
 */
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const here = dirname(fileURLToPath(import.meta.url))

const LINES = [
  ['Alex Morgan', 18, true],
  ['Senior Frontend Engineer — alex.morgan@example.com — San Francisco, CA', 10, false],
  ['', 10, false],
  ['SUMMARY', 12, true],
  ['Frontend engineer with 6 years of experience building accessible, high-performance', 10, false],
  ['web applications in React and TypeScript. Led the design-system effort at Nimbus', 10, false],
  ['Analytics, cutting UI defect rates by 40%. Comfortable across the stack with Node.js', 10, false],
  ['and PostgreSQL.', 10, false],
  ['', 10, false],
  ['EXPERIENCE', 12, true],
  ['Nimbus Analytics — Senior Frontend Engineer (2021 – present)', 11, true],
  ['- Built a 40-component design system in React, TypeScript, and Tailwind CSS,', 10, false],
  ['  adopted by 5 product teams; enforced WCAG 2.1 AA accessibility.', 10, false],
  ['- Cut dashboard time-to-interactive from 4.2s to 1.1s via code-splitting and', 10, false],
  ['  performance profiling with Lighthouse and the React Profiler.', 10, false],
  ['- Mentored 3 mid-level engineers; ran weekly frontend guild sessions.', 10, false],
  ['Brightpath Software — Frontend Engineer (2019 – 2021)', 11, true],
  ['- Shipped a Next.js customer portal serving 200k monthly users; owned REST API', 10, false],
  ['  integration and error-handling conventions.', 10, false],
  ['- Introduced end-to-end tests with Playwright, reducing regression escapes by 30%.', 10, false],
  ['', 10, false],
  ['SKILLS', 12, true],
  ['React, TypeScript, Next.js, Tailwind CSS, Node.js, PostgreSQL, REST APIs,', 10, false],
  ['accessibility (WCAG), performance profiling, Playwright, design systems, Git', 10, false],
  ['', 10, false],
  ['EDUCATION', 12, true],
  ['B.S. Computer Science, University of Washington (2019)', 10, false],
] as const

async function main() {
  const doc = await PDFDocument.create()
  const page = doc.addPage([612, 792])
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)

  let y = 750
  for (const [text, size, isBold] of LINES) {
    if (text) {
      page.drawText(text, { x: 54, y, size, font: isBold ? bold : font, color: rgb(0.1, 0.1, 0.15) })
    }
    y -= size + 6
  }

  const bytes = await doc.save()
  const out = join(here, 'fixtures', 'sample-resume.pdf')
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, bytes)
  console.log(`Wrote ${out} (${bytes.length} bytes)`)
}

main()
