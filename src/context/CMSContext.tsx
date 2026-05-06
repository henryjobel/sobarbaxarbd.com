'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface CMSMenuItem {
  id: string
  label: string
  url: string
  target: string
  order: number
  children: CMSMenuItem[]
}

export interface CMSGlobal {
  logo_text: string
  logo_image: string
  tagline: string
  footer_about: string
  footer_copyright: string
  footer_facebook: string
  footer_instagram: string
  footer_twitter: string
  footer_youtube: string
  contact_email: string
  contact_phone: string
  contact_address: string
  contact_hours: string
  announcement_text: string
  announcement_link: string
  newsletter_title: string
  newsletter_subtitle: string
}

interface CMSContextValue {
  primaryMenu: CMSMenuItem[]
  footerMenu: CMSMenuItem[]
  global: CMSGlobal
  hasSlides: boolean
  ready: boolean
}

const defaults: CMSGlobal = {
  logo_text: '', logo_image: '', tagline: '',
  footer_about: '', footer_copyright: '',
  footer_facebook: '', footer_instagram: '', footer_twitter: '', footer_youtube: '',
  contact_email: '', contact_phone: '', contact_address: '', contact_hours: '',
  announcement_text: '', announcement_link: '/shop',
  newsletter_title: '', newsletter_subtitle: '',
}

const CMSContext = createContext<CMSContextValue>({
  primaryMenu: [], footerMenu: [], global: defaults, hasSlides: false, ready: false,
})

function flatBlocksToGlobal(blocks: Record<string, Record<string, { value: string }>>): CMSGlobal {
  const g = { ...defaults }
  const header = blocks['header'] ?? {}
  const footer = blocks['footer'] ?? {}
  const contact = blocks['contact'] ?? {}
  const seo = blocks['seo'] ?? {}
  const announcement = blocks['announcement'] ?? {}
  const newsletter = blocks['newsletter'] ?? {}

  g.logo_text = header['logo_text']?.value ?? ''
  g.logo_image = header['logo_image']?.value ?? ''
  g.tagline = header['tagline']?.value ?? ''
  g.footer_about = footer['about']?.value ?? ''
  g.footer_copyright = footer['copyright']?.value ?? ''
  g.footer_facebook = footer['facebook']?.value ?? ''
  g.footer_instagram = footer['instagram']?.value ?? ''
  g.footer_twitter = footer['twitter']?.value ?? ''
  g.footer_youtube = footer['youtube']?.value ?? ''
  g.contact_email = contact['email']?.value ?? ''
  g.contact_phone = contact['phone']?.value ?? ''
  g.contact_address = contact['address']?.value ?? ''
  g.contact_hours = contact['hours']?.value ?? ''
  g.announcement_text = announcement['text']?.value ?? ''
  g.announcement_link = announcement['link']?.value ?? '/shop'
  g.newsletter_title = newsletter['title']?.value ?? ''
  g.newsletter_subtitle = newsletter['subtitle']?.value ?? ''

  // also read from contact page blocks for contact info
  return g
}

export function CMSProvider({ children }: { children: ReactNode }) {
  const [primaryMenu, setPrimaryMenu] = useState<CMSMenuItem[]>([])
  const [footerMenu, setFooterMenu] = useState<CMSMenuItem[]>([])
  const [global, setGlobal] = useState<CMSGlobal>(defaults)
  const [hasSlides, setHasSlides] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/menus?location=primary').then(r => r.json()),
      fetch('/api/v1/menus?location=footer').then(r => r.json()),
      fetch('/api/v1/page-blocks?page=global').then(r => r.json()),
      fetch('/api/v1/page-blocks?page=home').then(r => r.json()),
      fetch('/api/v1/slides').then(r => r.json()),
    ]).then(([primary, footer, globalBlocks, homeBlocks, slides]) => {
      if (primary.success && primary.data.length > 0) {
        setPrimaryMenu(primary.data[0].items ?? [])
      }
      if (footer.success && footer.data.length > 0) {
        setFooterMenu(footer.data[0].items ?? [])
      }
      // merge global + home blocks for announcement/newsletter
      const merged = {
        ...(globalBlocks.success ? globalBlocks.data.blocks : {}),
        ...(homeBlocks.success ? {
          announcement: homeBlocks.data.blocks?.announcement,
          newsletter: homeBlocks.data.blocks?.newsletter,
        } : {}),
      }
      setGlobal(flatBlocksToGlobal(merged))
      setHasSlides(slides.success && slides.data.length > 0)
    }).finally(() => setReady(true))
  }, [])

  return (
    <CMSContext.Provider value={{ primaryMenu, footerMenu, global, hasSlides, ready }}>
      {children}
    </CMSContext.Provider>
  )
}

export function useCMS() {
  return useContext(CMSContext)
}
