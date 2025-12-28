import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

// Enable real-time updates - revalidate every 10 seconds
export const revalidate = 10
export const dynamic = 'force-dynamic'

export default async function AdminPaymentsPage() {
    const supabase = createClient()

    const { data: payments, error } = await supabase
        .from('payments')
        .select('*, orders(id, profiles(full_name))')
        .order('created_at', { ascending: false })
        .limit(100)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
                <p className="text-slate-500">History of all transactions received.</p>
            </div>

            <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden bg-white">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="font-bold">Date</TableHead>
                            <TableHead className="font-bold">Order</TableHead>
                            <TableHead className="font-bold">Customer</TableHead>
                            <TableHead className="font-bold">Method</TableHead>
                            <TableHead className="font-bold text-right">Amount</TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments?.map((payment) => (
                            <TableRow key={payment.id} className="hover:bg-slate-50/50">
                                <TableCell className="text-sm">
                                    {new Date(payment.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="font-medium text-blue-600">
                                    <Link href={`/admin/orders/${payment.order_id}`}>
                                        #{payment.order_id.slice(0, 8)}
                                    </Link>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {/* @ts-ignore */}
                                    {payment.orders?.profiles?.full_name || 'Guest'}
                                </TableCell>
                                <TableCell className="text-xs uppercase font-bold text-slate-500">
                                    {payment.payment_method === 'cash_on_delivery' ? 'CASH' :
                                        payment.payment_method === 'upi' ? 'UPI' :
                                            payment.payment_method.replace(/_/g, ' ')}
                                </TableCell>
                                <TableCell className="text-right font-bold">
                                    {formatCurrency(payment.amount)}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className={
                                        payment.status === 'completed'
                                            ? 'bg-green-100 text-green-800 hover:bg-green-100 border-none'
                                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none'
                                    }>
                                        {payment.status.toUpperCase()}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                        {payments?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-slate-400 italic">
                                    No payment records found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
