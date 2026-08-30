import { BrandLoader } from '@/components/academy/brand/BrandLoader'

/** Default branded loader for academy route transitions. More specific
 *  segment loading.tsx files (my-courses, build) override this. */
export default function Loading() {
  return <BrandLoader />
}
