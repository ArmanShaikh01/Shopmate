import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LayoutDashboard, Package, CreditCard, ShoppingBag, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function AdminPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?target=admin')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'shopkeeper') {
        redirect('/login?error=unauthorized')
    }

    // Get badge counts - SIMPLE DB QUERY ONLY
    const { count: pendingOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'cancelled'])

    const { count: unpaidPaymentsCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .in('status', ['unpaid', 'partial'])

    const menuItems = [
        {
            title: 'Dashboard',
            description: 'Overview & Analytics',
            icon: LayoutDashboard,
            href: '/admin/dashboard',
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100',
            badge: null
        },
        {
            title: 'Orders',
            description: 'Manage customer orders',
            icon: ShoppingBag,
            href: '/admin/orders',
            gradient: 'from-emerald-500 to-emerald-600',
            bgGradient: 'from-emerald-50 to-emerald-100',
            badge: pendingOrdersCount || 0
        },
        {
            title: 'Inventory',
            description: 'Stock management',
            icon: Package,
            href: '/admin/inventory',
            gradient: 'from-purple-500 to-purple-600',
            bgGradient: 'from-purple-50 to-purple-100',
            badge: null
        },
        {
            title: 'Payments',
            description: 'Financial overview',
            icon: CreditCard,
            href: '/admin/payments',
            gradient: 'from-orange-500 to-orange-600',
            bgGradient: 'from-orange-50 to-orange-100',
            badge: unpaidPaymentsCount || 0
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm border-b border-white/10">
                <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
                                Meri Dukan <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Admin</span>
                            </h1>
                            <p className="text-slate-400 font-medium text-sm sm:text-base">Welcome back, {profile?.full_name || 'Shopkeeper'}!</p>
                        </div>
                        <Link href="/shop" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all">
                            <ShoppingBag size={18} />
                            View Shop
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="mb-8 sm:mb-12">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-2 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                        <h2 className="text-2xl sm:text-3xl font-black text-white">
                            Quick Access
                        </h2>
                    </div>
                    <p className="text-slate-400 text-sm sm:text-base ml-5">Choose a module to manage</p>
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {/* Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                            <div className="relative p-6 sm:p-8">
                                <div className="flex items-start gap-4 sm:gap-6">
                                    {/* Icon */}
                                    <div className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 relative`}>
                                        <item.icon className="text-white" size={28} />
                                        {/* Badge on icon */}
                                        {item.badge !== null && item.badge > 0 && (
                                            <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full min-w-[18px] text-center shadow-lg animate-pulse">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl sm:text-2xl font-black text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-400 group-hover:to-purple-400 transition-all">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm sm:text-base text-slate-400 font-medium">
                                            {item.description}
                                        </p>
                                    </div>

                                    {/* Arrow */}
                                    <div className="shrink-0 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="mt-12 sm:mt-16 max-w-4xl">
                    <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
                        <div className="flex items-center gap-3 text-slate-400 text-sm">
                            <TrendingUp className="text-blue-400" size={20} />
                            <p>
                                <span className="font-bold text-white">Pro Tip:</span> Badges show pending/cancelled orders and unpaid/partial payments. They update automatically.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
