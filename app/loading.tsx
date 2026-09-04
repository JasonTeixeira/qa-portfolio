import { BrandLoader } from '@/components/academy/brand/BrandLoader'

/** Site-wide branded loader shown during route transitions for any segment
 *  without its own loading.tsx. Keeps page-to-page navigation on-brand. */
export default function Loading() {
  return <BrandLoader minHeight="100vh" />
}
