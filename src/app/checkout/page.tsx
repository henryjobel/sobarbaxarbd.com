'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { ordersApi, couponsApi } from '@/lib/api'
import { useSearchParams } from 'next/navigation'

const Checkout = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const discountParam = Number(searchParams.get('discount') || 0)
    const shipParam = Number(searchParams.get('ship') || 0)

    const { cartState, clearCart } = useCart()
    const { user } = useAuth()
    const [activePayment, setActivePayment] = useState<string>('credit-card')

    // Form state
    const [firstName, setFirstName] = useState(user?.firstName ?? '')
    const [lastName, setLastName] = useState(user?.lastName ?? '')
    const [email, setEmail] = useState(user?.email ?? '')
    const [phone, setPhone] = useState(user?.phone ?? '')
    const [country, setCountry] = useState('')
    const [city, setCity] = useState('')
    const [street, setStreet] = useState('')
    const [postalCode, setPostalCode] = useState('')
    const [note, setNote] = useState('')
    const [couponCode, setCouponCode] = useState('')
    const [couponDiscount, setCouponDiscount] = useState(0)
    const [couponError, setCouponError] = useState('')

    // Submit state
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')

    const totalCart = cartState.cartArray.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const totalWithShipping = totalCart - couponDiscount - discountParam + shipParam

    const handlePayment = (item: string) => setActivePayment(item)

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return
        setCouponError('')
        try {
            const result = await couponsApi.validate(couponCode.trim(), totalCart)
            setCouponDiscount(result.discount)
        } catch (err: unknown) {
            setCouponError(err instanceof Error ? err.message : 'Invalid coupon')
            setCouponDiscount(0)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (cartState.cartArray.length === 0) {
            setSubmitError('Your cart is empty.')
            return
        }
        setSubmitting(true)
        setSubmitError('')
        try {
            const items = cartState.cartArray.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price,
                selectedSize: item.selectedSize || undefined,
                selectedColor: item.selectedColor || undefined,
            }))
            const order = await ordersApi.create({
                items,
                firstName,
                lastName,
                email,
                phone,
                country,
                city,
                street,
                postalCode,
                note,
                couponCode: couponCode || undefined,
                shipping: shipParam,
                paymentMethod: activePayment,
            })
            clearCart()
            router.push(`/my-account?tab=orders&orderId=${order.id}`)
        } catch (err: unknown) {
            setSubmitError(err instanceof Error ? err.message : 'Failed to place order.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Shopping cart' subHeading='Shopping cart' />
            </div>
            <div className="cart-block md:py-20 py-10">
                <div className="container">
                    <div className="content-main flex justify-between">
                        <div className="left w-1/2">
                            {user ? (
                                <div className="login bg-surface py-3 px-4 flex items-center gap-3 rounded-lg">
                                    <Icon.CheckCircle size={20} className="text-green-600" weight="fill" />
                                    <span className="text-on-surface-variant1">Logged in as </span>
                                    <span className="text-button text-on-surface">{user.email}</span>
                                </div>
                            ) : (
                                <div className="login bg-surface py-3 px-4 flex items-center justify-between rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="text-on-surface-variant1">Already have an account?</span>
                                        <Link href="/login" className="text-button text-on-surface hover-underline">Login</Link>
                                    </div>
                                    <Icon.CaretRight size={18} />
                                </div>
                            )}
                            <div className="information mt-5">
                                <div className="heading5">Information</div>
                                {submitError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-3 text-sm">{submitError}</div>
                                )}
                                <div className="form-checkout mt-5">
                                    <form onSubmit={handleSubmit}>
                                        <div className="grid sm:grid-cols-2 gap-4 gap-y-5 flex-wrap">
                                            <div className="">
                                                <input className="border-line px-4 py-3 w-full rounded-lg" id="firstName" type="text" placeholder="First Name *" required value={firstName} onChange={e => setFirstName(e.target.value)} />
                                            </div>
                                            <div className="">
                                                <input className="border-line px-4 py-3 w-full rounded-lg" id="lastName" type="text" placeholder="Last Name *" required value={lastName} onChange={e => setLastName(e.target.value)} />
                                            </div>
                                            <div className="">
                                                <input className="border-line px-4 py-3 w-full rounded-lg" id="email" type="email" placeholder="Email Address *" required value={email} onChange={e => setEmail(e.target.value)} />
                                            </div>
                                            <div className="">
                                                <input className="border-line px-4 py-3 w-full rounded-lg" id="phoneNumber" type="text" placeholder="Phone Numbers *" required value={phone} onChange={e => setPhone(e.target.value)} />
                                            </div>
                                            <div className="col-span-full select-block">
                                                <select className="border border-line px-4 py-3 w-full rounded-lg" id="region" name="region" value={country} onChange={e => setCountry(e.target.value)} required>
                                                    <option value="" disabled>Choose Country/Region</option>
                                                    <option value="US">United States</option>
                                                    <option value="UK">United Kingdom</option>
                                                    <option value="IN">India</option>
                                                    <option value="FR">France</option>
                                                    <option value="SG">Singapore</option>
                                                    <option value="BD">Bangladesh</option>
                                                </select>
                                                <Icon.CaretDown className='arrow-down' />
                                            </div>
                                            <div className="">
                                                <input className="border-line px-4 py-3 w-full rounded-lg" id="city" type="text" placeholder="Town/City *" required value={city} onChange={e => setCity(e.target.value)} />
                                            </div>
                                            <div className="">
                                                <input className="border-line px-4 py-3 w-full rounded-lg" id="apartment" type="text" placeholder="Street,..." required value={street} onChange={e => setStreet(e.target.value)} />
                                            </div>
                                            <div className="">
                                                <input className="border-line px-4 py-3 w-full rounded-lg" id="postal" type="text" placeholder="Postal Code *" required value={postalCode} onChange={e => setPostalCode(e.target.value)} />
                                            </div>
                                            <div className="col-span-full">
                                                <textarea className="border border-line px-4 py-3 w-full rounded-lg" id="note" name="note" placeholder="Write note..." value={note} onChange={e => setNote(e.target.value)}></textarea>
                                            </div>
                                            <div className="col-span-full flex gap-3">
                                                <input className="border-line px-4 py-3 flex-1 rounded-lg" type="text" placeholder="Coupon code" value={couponCode} onChange={e => { setCouponCode(e.target.value); setCouponError('') }} />
                                                <button type="button" className="button-main px-6" onClick={handleApplyCoupon}>Apply</button>
                                            </div>
                                            {couponError && <p className="col-span-full text-red-500 text-sm mt-1">{couponError}</p>}
                                            {couponDiscount > 0 && <p className="col-span-full text-green-600 text-sm mt-1">Coupon applied: -${couponDiscount.toFixed(2)}</p>}
                                        </div>
                                        <div className="payment-block md:mt-10 mt-6">
                                            <div className="heading5">Choose payment Option:</div>
                                            <div className="list-payment mt-5">
                                                <div className={`type bg-surface p-5 border border-line rounded-lg ${activePayment === 'credit-card' ? 'open' : ''}`}>
                                                    <input className="cursor-pointer" type="radio" id="credit" name="payment" checked={activePayment === 'credit-card'} onChange={() => handlePayment('credit-card')} />
                                                    <label className="text-button pl-2 cursor-pointer" htmlFor="credit">Credit Card</label>
                                                    <div className="infor">
                                                        <div className="text-on-surface-variant1 pt-4">Make your payment directly into our bank account. Your order will not be shipped until the funds have cleared in our account.</div>
                                                        <div className="row">
                                                            <div className="col-12 mt-3">
                                                                <label htmlFor="cardNumberCredit">Card Numbers</label>
                                                                <input className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2" type="text" id="cardNumberCredit" placeholder="ex.1234567290" />
                                                            </div>
                                                            <div className=" mt-3">
                                                                <label htmlFor="dateCredit">Date</label>
                                                                <input className="border-line px-4 py-3 w-full rounded mt-2" type="date" id="dateCredit" name="date" />
                                                            </div>
                                                            <div className=" mt-3">
                                                                <label htmlFor="ccvCredit">CCV</label>
                                                                <input className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2" type="text" id="ccvCredit" placeholder="****" />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-3">
                                                            <input type="checkbox" id="saveCredit" name="save" />
                                                            <label className="text-button" htmlFor="saveCredit">Save Card Details</label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`type bg-surface p-5 border border-line rounded-lg mt-5 ${activePayment === 'cash-delivery' ? 'open' : ''}`}>
                                                    <input className="cursor-pointer" type="radio" id="delivery" name="payment" checked={activePayment === 'cash-delivery'} onChange={() => handlePayment('cash-delivery')} />
                                                    <label className="text-button pl-2 cursor-pointer" htmlFor="delivery">Cash on delivery</label>
                                                    <div className="infor">
                                                        <div className="text-on-surface-variant1 pt-4">Make your payment directly into our bank account. Your order will not be shipped until the funds have cleared in our account.</div>
                                                        <div className="row">
                                                            <div className="col-12 mt-3">
                                                                {/* <div className="bg-img"><Image src="assets/images/component/payment.png" alt="" /></div> */}
                                                                <label htmlFor="cardNumberDelivery">Card Numbers</label>
                                                                <input className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2" type="text" id="cardNumberDelivery" placeholder="ex.1234567290" />
                                                            </div>
                                                            <div className=" mt-3">
                                                                <label htmlFor="dateDelivery">Date</label>
                                                                <input className="border-line px-4 py-3 w-full rounded mt-2" type="date" id="dateDelivery" name="date" />
                                                            </div>
                                                            <div className=" mt-3">
                                                                <label htmlFor="ccvDelivery">CCV</label>
                                                                <input className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2" type="text" id="ccvDelivery" placeholder="****" />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-3">
                                                            <input type="checkbox" id="saveDelivery" name="save" />
                                                            <label className="text-button" htmlFor="saveDelivery">Save Card Details</label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`type bg-surface p-5 border border-line rounded-lg mt-5 ${activePayment === 'apple-pay' ? 'open' : ''}`}>
                                                    <input className="cursor-pointer" type="radio" id="apple" name="payment" checked={activePayment === 'apple-pay'} onChange={() => handlePayment('apple-pay')} />
                                                    <label className="text-button pl-2 cursor-pointer" htmlFor="apple">Apple Pay</label>
                                                    <div className="infor">
                                                        <div className="text-on-surface-variant1 pt-4">Make your payment directly into our bank account. Your order will not be shipped until the funds have cleared in our account.</div>
                                                        <div className="row">
                                                            <div className="col-12 mt-3">
                                                                {/* <div className="bg-img"><Image src="assets/images/component/payment.png" alt="" /></div> */}
                                                                <label htmlFor="cardNumberApple">Card Numbers</label>
                                                                <input className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2" type="text" id="cardNumberApple" placeholder="ex.1234567290" />
                                                            </div>
                                                            <div className=" mt-3">
                                                                <label htmlFor="dateApple">Date</label>
                                                                <input className="border-line px-4 py-3 w-full rounded mt-2" type="date" id="dateApple" name="date" />
                                                            </div>
                                                            <div className=" mt-3">
                                                                <label htmlFor="ccvApple">CCV</label>
                                                                <input className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2" type="text" id="ccvApple" placeholder="****" />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-3">
                                                            <input type="checkbox" id="saveApple" name="save" />
                                                            <label className="text-button" htmlFor="saveApple">Save Card Details</label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`type bg-surface p-5 border border-line rounded-lg mt-5 ${activePayment === 'paypal' ? 'open' : ''}`}>
                                                    <input className="cursor-pointer" type="radio" id="paypal" name="payment" checked={activePayment === 'paypal'} onChange={() => handlePayment('paypal')} />
                                                    <label className="text-button pl-2 cursor-pointer" htmlFor="paypal">PayPal</label>
                                                    <div className="infor">
                                                        <div className="text-on-surface-variant1 pt-4">Make your payment directly into our bank account. Your order will not be shipped until the funds have cleared in our account.</div>
                                                        <div className="row">
                                                            <div className="col-12 mt-3">
                                                                <label htmlFor="cardNumberPaypal">Card Numbers</label>
                                                                <input className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2" type="text" id="cardNumberPaypal" placeholder="ex.1234567290" />
                                                            </div>
                                                            <div className=" mt-3">
                                                                <label htmlFor="datePaypal">Date</label>
                                                                <input className="border-line px-4 py-3 w-full rounded mt-2" type="date" id="datePaypal" name="date" />
                                                            </div>
                                                            <div className=" mt-3">
                                                                <label htmlFor="ccvPaypal">CCV</label>
                                                                <input className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2" type="text" id="ccvPaypal" placeholder="****" />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-3">
                                                            <input type="checkbox" id="savePaypal" name="save" />
                                                            <label className="text-button" htmlFor="savePaypal">Save Card Details</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="block-button md:mt-10 mt-6">
                                            <button type="submit" className="button-main w-full" disabled={submitting}>
                                                {submitting ? 'Placing Order...' : 'Place Order'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                        </div>
                        <div className="right w-5/12">
                            <div className="checkout-block">
                                <div className="heading5 pb-3">Your Order</div>
                                <div className="list-product-checkout">
                                    {cartState.cartArray.length < 1 ? (
                                        <p className='text-button pt-3'>No product in cart</p>
                                    ) : (
                                        cartState.cartArray.map((product) => (
                                            <>
                                                <div className="item flex items-center justify-between w-full pb-5 border-b border-line gap-6 mt-5">
                                                    <div className="bg-img w-[100px] aspect-square flex-shrink-0 rounded-lg overflow-hidden">
                                                        <Image
                                                            src={product.thumbImage[0]}
                                                            width={500}
                                                            height={500}
                                                            alt='img'
                                                            className='w-full h-full'
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between w-full">
                                                        <div>
                                                            <div className="name text-title">{product.name}</div>
                                                            <div className="caption1 text-secondary mt-2">
                                                                <span className='size capitalize'>{product.selectedSize || product.sizes[0]}</span>
                                                                <span>/</span>
                                                                <span className='color capitalize'>{product.selectedColor || product.variation[0].color}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-title">
                                                            <span className='quantity'>{product.quantity}</span>
                                                            <span className='px-1'>x</span>
                                                            <span>
                                                                ${product.price}.00
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ))
                                    )}
                                </div>
                                <div className="discount-block py-5 flex justify-between border-b border-line">
                                    <div className="text-title">Discounts</div>
                                    <div className="text-title">-${(couponDiscount + discountParam).toFixed(2)}</div>
                                </div>
                                <div className="ship-block py-5 flex justify-between border-b border-line">
                                    <div className="text-title">Shipping</div>
                                    <div className="text-title">{shipParam === 0 ? 'Free' : `$${shipParam.toFixed(2)}`}</div>
                                </div>
                                <div className="total-cart-block pt-5 flex justify-between">
                                    <div className="heading5">Total</div>
                                    <div className="heading5 total-cart">${totalWithShipping.toFixed(2)}</div>
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

export default Checkout