export type Staff = { staff_code: string; agent_name: string; job_title_code: string; job_title_label: string; start_date: string | null; end_date: string | null; is_primary: boolean }
export type Category = 'Research' | 'Teaching' | 'Administration' | 'Technical' | 'Other'
export const MIN = 1965
export const MAX = 1986
export const year = (s: string | null) => s ? Number(s.slice(0, 4)) : null
export function category(label: string): Category {
  const t = label.toLowerCase()
  if (/secretary|administration|information research officer/.test(t)) return 'Administration'
  if (/technician|programmer|computing/.test(t)) return 'Technical'
  if (/tutor|teaching|education unit/.test(t)) return 'Teaching'
  if (/research|fellow|associate|assistant/.test(t)) return 'Research'
  return 'Other'
}
export const palette: Record<Category, string> = {
  Research: '#0f62fe',
  Teaching: '#ff832b',
  Administration: '#be95ff',
  Technical: '#42be65',
  Other: '#a8a8a8',
}
export const categories = ['All roles', 'Research', 'Teaching', 'Administration', 'Technical', 'Other'] as const
