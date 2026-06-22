'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { defaultLocale, type Locale } from '@/lib/i18n/config'

const LocaleContext = createContext<Locale>(defaultLocale)

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}

/** The active locale, available to any client component under the provider. */
export function useLocale(): Locale {
  return useContext(LocaleContext)
}
