import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

// Enable real-time updates - revalidate every 15 seconds
export const revalidate = 15
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    const supabase = createClient()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Run all queries in parallel for better performance
    const [
        { data: todayOrders },
        { data: allOrders }
    ] = await Promise.all([
        supabase
            .from('orders')
            .select('id, total_amount')
            .gte('created_at', today.toISOString())
            .lt('created_at', tomorrow.toISOString())
            .neq('status', 'cancelled'),
        supabase
            .from('orders')
            .select('id, total_amount')
            .neq('status', 'cancelled')
    ])

    const todayOrderIds = (todayOrders || []).map(o => o.id)
    const allOrderIds = (allOrders || []).map(o => o.id)

    // Fetch payments in parallel
    const [
        { data: todayPayments },
        { data: allPayments }
    ] = await Promise.all([
        todayOrderIds.length > 0
            ? supabase
                .from('payments')
                .select('order_id, amount')
                .in('order_id', todayOrderIds)
                .eq('status', 'completed')
            : Promise.resolve({ data: [] }),
        allOrderIds.length > 0
            ? supabase
                .from('payments')
                .select('order_id, amount')
                .in('order_id', allOrderIds)
                .eq('status', 'completed')
            : Promise.resolve({ data: [] })
    ])

    let todayTotalOrders = 0
    let todayTotalDue = 0
    let todayUnpaidCount = 0
    let todayPartialCount = 0

    for (const order of (todayOrders || [])) {
        const orderPayments = (todayPayments || []).filter((p: any) => p.order_id === order.id)
        const paidAmount = orderPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0)
        const orderTotal = Number(order.total_amount)
        const dueAmount = orderTotal - paidAmount

        todayTotalOrders++

        if (dueAmount > 0) {
            todayTotalDue += dueAmount
            if (paidAmount === 0) {
                todayUnpaidCount++
            } else {
                todayPartialCount++
            }
        }
    }

    let totalOutstanding = 0

    for (const order of (allOrders || [])) {
        const orderPayments = (allPayments || []).filter((p: any) => p.order_id === order.id)
        const paidAmount = orderPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0)
        const orderTotal = Number(order.total_amount)
        const dueAmount = orderTotal - paidAmount

        if (dueAmount > 0) {
            totalOutstanding += dueAmount
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-slate-500">Overview of today's shop activity. Click any card for details.</p>
            </div>

            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Today's Orders"
                    value={todayTotalOrders}
                    subtext="Orders placed today"
                    href="/admin/orders?filter=today"
                />

                <StatCard
                    title="Revenue (Today)"
                    value={formatCurrency(0)}
                    subtext="Amount collected today"
                    href={`/admin/reports?tab=date-wise&date=${today.toISOString().split('T')[0]}`}
                />

                <StatCard
                    title="Due (Today)"
                    value={formatCurrency(todayTotalDue)}
                    subtext={`${todayUnpaidCount} unpaid, ${todayPartialCount} partial`}
                    highlight={todayTotalDue > 0}
                    href="/admin/dues/today"
                />

                <StatCard
                    title="Total Outstanding"
                    value={formatCurrency(totalOutstanding)}
                    subtext="All time pending dues"
                    highlight={totalOutstanding > 0}
                    href="/admin/dues/outstanding"
                />
            </div>

            <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500">Go to Orders tab to manage orders.</p>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Low Stock Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500">Go to Inventory tab to manage products.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StatCard({ title, value, subtext, highlight = false, href }: {
    title: string
    value: string | number
    subtext: string
    highlight?: boolean
    href: string
}) {
    return (
        <Link href={href} className="block group">
            <Card className="rounded-2xl sm:rounded-3xl border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer min-h-[120px] sm:min-h-[140px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                    <CardTitle className="text-xs sm:text-sm font-bold text-slate-500 group-hover:text-blue-600 transition-colors">
                        {title}
                    </CardTitle>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                    <div className={`text-xl sm:text-2xl font-black ${highlight ? 'text-red-600' : 'text-slate-900'}`}>{value}</div>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-1 font-medium line-clamp-1">
                        {subtext}
                    </p>
                </CardContent>
            </Card>
        </Link>
    )
}