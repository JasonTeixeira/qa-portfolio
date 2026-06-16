export type AttributedTestimonial = {
  id: string
  name: string
  title: string
  company: string
  quote: string
  outcome?: string
  href?: string
  logo?: string
  permission: 'written'
}

export type PermissionedLogo = {
  id: string
  label: string
  logo: string
  href?: string
  permission: 'written'
}

/**
 * Populate only with real, named, permissioned proof.
 * No invented quotes, composite testimonials, borrowed logos, or implied endorsements.
 */
export const attributedTestimonials: AttributedTestimonial[] = []

/**
 * Populate only after written logo permission.
 */
export const permissionedLogos: PermissionedLogo[] = []
