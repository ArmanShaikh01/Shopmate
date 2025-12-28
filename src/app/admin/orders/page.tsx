import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { ShoppingBag, Clock, CheckCircle, Package, Truck, XCircle, ChevronRight, Search, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default async function AdminOrdersPage({ searchParams }: { searchParams: { status?: string } }) {
    const supabase = createClient()
    const currentStatus = searchParams.status

    let query = supabase
        .from('orders')
        .select('*, profiles(full_name, phone), order_items(*)')
        .order('created_at', { ascending: false })
        .limit(100)

    if (currentStatus) {
        query = query.eq('status', currentStatus)
    }

    const { data: orders, error } = await query

    const tabs = [
        { label: 'All', value: 'all', icon: ShoppingBag },
        { label: 'Pending', value: 'pending', icon: Clock },
        { label: 'Confirmed', value: 'confirmed', icon: CheckCircle },
        { label: 'Packed', value: 'packed', icon: Package },
        { label: 'Cancelled', value: 'cancelled', icon: XCircle },
    ]

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                        <ShoppingBag className="text-blue-600" size={32} />
                        Orders
                    </h1>
                    <p className="text-slate-500 font-medium">Manage fulfillment and track shop performance.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input placeholder="Search order ID..." className="pl-10 rounded-2xl border-slate-200 focus:ring-blue-500 transition-all shadow-sm" />
                    </div>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-200/60 shadow-inner">
                {tabs.map((tab) => {
                    const isActive = (currentStatus || 'all') === tab.value
                    const Icon = tab.icon
                    return (
                        <Link
                            key={tab.value}
                            href={tab.value === 'all' ? '/admin/orders' : `/admin/orders?status=${tab.value}`}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 ${isActive
                                ? 'bg-white text-blue-600 shadow-md font-bold ring-1 ring-slate-200'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                                }`}
                        >
                            <Icon size={18} className={isActive ? 'text-blue-500' : 'text-slate-400'} />
                            <span className="text-sm tracking-wide">{tab.label}</span>
                        </Link>
                    )
                })}
            </div>

            {/* Orders Grid/List */}
            <div className="grid gap-4">
                {orders && orders.length > 0 ? (
                    orders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/admin/orders/${order.id}`}
                            className={`group flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden ${order.status === 'pending'
                                ? 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-200 ring-2 ring-amber-100 animate-pulse-slow'
                                : 'bg-white border border-slate-100 hover:border-blue-100'
                                }`}
                        >
                            {/* Accent Bar */}
                            <div className={`absolute top-0 left-0 bottom-0 w-1.5 transition-all duration-300 group-hover:w-2 ${getStatusColor(order.status)}`} />

                            {/* Order ID & Time */}
                            <div className="flex-1 space-y-1 pl-4 w-full">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-sm font-bold text-slate-400">#{order.id.slice(0, 8)}</span>
                                    <StatusBadge status={order.status} />
                                </div>
                                <div className="text-slate-400 text-xs font-medium flex items-center gap-2">
                                    <Clock size={12} /> {new Date(order.created_at).toLocaleString()}
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="flex-[1.5] w-full border-l border-slate-50 pl-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                                        <Users className="text-slate-300 group-hover:text-blue-500" size={18} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{order.profiles?.full_name || 'Guest Customer'}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                            <span>{order.order_items?.length || 0} ITEMS</span>
                                            {order.delivery_phone && <span>• 📞 {order.delivery_phone}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Financials */}
                            <div className="flex-1 text-right w-full flex md:flex-col justify-between md:justify-end items-center md:items-end gap-1 px-6 border-l border-slate-50">
                                <div className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">
                                    {formatCurrency(order.total_amount)}
                                </div>
                                <PaymentBadge status={order.payment_status} />
                            </div>

                            <div className="hidden md:flex flex-col items-center justify-center h-full">
                                <ChevronRight className="text-slate-200 group-hover:translate-x-1 transition-transform group-hover:text-blue-400" />
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="bg-white py-24 rounded-[32px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center space-y-6">
                        <div className="p-8 bg-slate-50 rounded-full">
                            <ShoppingBag className="text-slate-200" size={64} />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">No orders yet</h3>
                            <p className="text-slate-500 max-w-xs mx-auto">Try adjusting your filters or wait for new transactions to appear here.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function getStatusColor(status: string) {
    const colors: Record<string, string> = {
        pending: 'bg-amber-400',
        confirmed: 'bg-blue-500',
        packed: 'bg-purple-500',
        delivered: 'bg-emerald-500',
        cancelled: 'bg-rose-500',
    }
    return colors[status?.toLowerCase()] || 'bg-slate-200'
}

function StatusBadge({ status }: { status: string }) {
    const safeStatus = status?.toLowerCase() || 'pending'
    const styles: Record<string, string> = {
        pending: 'bg-amber-50 text-amber-600 border-amber-100',
        confirmed: 'bg-blue-50 text-blue-600 border-blue-100',
        packed: 'bg-purple-50 text-purple-600 border-purple-100',
        delivered: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        cancelled: 'bg-rose-50 text-rose-600 border-rose-100',
    }
    return (
        <Badge variant="outline" className={`${styles[safeStatus] || 'bg-slate-50'} rounded-lg px-2.5 py-0.5 border-none font-bold text-[10px] tracking-tight uppercase`}>
            {safeStatus}
        </Badge>
    )
}

function PaymentBadge({ status }: { status: string }) {
    const safeStatus = status?.toLowerCase() || 'unpaid'
    const styles: Record<string, string> = {
        paid: 'bg-emerald-50 text-emerald-700',
        partial: 'bg-orange-50 text-orange-700',
        unpaid: 'bg-slate-100 text-slate-400'
    }
    return (
        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${styles[safeStatus]}`}>
            {safeStatus}
        </span>
    )
}
