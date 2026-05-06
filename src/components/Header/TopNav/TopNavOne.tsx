'use client'

import React, { useState } from 'react'
import Link from 'next/link';
import Image from 'next/image';
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useCMS } from '@/context/CMSContext';

interface Props {
    props: string;
    slogan: string;
}

const TopNavOne: React.FC<Props> = ({ props, slogan }) => {
    const [isOpenLanguage, setIsOpenLanguage] = useState(false)
    const [isOpenCurrence, setIsOpenCurrence] = useState(false)
    const [language, setLanguage] = useState('English')
    const [currence, setCurrence] = useState('USD')
    const { global } = useCMS()

    const announcementText = global.announcement_text || slogan
    const announcementLink = global.announcement_link || '#!'
    const fb = global.footer_facebook || 'https://www.facebook.com/'
    const ig = global.footer_instagram || 'https://www.instagram.com/'
    const yt = global.footer_youtube || 'https://www.youtube.com/'
    const tw = global.footer_twitter || 'https://twitter.com/'

    return (
        <>
            <div className={`top-nav md:h-[44px] h-[30px] ${props}`}>
                <div className="container mx-auto h-full">
                    <div className="top-nav-main flex justify-between max-md:justify-center h-full">
                        <div className="left-content flex items-center gap-5 max-md:hidden">
                            <div
                                className="choose-type choose-language flex items-center gap-1.5"
                                onClick={() => {
                                    setIsOpenLanguage(!isOpenLanguage)
                                    setIsOpenCurrence(false)
                                }}
                            >
                                <div className="select relative">
                                    <p className="selected caption2 text-white">{language}</p>
                                    <ul className={`list-option bg-white ${isOpenLanguage ? 'open' : ''}`}>
                                        {
                                            ['English', 'Espana', 'France'].map((item, index) => (
                                                <li key={index} className="caption2" onClick={() => setLanguage(item)}>{item}</li>
                                            ))
                                        }
                                    </ul>
                                </div>
                                <Icon.CaretDown size={12} color='#fff' />
                            </div>
                            <div
                                className="choose-type choose-currency flex items-center gap-1.5"
                                onClick={() => {
                                    setIsOpenCurrence(!isOpenCurrence)
                                    setIsOpenLanguage(false)
                                }}
                            >
                                <div className="select relative">
                                    <p className="selected caption2 text-white">{currence}</p>
                                    <ul className={`list-option bg-white ${isOpenCurrence ? 'open' : ''}`}>
                                        {
                                            ['USD', 'EUR', 'GBP'].map((item, index) => (
                                                <li key={index} className="caption2" onClick={() => setCurrence(item)}>{item}</li>
                                            ))
                                        }
                                    </ul>
                                </div>
                                <Icon.CaretDown size={12} color='#fff' />
                            </div>
                        </div>
                        <div className="text-center text-button-uppercase text-white flex items-center">
                            <Link href={announcementLink}>{announcementText}</Link>
                        </div>
                        <div className="right-content flex items-center gap-5 max-md:hidden">
                            <Link href={fb} target='_blank'>
                                <i className="icon-facebook text-white"></i>
                            </Link>
                            <Link href={ig} target='_blank'>
                                <i className="icon-instagram text-white"></i>
                            </Link>
                            <Link href={yt} target='_blank'>
                                <i className="icon-youtube text-white"></i>
                            </Link>
                            <Link href={tw} target='_blank'>
                                <i className="icon-twitter text-white"></i>
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}

export default TopNavOne