'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { Order } from '@/lib/api'

const OrderTracking = () => {
    const [orderId, setOrderId] = useState('')
    const [loading, setLoading] = useState(false)
    const [order, setOrder] = useState<Order | null>(null)
    const [errorMsg, setErrorMsg] = useState('')

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMsg('')
        setOrder(null)
        if (!orderId.trim()) return
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
        if (!token) { setErrorMsg('Please log in to track your order.'); return }
        setLoading(true)
        try {
            const res = await fetch(`/api/v1/orders/${orderId.trim()}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) {
                const data = await res.json()
                setErrorMsg(data?.error ?? 'Order not found. Please check the ID and try again.')
                return
            }
            const { data } = await res.json()
            setOrder(data)
        } catch {
            setErrorMsg('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const statusSteps = ['pending', 'processing', 'shipped', 'delivered']
    const currentStep = order ? statusSteps.indexOf(order.status.toLowerCase()) : -1

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Order Tracking' subHeading='Order Tracking' />
            </div>
            <div className="order-tracking md:py-20 py-10">
                <div className="container">
                    <div className="content-main flex gap-y-8 max-md:flex-col">
                        <div className="left md:w-1/2 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
                            <div className="heading4">Track Your Order</div>
                            <div className="mt-2 text-secondary">Enter your Order ID below to get real-time tracking updates.</div>
                            <form className="md:mt-7 mt-4" onSubmit={handleTrack}>
                                {errorMsg && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{errorMsg}</div>
                                )}
                                <div className="order-id">
                                    <label className="caption1 mb-2 block">Order ID <span className="text-red">*</span></label>
                                    <input
                                        className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                                        type="text"
                                        placeholder="Enter your full Order ID"
                                        value={orderId}
                                        onChange={e => setOrderId(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="block-button md:mt-7 mt-4">
                                    <button type="submit" className="button-main" disabled={loading}>
                                        {loading ? 'Tracking...' : 'Track Order'}
                                    </button>
                                </div>
                            </form>

                            {order && (
                                <div className="order-result mt-8 border border-line rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-5">
                                        <h6 className="heading6">Order #{order.id.slice(-10).toUpperCase()}</h6>
                                        <span className="tag px-4 py-1.5 rounded-full caption1 font-semibold capitalize bg-yellow bg-opacity-10 text-yellow">
                                            {order.status}
                                        </span>
                                    </div>

                                    {!['cancelled', 'completed'].includes(order.status.toLowerCase()) && (
                                        <div className="progress-steps flex items-center gap-2 mb-6">
                                            {statusSteps.map((step, i) => (
                                                <React.Fragment key={step}>
                                                    <div className="step flex flex-col items-center gap-1 flex-1">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i < currentStep ? 'bg-black text-white' : i === currentStep ? 'border-2 border-black' : 'border border-line bg-surface'}`}>
                                                            {i < currentStep ? <Icon.Check weight="bold" size={14} /> : i + 1}
                                                        </div>
                                                        <span className="caption2 capitalize text-center hidden sm:block">{step}</span>
                                                    </div>
                                                    {i < statusSteps.length - 1 && (
                                                        <div className={`h-0.5 flex-1 mb-5 ${i < currentStep ? 'bg-black' : 'bg-line'}`} />
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    )}

                                    <div className="items border-t border-line pt-4">
                                        {order.items?.map((item, i) => (
                                            <div key={i} className="flex items-center gap-4 py-3 border-b border-line last:border-0">
                                                <Image
                                                    src={item.product?.images?.[0] || '/images/product/1000x1000.png'}
                                                    width={60} height={60}
                                                    alt={item.product?.name ?? ''}
                                                    className="w-14 h-14 rounded object-cover flex-shrink-0"
                                                />
                                                <div className="flex-1">
                                                    <div className="text-button">{item.product?.name}</div>
                                                    <div className="caption1 text-secondary">{item.quantity} x ${item.price.toFixed(2)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-line">
                                        <strong className="text-title">Total</strong>
                                        <strong className="text-title">${order.total.toFixed(2)}</strong>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="right md:w-1/2 w-full lg:pl-[60px] md:pl-[40px] flex items-center">
                            <div className="text-content">
                                <div className="heading4">Already have an account?</div>
                                <div className="mt-2 text-secondary">Sign in to view all your orders, track shipments, and manage your account easily.</div>
                                <div className="block-button md:mt-7 mt-4">
                                    <Link href={'/login'} className="button-main">Login</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default OrderTracking
