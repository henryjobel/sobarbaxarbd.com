'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import { useAuth } from '@/context/AuthContext'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { ordersApi, Order, addressesApi, Address } from '@/lib/api'

const MyAccount = () => {
    const router = useRouter()
    const { user, isLoading, logout, updateProfile } = useAuth()
    const [activeTab, setActiveTab] = useState<string | undefined>('dashboard')
    const [activeAddress, setActiveAddress] = useState<string | null>('billing')
    const [activeOrders, setActiveOrders] = useState<string | undefined>('all')
    const [openDetail, setOpenDetail] = useState<boolean | undefined>(false)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [orders, setOrders] = useState<Order[]>([])
    const [ordersLoading, setOrdersLoading] = useState(false)
    // Settings form state
    const [firstName, setFirstName] = useState(user?.firstName ?? '')
    const [lastName, setLastName] = useState(user?.lastName ?? '')
    const [phone, setPhone] = useState(user?.phone ?? '')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [settingsError, setSettingsError] = useState('')
    const [settingsSuccess, setSettingsSuccess] = useState('')
    const [settingsLoading, setSettingsLoading] = useState(false)

    // Address state – billing
    const [billingId, setBillingId] = useState<string | null>(null)
    const [billingFirstName, setBillingFirstName] = useState('')
    const [billingLastName, setBillingLastName] = useState('')
    const [billingCountry, setBillingCountry] = useState('')
    const [billingStreet, setBillingStreet] = useState('')
    const [billingCity, setBillingCity] = useState('')
    const [billingState, setBillingState] = useState('')
    const [billingZip, setBillingZip] = useState('')
    const [billingPhone, setBillingPhone] = useState('')
    // Address state – shipping
    const [shippingId, setShippingId] = useState<string | null>(null)
    const [shippingFirstName, setShippingFirstName] = useState('')
    const [shippingLastName, setShippingLastName] = useState('')
    const [shippingCountry, setShippingCountry] = useState('')
    const [shippingStreet, setShippingStreet] = useState('')
    const [shippingCity, setShippingCity] = useState('')
    const [shippingState, setShippingState] = useState('')
    const [shippingZip, setShippingZip] = useState('')
    const [shippingPhone, setShippingPhone] = useState('')
    const [addressLoading, setAddressLoading] = useState(false)
    const [addressError, setAddressError] = useState('')
    const [addressSuccess, setAddressSuccess] = useState('')

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login')
        }
    }, [isLoading, user, router])

    // Load addresses when user is authenticated
    useEffect(() => {
        if (!user) return
        addressesApi.getAll().then((list: Address[]) => {
            const billing = list[0] ?? null
            const shipping = list[1] ?? null
            if (billing) {
                setBillingId(billing.id)
                const parts = billing.name.split(' ')
                setBillingFirstName(parts[0] ?? '')
                setBillingLastName(parts.slice(1).join(' '))
                setBillingCountry(billing.country)
                setBillingStreet(billing.street)
                setBillingCity(billing.city)
                setBillingState(billing.state ?? '')
                setBillingZip(billing.postalCode ?? '')
                setBillingPhone(billing.phone ?? '')
            }
            if (shipping) {
                setShippingId(shipping.id)
                const parts = shipping.name.split(' ')
                setShippingFirstName(parts[0] ?? '')
                setShippingLastName(parts.slice(1).join(' '))
                setShippingCountry(shipping.country)
                setShippingStreet(shipping.street)
                setShippingCity(shipping.city)
                setShippingState(shipping.state ?? '')
                setShippingZip(shipping.postalCode ?? '')
                setShippingPhone(shipping.phone ?? '')
            }
        }).catch(() => {})
    }, [user])

    // Load orders when user is authenticated
    useEffect(() => {
        if (!user) return
        setOrdersLoading(true)
        ordersApi.getMine()
            .then(({ orders: data }) => setOrders(data))
            .catch(() => setOrders([]))
            .finally(() => setOrdersLoading(false))
    }, [user])

    // Sync form with user data when loaded
    useEffect(() => {
        if (user) {
            setFirstName(user.firstName ?? '')
            setLastName(user.lastName ?? '')
            setPhone(user.phone ?? '')
        }
    }, [user])

    const handleAddressSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setAddressError('')
        setAddressSuccess('')
        setAddressLoading(true)
        try {
            const makePayload = (fn: string, ln: string, phone: string, country: string, street: string, city: string, state: string, zip: string) => ({
                name: `${fn} ${ln}`.trim(),
                phone, country, street, city, state, postalCode: zip,
            })
            if (activeAddress === 'billing') {
                const payload = makePayload(billingFirstName, billingLastName, billingPhone, billingCountry, billingStreet, billingCity, billingState, billingZip)
                if (billingId) {
                    const updated = await addressesApi.update(billingId, payload)
                    setBillingId(updated.id)
                } else {
                    const created = await addressesApi.create({ ...payload, isDefault: true })
                    setBillingId(created.id)
                }
            } else {
                const payload = makePayload(shippingFirstName, shippingLastName, shippingPhone, shippingCountry, shippingStreet, shippingCity, shippingState, shippingZip)
                if (shippingId) {
                    const updated = await addressesApi.update(shippingId, payload)
                    setShippingId(updated.id)
                } else {
                    const created = await addressesApi.create({ ...payload })
                    setShippingId(created.id)
                }
            }
            setAddressSuccess('Address saved successfully.')
        } catch {
            setAddressError('Failed to save address. Please try again.')
        } finally {
            setAddressLoading(false)
        }
    }

    const handleActiveAddress = (order: string) => {
        setActiveAddress(prevOrder => prevOrder === order ? null : order)
    }

    const handleActiveOrders = (order: string) => {
        setActiveOrders(order)
    }

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            pending: 'bg-yellow text-yellow',
            processing: 'bg-yellow text-yellow',
            shipped: 'bg-purple text-purple',
            delivered: 'bg-success text-success',
            completed: 'bg-success text-success',
            cancelled: 'bg-red text-red',
            canceled: 'bg-red text-red',
        }
        const cls = map[status.toLowerCase()] ?? 'bg-line text-secondary'
        return <span className={`tag px-4 py-1.5 rounded-full bg-opacity-10 ${cls} caption1 font-semibold capitalize`}>{status}</span>
    }

    const filteredOrders = activeOrders === 'all'
        ? orders
        : orders.filter(o => o.status.toLowerCase() === activeOrders)

    const handleSettingsSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSettingsError('')
        setSettingsSuccess('')
        if (newPassword && newPassword !== confirmNewPassword) {
            setSettingsError('New passwords do not match.')
            return
        }
        setSettingsLoading(true)
        try {
            await updateProfile({
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                phone: phone || undefined,
                ...(newPassword ? { password: newPassword } : {}),
            })
            setSettingsSuccess('Profile updated successfully.')
            setNewPassword('')
            setConfirmNewPassword('')
        } catch (err: unknown) {
            setSettingsError(err instanceof Error ? err.message : 'Failed to update profile.')
        } finally {
            setSettingsLoading(false)
        }
    }

    if (isLoading || !user) {
        return null
    }

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='My Account' subHeading='My Account' />
            </div>
            <div className="profile-block md:py-20 py-10">
                <div className="container">
                    <div className="content-main flex gap-y-8 max-md:flex-col w-full">
                        <div className="left md:w-1/3 w-full xl:pr-[3.125rem] lg:pr-[28px] md:pr-[16px]">
                            <div className="user-infor bg-surface lg:px-7 px-4 lg:py-10 py-5 md:rounded-[20px] rounded-xl">
                                <div className="heading flex flex-col items-center justify-center">
                                    <div className="avatar">
                                        <Image
                                            src={'/images/avatar/1.png'}
                                            width={300}
                                            height={300}
                                            alt='avatar'
                                            className='md:w-[140px] w-[120px] md:h-[140px] h-[120px] rounded-full'
                                        />
                                    </div>
                                    <div className="name heading6 mt-4 text-center">{user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email : 'Guest'}</div>
                                    <div className="mail heading6 font-normal normal-case text-secondary text-center mt-1">{user?.email ?? ''}</div>
                                </div>
                                <div className="menu-tab w-full max-w-none lg:mt-10 mt-6">
                                    <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                                        <Icon.HouseLine size={20} />
                                        <strong className="heading6">Dashboard</strong>
                                    </Link>
                                    <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                                        <Icon.Package size={20} />
                                        <strong className="heading6">History Orders</strong>
                                    </Link>
                                    <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'address' ? 'active' : ''}`} onClick={() => setActiveTab('address')}>
                                        <Icon.Tag size={20} />
                                        <strong className="heading6">My Address</strong>
                                    </Link>
                                    <Link href={'#!'} scroll={false} className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === 'setting' ? 'active' : ''}`} onClick={() => setActiveTab('setting')}>
                                        <Icon.GearSix size={20} />
                                        <strong className="heading6">Setting</strong>
                                    </Link>
                                    <button onClick={logout} className="item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 text-left">
                                        <Icon.SignOut size={20} />
                                        <strong className="heading6">Logout</strong>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="right md:w-2/3 w-full pl-2.5">
                            <div className={`tab text-content w-full ${activeTab === 'dashboard' ? 'block' : 'hidden'}`}>
                                <div className="overview grid sm:grid-cols-3 gap-5">
                                    <div className="item flex items-center justify-between p-5 border border-line rounded-lg box-shadow-xs">
                                        <div className="counter">
                                            <span className="text-secondary">Awaiting Pickup</span>
                                            <h5 className="heading5 mt-1">{orders.filter(o => o.status === 'pending' || o.status === 'processing').length}</h5>
                                        </div>
                                        <Icon.HourglassMedium className='text-4xl' />
                                    </div>
                                    <div className="item flex items-center justify-between p-5 border border-line rounded-lg box-shadow-xs">
                                        <div className="counter">
                                            <span className="text-secondary">Cancelled Orders</span>
                                            <h5 className="heading5 mt-1">{orders.filter(o => o.status === 'cancelled').length}</h5>
                                        </div>
                                        <Icon.ReceiptX className='text-4xl' />
                                    </div>
                                    <div className="item flex items-center justify-between p-5 border border-line rounded-lg box-shadow-xs">
                                        <div className="counter">
                                            <span className="text-secondary">Total Number of Orders</span>
                                            <h5 className="heading5 mt-1">{orders.length}</h5>
                                        </div>
                                        <Icon.Package className='text-4xl' />
                                    </div>
                                </div>
                                <div className="recent_order pt-5 px-5 pb-2 mt-7 border border-line rounded-xl">
                                    <h6 className="heading6">Recent Orders</h6>
                                    <div className="list overflow-x-auto w-full mt-5">
                                        {ordersLoading ? (
                                            <p className="text-secondary py-4">Loading orders...</p>
                                        ) : orders.length === 0 ? (
                                            <p className="text-secondary py-4">No orders yet.</p>
                                        ) : (
                                            <table className="w-full max-[1400px]:w-[700px] max-md:w-[700px]">
                                                <thead className="border-b border-line">
                                                    <tr>
                                                        <th scope="col" className="pb-3 text-left text-sm font-bold uppercase text-secondary whitespace-nowrap">Order</th>
                                                        <th scope="col" className="pb-3 text-left text-sm font-bold uppercase text-secondary whitespace-nowrap">Products</th>
                                                        <th scope="col" className="pb-3 text-left text-sm font-bold uppercase text-secondary whitespace-nowrap">Pricing</th>
                                                        <th scope="col" className="pb-3 text-right text-sm font-bold uppercase text-secondary whitespace-nowrap">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orders.slice(0, 6).map((order, idx) => {
                                                        const firstItem = order.items?.[0]
                                                        const imgSrc = firstItem?.product?.images?.[0] || '/images/product/1000x1000.png'
                                                        return (
                                                            <tr key={order.id} className={`item duration-300 ${idx < 5 ? 'border-b border-line' : ''}`}>
                                                                <th scope="row" className="py-3 text-left">
                                                                    <strong className="text-title">{order.id.slice(-8).toUpperCase()}</strong>
                                                                </th>
                                                                <td className="py-3">
                                                                    <div className="product flex items-center gap-3">
                                                                        <Image src={imgSrc} width={400} height={400} alt={firstItem?.product?.name ?? ''} className="flex-shrink-0 w-12 h-12 rounded object-cover" />
                                                                        <div className="info flex flex-col">
                                                                            <strong className="product_name text-button">{firstItem?.product?.name ?? 'Product'}</strong>
                                                                            {order.items.length > 1 && <span className="product_tag caption1 text-secondary">+{order.items.length - 1} more</span>}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 price">${order.total.toFixed(2)}</td>
                                                                <td className="py-3 text-right">{statusBadge(order.status)}</td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className={`tab text-content overflow-hidden w-full p-7 border border-line rounded-xl ${activeTab === 'orders' ? 'block' : 'hidden'}`}>
                                <h6 className="heading6">Your Orders</h6>
                                <div className="w-full overflow-x-auto">
                                    <div className="menu-tab grid grid-cols-5 max-lg:w-[500px] border-b border-line mt-3">
                                        {['all', 'pending', 'processing', 'completed', 'cancelled'].map((item, index) => (
                                            <button
                                                key={index}
                                                className={`item relative px-3 py-2.5 text-secondary text-center duration-300 hover:text-black border-b-2 ${activeOrders === item ? 'active border-black' : 'border-transparent'}`}
                                                onClick={() => handleActiveOrders(item)}
                                            >
                                                <span className='relative text-button z-[1] capitalize'>
                                                    {item}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="list_order">
                                    {ordersLoading ? (
                                        <p className="text-secondary py-6">Loading orders...</p>
                                    ) : filteredOrders.length === 0 ? (
                                        <p className="text-secondary py-6">No orders found.</p>
                                    ) : filteredOrders.map((order) => (
                                        <div key={order.id} className="order_item mt-5 border border-line rounded-lg box-shadow-xs">
                                            <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-line">
                                                <div className="flex items-center gap-2">
                                                    <strong className="text-title">Order Number:</strong>
                                                    <strong className="order_number text-button uppercase">{order.id.slice(-10).toUpperCase()}</strong>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <strong className="text-title">Order status:</strong>
                                                    {statusBadge(order.status)}
                                                </div>
                                            </div>
                                            <div className="list_prd px-5">
                                                {order.items.map((item, i) => (
                                                    <div key={i} className="prd_item flex flex-wrap items-center justify-between gap-3 py-5 border-b border-line">
                                                        <div className="flex items-center gap-5">
                                                            <div className="bg-img flex-shrink-0 md:w-[100px] w-20 aspect-square rounded-lg overflow-hidden">
                                                                <Image
                                                                    src={item.product?.images?.[0] || '/images/product/1000x1000.png'}
                                                                    width={200}
                                                                    height={200}
                                                                    alt={item.product?.name ?? ''}
                                                                    className='w-full h-full object-cover'
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="prd_name text-title">{item.product?.name}</div>
                                                                <div className="caption1 text-secondary mt-2">
                                                                    {item.selectedSize && <span className="prd_size uppercase">{item.selectedSize}</span>}
                                                                    {item.selectedSize && item.selectedColor && <span>/</span>}
                                                                    {item.selectedColor && <span className="prd_color capitalize">{item.selectedColor}</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className='text-title'>
                                                            <span className="prd_quantity">{item.quantity}</span>
                                                            <span> X </span>
                                                            <span className="prd_price">${item.price.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex flex-wrap gap-4 p-5">
                                                <button className="button-main" onClick={() => { setSelectedOrder(order); setOpenDetail(true) }}>Order Details</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className={`tab_address text-content w-full p-7 border border-line rounded-xl ${activeTab === 'address' ? 'block' : 'hidden'}`}>
                                <form onSubmit={handleAddressSave}>
                                    {addressError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{addressError}</div>}
                                    {addressSuccess && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{addressSuccess}</div>}
                                    <button
                                        type='button'
                                        className={`tab_btn flex items-center justify-between w-full pb-1.5 border-b border-line ${activeAddress === 'billing' ? 'active' : ''}`}
                                        onClick={() => handleActiveAddress('billing')}
                                    >
                                        <strong className="heading6">Billing address</strong>
                                        <Icon.CaretDown className='text-2xl ic_down duration-300' />
                                    </button>
                                    <div className={`form_address ${activeAddress === 'billing' ? 'block' : 'hidden'}`}>
                                        <div className='grid sm:grid-cols-2 gap-4 gap-y-5 mt-5'>
                                            <div className="first-name">
                                                <label htmlFor="billingFirstName" className='caption1 capitalize'>First Name <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingFirstName" type="text" value={billingFirstName} onChange={e => setBillingFirstName(e.target.value)} required />
                                            </div>
                                            <div className="last-name">
                                                <label htmlFor="billingLastName" className='caption1 capitalize'>Last Name <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingLastName" type="text" value={billingLastName} onChange={e => setBillingLastName(e.target.value)} required />
                                            </div>
                                            <div className="country">
                                                <label htmlFor="billingCountry" className='caption1 capitalize'>Country / Region <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingCountry" type="text" value={billingCountry} onChange={e => setBillingCountry(e.target.value)} required />
                                            </div>
                                            <div className="street">
                                                <label htmlFor="billingStreet" className='caption1 capitalize'>Street address <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingStreet" type="text" value={billingStreet} onChange={e => setBillingStreet(e.target.value)} required />
                                            </div>
                                            <div className="city">
                                                <label htmlFor="billingCity" className='caption1 capitalize'>Town / city <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingCity" type="text" value={billingCity} onChange={e => setBillingCity(e.target.value)} required />
                                            </div>
                                            <div className="state">
                                                <label htmlFor="billingState" className='caption1 capitalize'>State</label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingState" type="text" value={billingState} onChange={e => setBillingState(e.target.value)} />
                                            </div>
                                            <div className="zip">
                                                <label htmlFor="billingZip" className='caption1 capitalize'>ZIP</label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingZip" type="text" value={billingZip} onChange={e => setBillingZip(e.target.value)} />
                                            </div>
                                            <div className="phone">
                                                <label htmlFor="billingPhone" className='caption1 capitalize'>Phone</label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="billingPhone" type="text" value={billingPhone} onChange={e => setBillingPhone(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type='button'
                                        className={`tab_btn flex items-center justify-between w-full mt-10 pb-1.5 border-b border-line ${activeAddress === 'shipping' ? 'active' : ''}`}
                                        onClick={() => handleActiveAddress('shipping')}
                                    >
                                        <strong className="heading6">Shipping address</strong>
                                        <Icon.CaretDown className='text-2xl ic_down duration-300' />
                                    </button>
                                    <div className={`form_address ${activeAddress === 'shipping' ? 'block' : 'hidden'}`}>
                                        <div className='grid sm:grid-cols-2 gap-4 gap-y-5 mt-5'>
                                            <div className="first-name">
                                                <label htmlFor="shippingFirstName" className='caption1 capitalize'>First Name <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingFirstName" type="text" value={shippingFirstName} onChange={e => setShippingFirstName(e.target.value)} required />
                                            </div>
                                            <div className="last-name">
                                                <label htmlFor="shippingLastName" className='caption1 capitalize'>Last Name <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingLastName" type="text" value={shippingLastName} onChange={e => setShippingLastName(e.target.value)} required />
                                            </div>
                                            <div className="country">
                                                <label htmlFor="shippingCountry" className='caption1 capitalize'>Country / Region <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingCountry" type="text" value={shippingCountry} onChange={e => setShippingCountry(e.target.value)} required />
                                            </div>
                                            <div className="street">
                                                <label htmlFor="shippingStreet" className='caption1 capitalize'>Street address <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingStreet" type="text" value={shippingStreet} onChange={e => setShippingStreet(e.target.value)} required />
                                            </div>
                                            <div className="city">
                                                <label htmlFor="shippingCity" className='caption1 capitalize'>Town / city <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingCity" type="text" value={shippingCity} onChange={e => setShippingCity(e.target.value)} required />
                                            </div>
                                            <div className="state">
                                                <label htmlFor="shippingState" className='caption1 capitalize'>State</label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingState" type="text" value={shippingState} onChange={e => setShippingState(e.target.value)} />
                                            </div>
                                            <div className="zip">
                                                <label htmlFor="shippingZip" className='caption1 capitalize'>ZIP</label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingZip" type="text" value={shippingZip} onChange={e => setShippingZip(e.target.value)} />
                                            </div>
                                            <div className="phone">
                                                <label htmlFor="shippingPhone" className='caption1 capitalize'>Phone</label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="shippingPhone" type="text" value={shippingPhone} onChange={e => setShippingPhone(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="block-button lg:mt-10 mt-6">
                                        <button type="submit" className="button-main" disabled={addressLoading}>
                                            {addressLoading ? 'Saving...' : 'Update Address'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <div className={`tab text-content w-full p-7 border border-line rounded-xl ${activeTab === 'setting' ? 'block' : 'hidden'}`}>
                                <form onSubmit={handleSettingsSave}>
                                    <div className="heading5 pb-4">Information</div>
                                    {settingsError && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{settingsError}</div>
                                    )}
                                    {settingsSuccess && (
                                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{settingsSuccess}</div>
                                    )}
                                    <div className="upload_image col-span-full">
                                        <label htmlFor="uploadImage">Upload Avatar: <span className="text-red">*</span></label>
                                        <div className="flex flex-wrap items-center gap-5 mt-3">
                                            <div className="bg_img flex-shrink-0 relative w-[7.5rem] h-[7.5rem] rounded-lg overflow-hidden bg-surface">
                                                <span className="ph ph-image text-5xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-secondary"></span>
                                                <Image
                                                    src={'/images/avatar/1.png'}
                                                    width={300}
                                                    height={300}
                                                    alt='avatar'
                                                    className="upload_img relative z-[1] w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <strong className="text-button">Upload File:</strong>
                                                <p className="caption1 text-secondary mt-1">JPG 120x120px</p>
                                                <div className="upload_file flex items-center gap-3 w-[220px] mt-3 px-3 py-2 border border-line rounded">
                                                    <label htmlFor="uploadImage" className="caption2 py-1 px-3 rounded bg-line whitespace-nowrap cursor-pointer">Choose File</label>
                                                    <input type="file" name="uploadImage" id="uploadImage" accept="image/*" className="caption2 cursor-pointer" required />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='grid sm:grid-cols-2 gap-4 gap-y-5 mt-5'>
                                        <div className="first-name">
                                            <label htmlFor="firstName" className='caption1 capitalize'>First Name <span className='text-red'>*</span></label>
                                            <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder='First name' />
                                        </div>
                                        <div className="last-name">
                                            <label htmlFor="lastName" className='caption1 capitalize'>Last Name <span className='text-red'>*</span></label>
                                            <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder='Last name' />
                                        </div>
                                        <div className="phone-number">
                                            <label htmlFor="phoneNumber" className='caption1 capitalize'>Phone Number <span className='text-red'>*</span></label>
                                            <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="phoneNumber" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
                                        </div>
                                        <div className="email">
                                            <label htmlFor="email" className='caption1 capitalize'>Email Address <span className='text-red'>*</span></label>
                                            <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="email" type="email" value={user?.email ?? ''} placeholder="Email address" readOnly />
                                        </div>
                                        <div className="gender">
                                            <label htmlFor="gender" className='caption1 capitalize'>Gender <span className='text-red'>*</span></label>
                                            <div className="select-block mt-2">
                                                <select className="border border-line px-4 py-3 w-full rounded-lg" id="gender" name="gender" defaultValue={'default'}>
                                                    <option value="default" disabled>Choose Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                <Icon.CaretDown className='arrow-down text-lg' />
                                            </div>
                                        </div>
                                        <div className="birth">
                                            <label htmlFor="birth" className='caption1'>Day of Birth <span className='text-red'>*</span></label>
                                            <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="birth" type="date" placeholder="Day of Birth" required />
                                        </div>
                                    </div>
                                    <div className="heading5 pb-4 lg:mt-10 mt-6">Change Password</div>
                                    <div className="new-pass mt-5">
                                        <label htmlFor="newPassword" className='caption1'>New password</label>
                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="newPassword" type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                    </div>
                                    <div className="confirm-pass mt-5">
                                        <label htmlFor="confirmPassword" className='caption1'>Confirm new password</label>
                                        <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="confirmPassword" type="password" placeholder="Confirm Password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                                    </div>
                                    <div className="block-button lg:mt-10 mt-6">
                                        <button type="submit" className="button-main" disabled={settingsLoading}>
                                            {settingsLoading ? 'Saving...' : 'Save Change'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            <div className={`modal-order-detail-block flex items-center justify-center`} onClick={() => setOpenDetail(false)}>
                <div className={`modal-order-detail-main grid grid-cols-2 w-[1160px] bg-white rounded-2xl ${openDetail ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                    {selectedOrder && (
                        <>
                            <div className="info p-10 border-r border-line">
                                <h5 className="heading5">Order Details</h5>
                                <div className="list_info grid grid-cols-2 gap-10 gap-y-8 mt-5">
                                    <div className="info_item">
                                        <strong className="text-button-uppercase text-secondary">Order ID</strong>
                                        <h6 className="heading6 mt-2 uppercase">{selectedOrder.id.slice(-10)}</h6>
                                        <h6 className="heading6 font-normal mt-1 text-secondary">{new Date(selectedOrder.createdAt).toLocaleDateString()}</h6>
                                    </div>
                                    <div className="info_item">
                                        <strong className="text-button-uppercase text-secondary">Payment method</strong>
                                        <h6 className="heading6 order_payment mt-2 capitalize">{selectedOrder.paymentMethod ?? 'N/A'}</h6>
                                    </div>
                                    <div className="info_item">
                                        <strong className="text-button-uppercase text-secondary">Status</strong>
                                        <div className="mt-2">{statusBadge(selectedOrder.status)}</div>
                                    </div>
                                    <div className="info_item">
                                        <strong className="text-button-uppercase text-secondary">Coupon</strong>
                                        <h6 className="heading6 mt-2">{selectedOrder.couponCode ?? '—'}</h6>
                                    </div>
                                    {selectedOrder.note && (
                                        <div className="info_item col-span-full">
                                            <strong className="text-button-uppercase text-secondary">Note</strong>
                                            <h6 className="heading6 font-normal mt-2">{selectedOrder.note}</h6>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="list p-10">
                                <h5 className="heading5">Items</h5>
                                <div className="list_prd">
                                    {selectedOrder.items.map((item, i) => (
                                        <div key={i} className="prd_item flex flex-wrap items-center justify-between gap-3 py-5 border-b border-line">
                                            <div className="flex items-center gap-5">
                                                <div className="bg-img flex-shrink-0 md:w-[100px] w-20 aspect-square rounded-lg overflow-hidden">
                                                    <Image
                                                        src={item.product?.images?.[0] || '/images/product/1000x1000.png'}
                                                        width={200}
                                                        height={200}
                                                        alt={item.product?.name ?? ''}
                                                        className='w-full h-full object-cover'
                                                    />
                                                </div>
                                                <div>
                                                    <div className="prd_name text-title">{item.product?.name}</div>
                                                    <div className="caption1 text-secondary mt-2">
                                                        {item.selectedSize && <span className="prd_size uppercase">{item.selectedSize}</span>}
                                                        {item.selectedSize && item.selectedColor && <span> / </span>}
                                                        {item.selectedColor && <span className="prd_color capitalize">{item.selectedColor}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='text-title'>
                                                <span className="prd_quantity">{item.quantity}</span>
                                                <span> X </span>
                                                <span className="prd_price">${item.price.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between mt-5">
                                    <strong className="text-title">Shipping</strong>
                                    <strong className="order_ship text-title">${(selectedOrder.shipping ?? 0).toFixed(2)}</strong>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <strong className="text-title">Discounts</strong>
                                    <strong className="order_discounts text-title">-${(selectedOrder.discount ?? 0).toFixed(2)}</strong>
                                </div>
                                <div className="flex items-center justify-between mt-5 pt-5 border-t border-line">
                                    <h5 className="heading5">Total</h5>
                                    <h5 className="order_total heading5">${selectedOrder.total.toFixed(2)}</h5>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default MyAccount