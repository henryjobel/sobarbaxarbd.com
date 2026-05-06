'use client'
import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token') ?? ''

    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (!token) { setError('Invalid or missing reset token.'); return }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
        if (password !== confirm) { setError('Passwords do not match.'); return }

        setLoading(true)
        try {
            const res = await fetch('/api/v1/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            })
            const data = await res.json()
            if (data.success) {
                setSuccess('Password reset successfully! Redirecting to login...')
                setTimeout(() => router.push('/login'), 2000)
            } else {
                setError(data.message || 'Failed to reset password.')
            }
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="text-center py-10">
                <p className="text-red-600 mb-4">Invalid reset link. Please request a new one.</p>
                <Link href="/forgot-password" className="button-main">Request New Link</Link>
            </div>
        )
    }

    return (
        <form className="md:mt-7 mt-4" onSubmit={handleSubmit}>
            {error && <div className="error-message text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-lg">{error}</div>}
            {success && <div className="text-green-600 text-sm mb-4 p-3 bg-green-50 rounded-lg">{success}</div>}
            <div className="mb-4">
                <label className="caption1 mb-2 block">New Password *</label>
                <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                    type="password"
                    placeholder="Minimum 6 characters"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label className="caption1 mb-2 block">Confirm New Password *</label>
                <input
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                    type="password"
                    placeholder="Repeat password"
                    required
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                />
            </div>
            <div className="block-button md:mt-7 mt-4">
                <button className="button-main" type="submit" disabled={loading}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
            </div>
            <div className="mt-4">
                <Link href="/login" className="text-sm text-secondary hover:text-black hover-underline">Back to Login</Link>
            </div>
        </form>
    )
}

const ResetPassword = () => {
    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Reset Password' subHeading='Reset Password' />
            </div>
            <div className="forgot-pass md:py-20 py-10">
                <div className="container">
                    <div className="content-main flex gap-y-8 max-md:flex-col">
                        <div className="left md:w-1/2 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
                            <div className="heading4">Set New Password</div>
                            <div className="body1 mt-2">Enter and confirm your new password below.</div>
                            <Suspense fallback={<div className="mt-7 text-secondary">Loading...</div>}>
                                <ResetPasswordForm />
                            </Suspense>
                        </div>
                        <div className="right md:w-1/2 w-full lg:pl-[60px] md:pl-[40px] flex items-center">
                            <div className="text-content">
                                <div className="heading4">Remember your password?</div>
                                <div className="mt-2 text-secondary">Go back to login and sign in with your existing credentials.</div>
                                <div className="block-button md:mt-7 mt-4">
                                    <Link href="/login" className="button-main">Back to Login</Link>
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

export default ResetPassword
