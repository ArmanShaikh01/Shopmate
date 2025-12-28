"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface DueOrder {
    orderId: string
    orderDate: string
    customerName: string
    customerPhone: string
    totalAmount: number
    paidAmount: number
    dueAmount: number
    status: 'unpaid' | 'partial'
}

export default function DueTodayPage() {
    const [data, setData] = useState<DueOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/dues/today')

            if (!response.ok) {
                throw new Error('Failed to fetch data')
            }

            const result = await response.json()
            setData(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const totalDue = data.reduce((sum, order) => sum + order.dueAmount, 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/dashboard" className="text-slate-600 hover:text-slate-900">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Due (Today)</h1>
                    <p className="text-slate-600">Pending payments for today's orders</p>
                </div>
            </div>

            {loading && (
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card>
                    <CardContent className="py-12">
                        <p className="text-center text-red-600">{error}</p>
                    </CardContent>
                </Card>
            )}

            {!loading && !error && (
                <>
                    {/* Summary Card */}
                    <Card className="bg-red-50 border-red-200">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-red-700">Total Due Amount (Today)</CardDescription>
                            <CardTitle className="text-4xl text-red-600">{formatCurrency(totalDue)}</CardTitle>
                            <p className="text-sm text-red-600 mt-1">{data.length} orders with pending payments</p>
                        </CardHeader>
                    </Card>

                    {/* Due Orders List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Orders with Pending Payments</CardTitle>
                            <CardDescription>
                                AAJ kis-kis se paisa aana baaki hai, kitna aur kis order ka
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-slate-500 text-lg mb-2">✓ No pending dues for today!</p>
                                    <p className="text-slate-400 text-sm">All today's orders are fully paid</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {data.map((order) => (
                                        <div key={order.orderId} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                                            {/* Customer Info */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="font-bold text-lg text-slate-900">{order.customerName}</h3>
                                                    <p className="text-sm text-slate-600">{order.customerPhone}</p>
                                                </div>
                                                <Badge variant={order.status === 'unpaid' ? 'destructive' : 'secondary'}>
                                                    {order.status.toUpperCase()}
                                                </Badge>
                                            </div>

                                            {/* Order Details */}
                                            <div className="bg-slate-100 p-3 rounded space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Order Date:</span>
                                                    <span className="font-medium">{formatDate(order.orderDate)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Order Total:</span>
                                                    <span className="font-bold">{formatCurrency(order.totalAmount)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Paid:</span>
                                                    <span className="font-medium text-green-600">{formatCurrency(order.paidAmount)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm border-t border-slate-300 pt-2">
                                                    <span className="text-slate-700 font-semibold">Due Amount:</span>
                                                    <span className="font-bold text-red-600 text-lg">{formatCurrency(order.dueAmount)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
