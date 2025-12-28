import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import OrderActions from '../order-actions'
import OrderItemsManager from '../order-items-manager'
import PaymentRecorder from '../payment-recorder'
import { ChevronLeft, User, Phone, MapPin, CreditCard, ShoppingCart, History as HistoryIcon } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
    // Use admin client to ensure payment aggregates are visible
    const supabase = createAdminClient()

    const { data: order } = await supabase
        .from('orders')
        .select('*, profiles(full_name, phone), order_items(*, products(name)), payments(*)')
        .eq('id', params.id)
        .single()

    if (!order) {
        notFound()
    }

    const totalAmount = order.total_amount || 0
    const paidAmount = order.paid_amount || 0
    const dueAmount = order.due_amount || (totalAmount - paidAmount)

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <Link href="/admin/orders" className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors mb-2">
                        <ChevronLeft size={16} /> Back to Orders
                    </Link>
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-blue-600 pl-4">
                            Order #{order.id.slice(0, 8)}
                        </h2>
                        <div className="flex gap-2">
                            <StatusBadge status={order.status} />
                            <PaymentBadge status={order.payment_status} />
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm pl-8">
                        Placed on {new Date(order.created_at).toLocaleString()}
                    </p>
                </div>
                <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 flex items-center">
                    <OrderActions order={order} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Items & Details */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="shadow-sm border-slate-100 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="text-blue-600" size={20} />
                                <CardTitle className="text-lg">Order Items</CardTitle>
                            </div>
                            <CardDescription>Verify and pack the customer's request.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <OrderItemsManager order={order} items={order.order_items} />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Customer & Financials */}
                <div className="space-y-8">
                    <Card className="shadow-sm border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500 opacity-50" />
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="text-blue-600" size={20} />
                                <CardTitle className="text-lg">Customer Info</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 relative">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                    {(order.profiles?.full_name || 'G')[0]}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">{order.profiles?.full_name || 'Guest Customer'}</div>
                                    <div className="text-sm text-slate-500 flex items-center gap-1">
                                        <Phone size={12} /> {order.profiles?.phone || 'No phone provided'}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Summary - Compact Overview */}
                    <Card className="shadow-sm border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
                        {/* Status Glow */}
                        <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 -mr-16 -mt-16 ${order.payment_status === 'paid' ? 'bg-emerald-500' :
                            order.payment_status === 'partial' ? 'bg-orange-500' : 'bg-slate-500'
                            }`} />

                        <CardHeader className="pb-3 relative">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="text-blue-400" size={18} />
                                    <CardTitle className="text-base text-white">Payment Overview</CardTitle>
                                </div>
                                <PaymentBadge status={order.payment_status} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 relative">
                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-slate-400 font-semibold">
                                    <span>Progress</span>
                                    <span>{Math.round((paidAmount / totalAmount) * 100)}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-700 ${order.payment_status === 'paid' ? 'bg-emerald-500' : 'bg-blue-500'
                                            }`}
                                        style={{ width: `${Math.min(100, (paidAmount / totalAmount) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Amount Summary */}
                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Total Bill</span>
                                    <span className="font-mono font-semibold">{formatCurrency(totalAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Paid</span>
                                    <span className="text-emerald-400 font-mono font-semibold">₹{paidAmount}</span>
                                </div>
                                <Separator className="bg-slate-700/50" />
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Balance Due</span>
                                    <div className="text-2xl font-black text-white">{formatCurrency(dueAmount)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Recorder - Separate Card */}
                    {dueAmount > 0 && order.status !== 'cancelled' && (
                        <Card className="shadow-sm border-blue-100 bg-gradient-to-br from-blue-50 to-white overflow-hidden">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                                    <CreditCard className="text-blue-600" size={18} />
                                    Record Payment
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PaymentRecorder orderId={order.id} dueAmount={dueAmount} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment History - Separate Card */}
                    {order.payments?.length > 0 && (
                        <Card className="shadow-sm border-slate-100">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <HistoryIcon className="text-slate-600" size={18} />
                                    <CardTitle className="text-base">Payment History</CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    {order.payments.length} payment{order.payments.length > 1 ? 's' : ''} recorded
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                    {order.payments.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((p: any) => (
                                        <div key={p.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-semibold text-slate-900">
                                                    {new Date(p.created_at).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                                <span className="text-xs text-slate-500 uppercase tracking-wide">
                                                    {p.payment_method === 'cash_on_delivery' ? 'Cash' :
                                                        p.payment_method === 'upi' ? 'UPI' :
                                                            p.payment_method?.replace(/_/g, ' ') || 'Cash'}
                                                </span>
                                            </div>
                                            <span className="font-bold text-emerald-600 text-lg">{formatCurrency(p.amount)}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const safeStatus = status?.toLowerCase() || 'pending'
    const styles: Record<string, string> = {
        pending: 'bg-amber-100 text-amber-700 border-amber-200',
        confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
        packed: 'bg-purple-100 text-purple-700 border-purple-200',
        delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
    }
    return (
        <Badge variant="outline" className={`${styles[safeStatus] || 'bg-slate-100'} font-bold px-3 py-1 uppercase tracking-wider text-[10px]`}>
            {safeStatus}
        </Badge>
    )
}

function PaymentBadge({ status }: { status: string }) {
    const safeStatus = status?.toLowerCase() || 'unpaid'
    const styles: Record<string, string> = {
        paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        partial: 'bg-orange-100 text-orange-700 border-orange-200',
        unpaid: 'bg-slate-100 text-slate-600 border-slate-200'
    }
    return (
        <Badge variant="outline" className={`${styles[safeStatus]} font-bold px-3 py-1 uppercase tracking-wider text-[10px]`}>
            {safeStatus}
        </Badge>
    )
}
