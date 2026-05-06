'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAdminAuth } from '../AdminAuthContext'
import AdminGuard from '../components/AdminGuard'
import Image from 'next/image'

interface BlockValue { id: string; type: string; value: string }
interface PageData { page: string; blocks: Record<string, Record<string, BlockValue>>; raw: RawBlock[] }
interface RawBlock { id: string; page: string; section: string; key: string; type: string; value: string }

// Pre-defined page templates with their sections and fields
const PAGE_TEMPLATES: Record<string, { label: string; sections: { key: string; label: string; fields: { key: string; label: string; type: string; placeholder: string }[] }[] }> = {
  home: {
    label: 'Homepage',
    sections: [
      {
        key: 'announcement', label: 'Top Announcement Bar',
        fields: [
          { key: 'text', label: 'Announcement Text', type: 'text', placeholder: 'New customers save 10% with code GET10' },
          { key: 'link', label: 'Link URL', type: 'url', placeholder: '/shop' },
        ],
      },
      {
        key: 'hero', label: 'Hero Section (below slider)',
        fields: [
          { key: 'title', label: 'Heading', type: 'text', placeholder: 'Welcome to Our Store' },
          { key: 'subtitle', label: 'Subheading', type: 'text', placeholder: 'Discover the latest collections' },
          { key: 'buttonText', label: 'Button Label', type: 'text', placeholder: 'Shop Now' },
          { key: 'buttonLink', label: 'Button Link', type: 'url', placeholder: '/shop' },
          { key: 'image', label: 'Background Image URL', type: 'image', placeholder: 'https://...' },
        ],
      },
      {
        key: 'features', label: 'Features / USP Strip',
        fields: [
          { key: 'feature1_icon', label: 'Feature 1 Icon (emoji or URL)', type: 'text', placeholder: '🚚' },
          { key: 'feature1_title', label: 'Feature 1 Title', type: 'text', placeholder: 'Free Shipping' },
          { key: 'feature1_subtitle', label: 'Feature 1 Subtitle', type: 'text', placeholder: 'On orders over ৳999' },
          { key: 'feature2_icon', label: 'Feature 2 Icon', type: 'text', placeholder: '↩️' },
          { key: 'feature2_title', label: 'Feature 2 Title', type: 'text', placeholder: 'Easy Returns' },
          { key: 'feature2_subtitle', label: 'Feature 2 Subtitle', type: 'text', placeholder: '30-day return policy' },
          { key: 'feature3_icon', label: 'Feature 3 Icon', type: 'text', placeholder: '🔒' },
          { key: 'feature3_title', label: 'Feature 3 Title', type: 'text', placeholder: 'Secure Payment' },
          { key: 'feature3_subtitle', label: 'Feature 3 Subtitle', type: 'text', placeholder: '100% safe & secure' },
          { key: 'feature4_icon', label: 'Feature 4 Icon', type: 'text', placeholder: '🎧' },
          { key: 'feature4_title', label: 'Feature 4 Title', type: 'text', placeholder: 'Support 24/7' },
          { key: 'feature4_subtitle', label: 'Feature 4 Subtitle', type: 'text', placeholder: 'Dedicated support' },
        ],
      },
      {
        key: 'newsletter', label: 'Newsletter Section',
        fields: [
          { key: 'title', label: 'Title', type: 'text', placeholder: 'Subscribe to Our Newsletter' },
          { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'Get the latest updates and exclusive offers' },
          { key: 'placeholder', label: 'Input Placeholder', type: 'text', placeholder: 'Enter your email' },
          { key: 'buttonText', label: 'Button Text', type: 'text', placeholder: 'Subscribe' },
        ],
      },
      {
        key: 'cta', label: 'Call-to-Action Banner',
        fields: [
          { key: 'title', label: 'Title', type: 'text', placeholder: 'Special Offer This Week' },
          { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'Up to 50% off on selected items' },
          { key: 'buttonText', label: 'Button Text', type: 'text', placeholder: 'Grab the Deal' },
          { key: 'buttonLink', label: 'Button Link', type: 'url', placeholder: '/shop/sale' },
          { key: 'image', label: 'Background Image', type: 'image', placeholder: 'https://...' },
          { key: 'bgColor', label: 'Background Color', type: 'color', placeholder: '#1a1a1a' },
        ],
      },
    ],
  },
  about: {
    label: 'About Page',
    sections: [
      {
        key: 'hero', label: 'Hero',
        fields: [
          { key: 'title', label: 'Page Title', type: 'text', placeholder: 'About Us' },
          { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'Our story and mission' },
          { key: 'image', label: 'Hero Image URL', type: 'image', placeholder: 'https://...' },
        ],
      },
      {
        key: 'story', label: 'Our Story',
        fields: [
          { key: 'title', label: 'Section Title', type: 'text', placeholder: 'Our Story' },
          { key: 'body', label: 'Content', type: 'html', placeholder: '<p>We started in...</p>' },
          { key: 'image', label: 'Image URL', type: 'image', placeholder: 'https://...' },
        ],
      },
      {
        key: 'stats', label: 'Stats / Numbers',
        fields: [
          { key: 'stat1_number', label: 'Stat 1 Number', type: 'text', placeholder: '10,000+' },
          { key: 'stat1_label', label: 'Stat 1 Label', type: 'text', placeholder: 'Happy Customers' },
          { key: 'stat2_number', label: 'Stat 2 Number', type: 'text', placeholder: '500+' },
          { key: 'stat2_label', label: 'Stat 2 Label', type: 'text', placeholder: 'Products' },
          { key: 'stat3_number', label: 'Stat 3 Number', type: 'text', placeholder: '50+' },
          { key: 'stat3_label', label: 'Stat 3 Label', type: 'text', placeholder: 'Brands' },
        ],
      },
      {
        key: 'team', label: 'Team Section',
        fields: [
          { key: 'title', label: 'Section Title', type: 'text', placeholder: 'Meet Our Team' },
          { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'The people behind the brand' },
        ],
      },
    ],
  },
  contact: {
    label: 'Contact Page',
    sections: [
      {
        key: 'hero', label: 'Page Header',
        fields: [
          { key: 'title', label: 'Page Title', type: 'text', placeholder: 'Contact Us' },
          { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: "We'd love to hear from you" },
        ],
      },
      {
        key: 'info', label: 'Contact Information',
        fields: [
          { key: 'address', label: 'Address', type: 'text', placeholder: '123 Main St, Dhaka, Bangladesh' },
          { key: 'phone', label: 'Phone', type: 'text', placeholder: '+880 1234 567890' },
          { key: 'email', label: 'Email', type: 'text', placeholder: 'support@anvogue.com' },
          { key: 'hours', label: 'Business Hours', type: 'text', placeholder: 'Mon-Sat: 9am - 6pm' },
        ],
      },
      {
        key: 'form', label: 'Contact Form Text',
        fields: [
          { key: 'title', label: 'Form Title', type: 'text', placeholder: 'Send us a message' },
          { key: 'subtitle', label: 'Form Subtitle', type: 'text', placeholder: "Fill in the form below and we'll get back to you" },
        ],
      },
    ],
  },
  global: {
    label: 'Global / Site-wide',
    sections: [
      {
        key: 'header', label: 'Header',
        fields: [
          { key: 'logo_text', label: 'Logo Text (if no image)', type: 'text', placeholder: 'ANVOGUE' },
          { key: 'logo_image', label: 'Logo Image URL', type: 'image', placeholder: 'https://...' },
          { key: 'tagline', label: 'Tagline', type: 'text', placeholder: 'Fashion for Everyone' },
        ],
      },
      {
        key: 'footer', label: 'Footer',
        fields: [
          { key: 'about', label: 'About Text', type: 'text', placeholder: 'Short description about your store' },
          { key: 'copyright', label: 'Copyright Text', type: 'text', placeholder: '© 2024 Anvogue. All rights reserved.' },
          { key: 'facebook', label: 'Facebook URL', type: 'url', placeholder: 'https://facebook.com/...' },
          { key: 'instagram', label: 'Instagram URL', type: 'url', placeholder: 'https://instagram.com/...' },
          { key: 'twitter', label: 'Twitter/X URL', type: 'url', placeholder: 'https://twitter.com/...' },
          { key: 'youtube', label: 'YouTube URL', type: 'url', placeholder: 'https://youtube.com/...' },
        ],
      },
      {
        key: 'seo', label: 'SEO / Meta',
        fields: [
          { key: 'site_title', label: 'Site Title', type: 'text', placeholder: 'Anvogue — Fashion Store' },
          { key: 'meta_description', label: 'Meta Description', type: 'text', placeholder: 'Shop the latest fashion trends...' },
          { key: 'og_image', label: 'Social Share Image URL', type: 'image', placeholder: 'https://...' },
        ],
      },
    ],
  },
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export default function AdminPagesPage() {
  const { token } = useAdminAuth()
  const [activePage, setActivePage] = useState('home')
  const [activeSection, setActiveSection] = useState<string>('')
  const [pageData, setPageData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<Record<string, SaveStatus>>({})
  const [localValues, setLocalValues] = useState<Record<string, Record<string, string>>>({})

  const template = PAGE_TEMPLATES[activePage]

  const fetchPage = useCallback((page: string) => {
    setLoading(true)
    fetch(`/api/v1/page-blocks?page=${page}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setPageData(res.data)
          // Populate localValues from DB data
          const vals: Record<string, Record<string, string>> = {}
          const blocks = res.data.blocks as Record<string, Record<string, BlockValue>>
          for (const section of Object.keys(blocks)) {
            vals[section] = {}
            for (const key of Object.keys(blocks[section])) {
              vals[section][key] = blocks[section][key].value
            }
          }
          setLocalValues(vals)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchPage(activePage)
    setActiveSection(PAGE_TEMPLATES[activePage]?.sections[0]?.key ?? '')
  }, [activePage, fetchPage])

  const getValue = (section: string, key: string) => localValues[section]?.[key] ?? ''

  const setValue = (section: string, key: string, value: string) => {
    setLocalValues(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }))
  }

  const saveField = async (section: string, key: string, type: string) => {
    const fieldKey = `${section}.${key}`
    setSaveStatus(prev => ({ ...prev, [fieldKey]: 'saving' }))
    const value = getValue(section, key)
    const res = await fetch('/api/v1/page-blocks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ page: activePage, section, key, type, value }),
    })
    const data = await res.json()
    setSaveStatus(prev => ({ ...prev, [fieldKey]: data.success ? 'saved' : 'error' }))
    setTimeout(() => setSaveStatus(prev => ({ ...prev, [fieldKey]: 'idle' })), 2000)
  }

  const saveSection = async (sectionKey: string) => {
    const section = template.sections.find(s => s.key === sectionKey)
    if (!section) return
    for (const field of section.fields) {
      await saveField(sectionKey, field.key, field.type)
    }
  }

  const currentSection = template?.sections.find(s => s.key === activeSection)

  return (
    <AdminGuard>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Page Content Editor</h1>
          <p className="text-gray-500 text-sm">Edit text, images, and content across your site pages</p>
        </div>

        {/* Page Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {Object.entries(PAGE_TEMPLATES).map(([key, tmpl]) => (
            <button key={key} onClick={() => setActivePage(key)}
              className={`px-4 py-2 text-sm font-medium transition -mb-px border-b-2 ${activePage === key ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tmpl.label}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Section Sidebar */}
          <div className="w-52 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-3 space-y-1">
              {template?.sections.map(s => (
                <button key={s.key} onClick={() => setActiveSection(s.key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${activeSection === s.key ? 'bg-black text-white font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fields Editor */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-400">Loading...</div>
            ) : currentSection ? (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-5 pb-4 border-b">
                  <div>
                    <h2 className="font-semibold text-gray-900">{currentSection.label}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Page: {activePage} → Section: {activeSection}</p>
                  </div>
                  <button onClick={() => saveSection(activeSection)}
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                    Save All
                  </button>
                </div>

                <div className="space-y-5">
                  {currentSection.fields.map(field => {
                    const fieldKey = `${activeSection}.${field.key}`
                    const status = saveStatus[fieldKey] ?? 'idle'
                    const value = getValue(activeSection, field.key)

                    return (
                      <div key={field.key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                          <div className="flex items-center gap-2">
                            {status === 'saving' && <span className="text-xs text-gray-400">Saving...</span>}
                            {status === 'saved' && <span className="text-xs text-green-600">✓ Saved</span>}
                            {status === 'error' && <span className="text-xs text-red-500">Error</span>}
                            <button onClick={() => saveField(activeSection, field.key, field.type)}
                              className="text-xs text-gray-500 border px-2 py-0.5 rounded hover:bg-gray-50 transition">
                              Save
                            </button>
                          </div>
                        </div>

                        {field.type === 'html' ? (
                          <textarea rows={5} value={value}
                            onChange={e => setValue(activeSection, field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black font-mono" />
                        ) : field.type === 'color' ? (
                          <div className="flex gap-2">
                            <input type="color" value={value || '#000000'} onChange={e => setValue(activeSection, field.key, e.target.value)}
                              className="w-10 h-9 border rounded cursor-pointer" />
                            <input value={value} onChange={e => setValue(activeSection, field.key, e.target.value)}
                              placeholder={field.placeholder}
                              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                          </div>
                        ) : field.type === 'image' ? (
                          <div>
                            <input value={value} onChange={e => setValue(activeSection, field.key, e.target.value)}
                              placeholder={field.placeholder}
                              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                            {value && (
                              <div className="mt-2 h-28 rounded-lg overflow-hidden bg-gray-100 relative border">
                                <Image src={value} alt="preview" fill className="object-cover" unoptimized
                                  onError={() => {}} />
                              </div>
                            )}
                          </div>
                        ) : (
                          <input type={field.type === 'url' ? 'url' : 'text'} value={value}
                            onChange={e => setValue(activeSection, field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
