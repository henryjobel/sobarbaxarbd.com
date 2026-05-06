import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'

interface Props { params: Promise<{ slug: string }> }

async function getPage(slug: string) {
  try {
    return await prisma.page.findUnique({ where: { slug } })
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return { title: 'Page Not Found' }
  return {
    title: page.metaTitle || page.title,
    description: page.metaDesc || page.excerpt || '',
  }
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params
  const page = await getPage(slug)

  if (!page || page.status !== 'published') notFound()

  const isFullWidth = page.template === 'full-width'
  const isLanding = page.template === 'landing'

  if (isLanding) {
    return (
      <>
        <div id="header" className="relative w-full">
          <MenuOne props="bg-transparent" />
        </div>
        {page.content && (
          <div
            className="page-content"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}
        <Footer />
      </>
    )
  }

  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading={page.title} subHeading={page.title} />
      </div>
      <div className={`py-14 ${isFullWidth ? '' : 'container'}`}>
        {isFullWidth ? (
          page.content && (
            <div
              className="page-content prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          )
        ) : (
          <div className="max-w-3xl mx-auto">
            {page.excerpt && (
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">{page.excerpt}</p>
            )}
            {page.content ? (
              <div
                className="page-content prose prose-lg max-w-none [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-2 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_a]:text-blue-600 [&_a]:underline [&_img]:rounded-lg [&_img]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_hr]:my-8"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            ) : (
              <p className="text-gray-400">This page has no content yet.</p>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
