'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'

interface PageForm {
  title: string
  slug: string
  content: string
  excerpt: string
  status: string
  template: string
  metaTitle: string
  metaDesc: string
}

interface Props {
  mode: 'create' | 'edit'
  initial?: Partial<PageForm>
  saving: boolean
  error: string
  onSave: (data: Record<string, unknown>) => void
  onCancel: () => void
}

const emptyForm: PageForm = {
  title: '', slug: '', content: '', excerpt: '',
  status: 'draft', template: 'default', metaTitle: '', metaDesc: '',
}

const TOOLBAR = [
  { cmd: 'bold',          icon: 'B',  title: 'Bold',         style: 'font-bold' },
  { cmd: 'italic',        icon: 'I',  title: 'Italic',       style: 'italic' },
  { cmd: 'underline',     icon: 'U',  title: 'Underline',    style: 'underline' },
  { cmd: 'insertUnorderedList', icon: '•', title: 'Bullet List', style: '' },
  { cmd: 'insertOrderedList',   icon: '1.', title: 'Numbered List', style: '' },
]

const HEADING_CMDS = [
  { label: 'Paragraph', value: 'p' },
  { label: 'Heading 1', value: 'h1' },
  { label: 'Heading 2', value: 'h2' },
  { label: 'Heading 3', value: 'h3' },
]

export default function PageEditor({ mode, initial, saving, error, onSave, onCancel }: Props) {
  const [form, setForm] = useState<PageForm>({ ...emptyForm, ...initial })
  const [activeTab, setActiveTab] = useState<'visual' | 'html'>('visual')
  const [showSeo, setShowSeo] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const slugManual = useRef(false)

  const set = (field: keyof PageForm, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleTitleChange = (v: string) => {
    set('title', v)
    if (!slugManual.current) {
      set('slug', v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
    }
  }

  const execCmd = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value)
    editorRef.current?.focus()
    syncFromVisual()
  }

  const syncFromVisual = () => {
    if (editorRef.current) set('content', editorRef.current.innerHTML)
  }

  const handleSave = (status?: string) => {
    const payload = { ...form, status: status ?? form.status }
    onSave(payload)
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 text-sm">← Pages</button>
          <h1 className="text-xl font-bold text-gray-900">{mode === 'create' ? 'Add New Page' : 'Edit Page'}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleSave('draft')} disabled={saving || !form.title}
            className="border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition">
            Save Draft
          </button>
          <button onClick={() => handleSave('published')} disabled={saving || !form.title}
            className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition">
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <div className="flex gap-6">
        {/* Main editor column */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Title */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <input
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Page Title"
              className="w-full text-2xl font-bold placeholder-gray-300 focus:outline-none border-0"
            />
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
              <span>URL: /p/</span>
              <input
                value={form.slug}
                onChange={e => { slugManual.current = true; set('slug', e.target.value) }}
                className="border rounded px-2 py-0.5 text-gray-600 focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="page-slug"
              />
              {form.slug && (
                <a href={`/p/${form.slug}`} target="_blank" rel="noopener noreferrer"
                  className="text-blue-500 hover:underline">Preview ↗</a>
              )}
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center border-b px-4 pt-3 gap-4">
              <button onClick={() => setActiveTab('visual')}
                className={`pb-2.5 text-sm font-medium border-b-2 transition ${activeTab === 'visual' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
                Visual
              </button>
              <button onClick={() => setActiveTab('html')}
                className={`pb-2.5 text-sm font-medium border-b-2 transition ${activeTab === 'html' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
                HTML
              </button>
            </div>

            {/* Toolbar (visual only) */}
            {activeTab === 'visual' && (
              <div className="flex items-center gap-1 px-4 py-2 border-b bg-gray-50 flex-wrap">
                <select onChange={e => execCmd('formatBlock', e.target.value)}
                  className="border rounded px-2 py-1 text-xs focus:outline-none mr-2">
                  {HEADING_CMDS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                </select>
                {TOOLBAR.map(t => (
                  <button key={t.cmd} type="button" title={t.title} onMouseDown={e => { e.preventDefault(); execCmd(t.cmd) }}
                    className={`w-8 h-7 border rounded text-xs hover:bg-gray-200 transition ${t.style}`}>
                    {t.icon}
                  </button>
                ))}
                <button type="button" title="Insert Link" onMouseDown={e => { e.preventDefault(); const url = prompt('URL:'); if (url) execCmd('createLink', url) }}
                  className="px-2 h-7 border rounded text-xs hover:bg-gray-200 transition">
                  🔗 Link
                </button>
                <button type="button" title="Insert Image" onMouseDown={e => { e.preventDefault(); const url = prompt('Image URL:'); if (url) execCmd('insertImage', url) }}
                  className="px-2 h-7 border rounded text-xs hover:bg-gray-200 transition">
                  🖼 Image
                </button>
                <button type="button" title="Horizontal Rule" onMouseDown={e => { e.preventDefault(); execCmd('insertHorizontalRule') }}
                  className="px-2 h-7 border rounded text-xs hover:bg-gray-200 transition">
                  ─ HR
                </button>
              </div>
            )}

            {/* Editor area */}
            {activeTab === 'visual' ? (
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={syncFromVisual}
                dangerouslySetInnerHTML={{ __html: form.content }}
                className="min-h-[400px] p-5 focus:outline-none prose prose-sm max-w-none [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_a]:text-blue-600 [&_a]:underline [&_img]:max-w-full [&_img]:rounded"
              />
            ) : (
              <textarea
                value={form.content}
                onChange={e => set('content', e.target.value)}
                placeholder="<p>Write your HTML content here...</p>"
                className="w-full min-h-[400px] p-5 font-mono text-sm focus:outline-none resize-y"
              />
            )}
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Excerpt</h3>
            <textarea rows={3} value={form.excerpt} onChange={e => set('excerpt', e.target.value)}
              placeholder="Short description of this page (optional)"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" />
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button onClick={() => setShowSeo(!showSeo)}
              className="w-full flex items-center justify-between p-5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
              <span>SEO Settings</span>
              <span className="text-gray-400 text-xs">{showSeo ? '▲ Hide' : '▼ Show'}</span>
            </button>
            {showSeo && (
              <div className="px-5 pb-5 space-y-3 border-t">
                <div className="pt-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Meta Title</label>
                  <input value={form.metaTitle} onChange={e => set('metaTitle', e.target.value)}
                    placeholder={form.title}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Meta Description</label>
                  <textarea rows={2} value={form.metaDesc} onChange={e => set('metaDesc', e.target.value)}
                    placeholder="Search engine description"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-64 flex-shrink-0 space-y-4">
          {/* Publish box */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">Publish</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Template</label>
                <select value={form.template} onChange={e => set('template', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                  <option value="default">Default</option>
                  <option value="full-width">Full Width</option>
                  <option value="landing">Landing Page</option>
                </select>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t flex flex-col gap-2">
              <button onClick={() => handleSave('published')} disabled={saving || !form.title}
                className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-800 transition">
                {saving ? 'Saving...' : mode === 'create' ? 'Publish' : 'Update'}
              </button>
              <button onClick={() => handleSave('draft')} disabled={saving || !form.title}
                className="w-full border py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition">
                Save Draft
              </button>
            </div>
          </div>

          {/* Page URL */}
          {form.slug && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Page URL</h3>
              <p className="text-xs text-gray-600 break-all font-mono">/p/{form.slug}</p>
              <a href={`/p/${form.slug}`} target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline mt-1 block">
                View page ↗
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
