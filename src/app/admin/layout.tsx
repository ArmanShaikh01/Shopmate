'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, ShoppingBag, Package, FileText, CreditCard, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signout } from '@/app/auth/actions'
import { useState } from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
                <h1 className="text-xl font-bold text-slate-900">Meri Dukan</h1>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </Button>
            </div>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 flex flex-col z-50
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 border-b border-slate-100">
                    <h1 className="text-2xl font-bold text-slate-900">Meri Dukan</h1>
                    <p className="text-xs text-slate-500 mt-1">Admin Panel</p>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <NavLink href="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => setSidebarOpen(false)} />
                    <NavLink href="/admin/orders" icon={<ShoppingBag size={20} />} label="Orders" onClick={() => setSidebarOpen(false)} />
                    <NavLink href="/admin/inventory" icon={<Package size={20} />} label="Inventory" onClick={() => setSidebarOpen(false)} />
                    <NavLink href="/admin/reports" icon={<FileText size={20} />} label="Reports" onClick={() => setSidebarOpen(false)} />
                    <NavLink href="/admin/payments" icon={<CreditCard size={20} />} label="Payments" onClick={() => setSidebarOpen(false)} />
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <form action={signout}>
                        <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                            <LogOut size={20} className="mr-2" />
                            Sign Out
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
                <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}

function NavLink({ href, icon, label, onClick }: { href: string, icon: React.ReactNode, label: string, onClick?: () => void }) {
    const pathname = usePathname()
    const isActive = pathname === href || pathname?.startsWith(href + '/')

    return (
        <Link
            href={href}
            prefetch={true}
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
        >
            <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>{icon}</span>
            <span className="font-medium">{label}</span>
        </Link>
    )
}
