'use client'

import Link from 'next/link'
import { LogIn, User, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { signout } from '@/app/auth/actions'

export default function SiteHeader() {
    const [user, setUser] = useState<any>(null)
    const [role, setRole] = useState<string | null>(null)

    useEffect(() => {
        const supabase = createClient()
        supabase.auth.getUser().then(({ data: { user } }) => {
            // Only show user info if email is confirmed
            if (user && user.email_confirmed_at) {
                setUser(user)
                supabase.from('profiles').select('role').eq('id', user.id).single().then(({ data }) => {
                    if (data) setRole(data.role)
                    else setRole('unknown')
                })
            } else {
                // Email not confirmed, don't show user info
                setUser(null)
                setRole(null)
            }
        })
    }, [])

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-xl">
            <div className="container flex h-20 items-center justify-between">
                <Link href="/" className="flex items-center space-x-3 transition-transform hover:scale-105 active:scale-95">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                        <Store className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-black tracking-tight text-slate-900">
                        Meri Dukan
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    {role === 'shopkeeper' ? (
                        <Link href="/admin/dashboard" className="text-sm font-bold text-blue-600">Admin Dashboard</Link>
                    ) : (
                        <>
                            <Link href="/shop" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Shop</Link>
                            <Link href="/orders" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">My Orders</Link>
                        </>
                    )}
                </nav>

                <div className="flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <Link href={role === 'shopkeeper' ? '/admin/dashboard' : '/orders'}>
                                <Button variant="secondary" className="rounded-xl h-11 px-4 font-bold bg-slate-50 border-none text-slate-600 hover:bg-slate-100 gap-2">
                                    <User size={18} />
                                    <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
                                </Button>
                            </Link>

                            <Button
                                variant="ghost"
                                className="rounded-xl h-11 px-4 font-bold text-slate-400 hover:text-red-500 hover:bg-red-50"
                                onClick={() => signout()}
                            >
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button className="rounded-xl h-11 px-8 font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 gap-2">
                                <LogIn size={18} />
                                Login
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}
