"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calendar as CalendarIcon } from 'lucide-react'

interface OrderItem {
    productName: string
    quantity: number
    unit: string
    price: number
    total: number
}

interface Order {
    orderId: string
    customerName: string
    customerPhone: string
    orderDate: string
    items: OrderItem[]
    totalAmount: number
    paidAmount: number
    dueAmount: number
    status: 'paid' | 'partial' | 'unpaid'
}

interface Summary {
    totalOrders: number
    totalAmount: number
    totalCollected: number
    totalPending: number
}

export default function DateWiseKhata({ initialDate }: { initialDate?: string }) {
    const [selectedDate, setSelectedDate] = useState(initialDate || new Date().toISOString().split('T')[0])
    const [data, setData] = useState<{ summary: Summary; orders: Order[] } | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async (date: string) => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch(`/api/admin/khata/date-wise?date=${date}`)

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

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = e.target.value
        setSelectedDate(date)
        fetchData(date)
    }

    const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'destructive' | 'secondary'> = {
            paid: 'default',
            partial: 'secondary',
            unpaid: 'destructive'
        }
        return (
            <Badge variant={variants[status] || 'secondary'}>
                {status.toUpperCase()}
            </Badge>
        )
    }

    // Auto-fetch on mount and when date changes
    useEffect(() => {
        fetchData(selectedDate)
    }, [selectedDate])

    return (
        <div className="space-y-6">
            {/* Date Selector */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Date</CardTitle>
                    <CardDescription>View all orders for a specific date</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 max-w-sm">
                        <CalendarIcon className="w-5 h-5 text-slate-400" />
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="flex-1"
                        />
                    </div>
                </CardContent>
            </Card>

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

            {!loading && !error && data && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Total Orders</CardDescription>
                                <CardTitle className="text-3xl">{data.summary.totalOrders}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Total Amount</CardDescription>
                                <CardTitle className="text-3xl">{formatCurrency(data.summary.totalAmount)}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Amount Collected</CardDescription>
                                <CardTitle className="text-3xl text-green-600">{formatCurrency(data.summary.totalCollected)}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Amount Pending</CardDescription>
                                <CardTitle className="text-3xl text-red-600">{formatCurrency(data.summary.totalPending)}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Orders List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Orders for {new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data.orders.length === 0 ? (
                                <p className="text-center text-slate-500 py-8">No orders on this date</p>
                            ) : (
                                <div className="space-y-4">
                                    {data.orders.map((order, index) => (
                                        <div key={order.orderId} className="border rounded-lg p-4 space-y-3">
                                            {/* Order Header */}
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-bold text-lg text-slate-900">{order.customerName}</h3>
                                                    <p className="text-sm text-slate-600">{order.customerPhone}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{formatDate(order.orderDate)}</p>
                                                </div>
                                                {getStatusBadge(order.status)}
                                            </div>

                                            {/* Items */}
                                            <div className="space-y-1 bg-slate-50 p-3 rounded">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span className="text-slate-700">
                                                            • {item.productName} ({item.quantity} {item.unit} × {formatCurrency(item.price)})
                                                        </span>
                                                        <span className="font-medium">{formatCurrency(item.total)}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Totals */}
                                            <div className="border-t pt-3 space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium">Total:</span>
                                                    <span className="font-bold">{formatCurrency(order.totalAmount)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium">Paid:</span>
                                                    <span className="font-bold text-green-600">{formatCurrency(order.paidAmount)}</span>
                                                </div>
                                                {order.dueAmount > 0 && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-medium">Due:</span>
                                                        <span className="font-bold text-red-600">{formatCurrency(order.dueAmount)}</span>
                                                    </div>
                                                )}
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
