'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import * as Icon from "@phosphor-icons/react/dist/ssr"
import { useCMS } from '@/context/CMSContext'

const Footer = () => {
    const { global, footerMenu } = useCMS()

    const logoText = global.logo_text || 'Anvogue'
    const email = global.contact_email || 'hi.avitex@gmail.com'
    const phone = global.contact_phone || '1-333-345-6868'
    const address = global.contact_address || '549 Oak St. Crystal Lake, IL 60014'
    const copyright = global.footer_copyright || `©${new Date().getFullYear()} Anvogue. All Rights Reserved.`
    const aboutText = global.footer_about || 'Sign up for our newsletter and get 10% off your first purchase'
    const fb = global.footer_facebook || 'https://www.facebook.com/'
    const ig = global.footer_instagram || 'https://www.instagram.com/'
    const tw = global.footer_twitter || 'https://www.twitter.com/'
    const yt = global.footer_youtube || 'https://www.youtube.com/'

    // Split footer menu into groups of ~5 for columns
    const col1Default = [
        { label: 'Contact us', url: '/p/contact' },
        { label: 'My Account', url: '/my-account' },
        { label: 'Order & Returns', url: '/order-tracking' },
        { label: 'FAQs', url: '/p/faq' },
    ]
    const col2Default = [
        { label: 'Women', url: '/shop/breadcrumb1' },
        { label: 'Men', url: '/shop/breadcrumb1' },
        { label: 'Accessories', url: '/shop/breadcrumb1' },
        { label: 'Blog', url: '/blog' },
    ]
    const col3Default = [
        { label: 'Shipping Info', url: '/p/shipping' },
        { label: 'Privacy Policy', url: '/p/privacy' },
        { label: 'Return & Refund', url: '/order-tracking' },
    ]

    // If CMS footer menu has items, split into 3 columns; else use defaults
    const hasCMSFooter = footerMenu.length > 0
    const col1 = hasCMSFooter ? footerMenu.slice(0, Math.ceil(footerMenu.length / 3)) : col1Default
    const col2 = hasCMSFooter ? footerMenu.slice(Math.ceil(footerMenu.length / 3), Math.ceil(footerMenu.length * 2 / 3)) : col2Default
    const col3 = hasCMSFooter ? footerMenu.slice(Math.ceil(footerMenu.length * 2 / 3)) : col3Default

    return (
        <>
            <div id="footer" className='footer'>
                <div className="footer-main bg-surface">
                    <div className="container">
                        <div className="content-footer py-[60px] flex justify-between flex-wrap gap-y-8">
                            <div className="company-infor basis-1/4 max-lg:basis-full pr-7">
                                <Link href={'/'} className="logo">
                                    {global.logo_image ? (
                                        <Image src={global.logo_image} alt={logoText} width={120} height={40} unoptimized />
                                    ) : (
                                        <div className="heading4">{logoText}</div>
                                    )}
                                </Link>
                                {global.tagline && (
                                    <p className="caption1 text-secondary mt-1">{global.tagline}</p>
                                )}
                                <div className='flex gap-3 mt-3'>
                                    <div className="flex flex-col">
                                        <span className="text-button">Mail:</span>
                                        <span className="text-button mt-3">Phone:</span>
                                        <span className="text-button mt-3">Address:</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className=''>{email}</span>
                                        <span className='mt-3'>{phone}</span>
                                        <span className='mt-3 pt-px'>{address}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="right-content flex flex-wrap gap-y-8 basis-3/4 max-lg:basis-full">
                                <div className="list-nav flex justify-between basis-2/3 max-md:basis-full gap-4">
                                    {/* Column 1 */}
                                    <div className="item flex flex-col basis-1/3">
                                        <div className="text-button-uppercase pb-3">Information</div>
                                        {col1.map((item, i) => (
                                            <Link key={i}
                                                className='caption1 has-line-before duration-300 w-fit pt-2 first:pt-0'
                                                href={'url' in item ? item.url : (item as {url:string}).url}
                                                target={'target' in item && (item as {target:string}).target !== '_self' ? '_blank' : undefined}>
                                                {'label' in item ? item.label : ''}
                                            </Link>
                                        ))}
                                    </div>
                                    {/* Column 2 */}
                                    <div className="item flex flex-col basis-1/3">
                                        <div className="text-button-uppercase pb-3">Quick Shop</div>
                                        {col2.map((item, i) => (
                                            <Link key={i}
                                                className='caption1 has-line-before duration-300 w-fit pt-2 first:pt-0'
                                                href={'url' in item ? item.url : (item as {url:string}).url}>
                                                {'label' in item ? item.label : ''}
                                            </Link>
                                        ))}
                                    </div>
                                    {/* Column 3 */}
                                    <div className="item flex flex-col basis-1/3">
                                        <div className="text-button-uppercase pb-3">Customer Services</div>
                                        {col3.map((item, i) => (
                                            <Link key={i}
                                                className='caption1 has-line-before duration-300 w-fit pt-2 first:pt-0'
                                                href={'url' in item ? item.url : (item as {url:string}).url}>
                                                {'label' in item ? item.label : ''}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                                <div className="newsletter basis-1/3 pl-7 max-md:basis-full max-md:pl-0">
                                    <div className="text-button-uppercase">Newsletter</div>
                                    <div className="caption1 mt-3">{aboutText}</div>
                                    <div className="input-block w-full h-[52px] mt-4">
                                        <form className='w-full h-full relative' onSubmit={e => e.preventDefault()}>
                                            <input type="email" placeholder='Enter your e-mail' className='caption1 w-full h-full pl-4 pr-14 rounded-xl border border-line' required />
                                            <button type="submit" className='w-[44px] h-[44px] bg-black flex items-center justify-center rounded-xl absolute top-1 right-1'>
                                                <Icon.ArrowRight size={24} color='#fff' />
                                            </button>
                                        </form>
                                    </div>
                                    <div className="list-social flex items-center gap-6 mt-4">
                                        {fb && <Link href={fb} target='_blank'><div className="icon-facebook text-2xl text-black"></div></Link>}
                                        {ig && <Link href={ig} target='_blank'><div className="icon-instagram text-2xl text-black"></div></Link>}
                                        {tw && <Link href={tw} target='_blank'><div className="icon-twitter text-2xl text-black"></div></Link>}
                                        {yt && <Link href={yt} target='_blank'><div className="icon-youtube text-2xl text-black"></div></Link>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="footer-bottom py-3 flex items-center justify-between gap-5 max-lg:justify-center max-lg:flex-col border-t border-line">
                            <div className="left flex items-center gap-8">
                                <div className="copyright caption1 text-secondary">{copyright}</div>
                                <div className="select-block flex items-center gap-5 max-md:hidden">
                                    <div className="choose-language flex items-center gap-1.5">
                                        <select name="language" className='caption2 bg-transparent'>
                                            <option>English</option>
                                            <option>Espana</option>
                                            <option>France</option>
                                        </select>
                                        <Icon.CaretDown size={12} color='#1F1F1F' />
                                    </div>
                                </div>
                            </div>
                            <div className="right flex items-center gap-2">
                                <div className="caption1 text-secondary">Payment:</div>
                                {[0,1,2,3,4,5].map(n => (
                                    <div key={n} className="payment-img">
                                        <Image src={`/images/payment/Frame-${n}.png`} width={500} height={500} alt='payment' className='w-9' />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Footer
