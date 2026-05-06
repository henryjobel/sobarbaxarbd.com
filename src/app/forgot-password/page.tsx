'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { authApi } from '@/lib/api'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)
        try {
            await authApi.forgotPassword(email)
            setSuccess('If an account with that email exists, a reset link has been sent.')
            setEmail('')
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Forget your password' subHeading='Forget your password' />
            </div>
            <div className="forgot-pass md:py-20 py-10">
                <div className="container">
                    <div className="content-main flex gap-y-8 max-md:flex-col">
                        <div className="left md:w-1/2 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
                            <div className="heading4">Reset your password</div>
                            <div className="body1 mt-2">We will send you an email to reset your password</div>
                            <form className="md:mt-7 mt-4" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="error-message text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-lg">{error}</div>
                                )}
                                {success && (
                                    <div className="success-message text-green-600 text-sm mb-4 p-3 bg-green-50 rounded-lg">{success}</div>
                                )}
                                <div className="email ">
                                    <input
                                        className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                                        id="username"
                                        type="email"
                                        placeholder="Username or email address *"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="block-button md:mt-7 mt-4">
                                    <button className="button-main" type="submit" disabled={loading}>
                                        {loading ? 'Sending...' : 'Submit'}
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="right md:w-1/2 w-full lg:pl-[60px] md:pl-[40px] flex items-center">
                            <div className="text-content">
                                <div className="heading4">New Customer</div>
                                <div className="mt-2 text-secondary">Be part of our growing family of new customers! Join us today and unlock a world of exclusive benefits, offers, and personalized experiences.</div>
                                <div className="block-button md:mt-7 mt-4">
                                    <Link href={'/register'} className="button-main">Register</Link>
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

export default ForgotPassword