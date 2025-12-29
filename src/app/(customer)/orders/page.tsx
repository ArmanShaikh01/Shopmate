import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function OrdersPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-12 px-4">
                <p className="text-sm sm:text-base">You need to be logged in to view your orders.</p>
                <Link href="/login"><Button>Login</Button></Link>
            </div>
        )
    }

    const { data: orders, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name))')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })

    if (!orders || orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-12 px-4">
                <h2 className="text-xl sm:text-2xl font-bold">No orders yet</h2>
                <p className="text-sm sm:text-base text-slate-500">Looks like you haven't placed any orders.</p>
                <Link href="/"><Button>Start Shopping</Button></Link>
            </div>
        )
    }

    return (
        <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Your Orders</h1>
            <div className="grid gap-3 sm:gap-4">
                {orders.map((order) => (
                    <Card key={order.id}>
                        <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                            <div className="flex items-start sm:items-center justify-between gap-2">
                                <CardTitle className="text-sm sm:text-base">Order #{order.id.slice(0, 8)}</CardTitle>
                                <StatusBadge status={order.status} />
                            </div>
                            <CardDescription suppressHydrationWarning className="text-xs sm:text-sm">
                                {new Date(order.created_at).toLocaleDateString()} • {new Date(order.created_at).toLocaleTimeString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                            <div className="text-xs sm:text-sm space-y-1 mb-4">
                                {order.order_items.map((item: any) => (
                                    <div key={item.id} className="flex justify-between gap-2">
                                        <span className="truncate">{item.quantity} x {item.products?.name || 'Product'}</span>
                                        <span className="text-slate-500 shrink-0">{formatCurrency(item.price_at_time * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between font-bold border-t pt-2 text-sm sm:text-base">
                                <span>Total</span>
                                <span>{formatCurrency(order.total_amount)}</span>
                            </div>
                            {/* Payment Info */}
                            <div className="mt-2 text-xs flex gap-2">
                                {order.expires_at && order.status === 'pending' && (
                                    <span className="text-orange-600">Reserved until {new Date(order.expires_at).toLocaleTimeString()}</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        packed: 'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        expired: 'bg-gray-100 text-gray-800'
    }
    return <Badge variant="secondary" className={styles[status] || 'bg-gray-100'}>{status.toUpperCase()}</Badge>
}
