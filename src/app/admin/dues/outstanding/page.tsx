"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface OrderItem {
    productName: string
    quantity: number
    price: number
    total: number
}

interface Order {
    orderId: string
    orderDate: string
    items: OrderItem[]
    totalAmount: number
    paidAmount: number
    dueAmount: number
    status: string
}

interface CustomerDue {
    customerId: string
    customerName: string
    customerPhone: string
    totalDue: number
    orders: Order[]
}

export default function OutstandingPage() {
    const [data, setData] = useState<CustomerDue[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set())

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/dues/outstanding')

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

    const toggleCustomer = (customerId: string) => {
        const newExpanded = new Set(expandedCustomers)
        if (newExpanded.has(customerId)) {
            newExpanded.delete(customerId)
        } else {
            newExpanded.add(customerId)
        }
        setExpandedCustomers(newExpanded)
    }

    const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const totalOutstanding = data.reduce((sum, customer) => sum + customer.totalDue, 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/dashboard" className="text-slate-600 hover:text-slate-900">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Total Outstanding</h1>
                    <p className="text-slate-600">All pending dues across all customers</p>
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
                            <CardDescription className="text-red-700">Total Outstanding Amount</CardDescription>
                            <CardTitle className="text-4xl text-red-600">{formatCurrency(totalOutstanding)}</CardTitle>
                            <p className="text-sm text-red-600 mt-1">{data.length} customers with pending payments</p>
                        </CardHeader>
                    </Card>

                    {/* Customers List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer-wise Outstanding Dues</CardTitle>
                            <CardDescription>
                                Kaun-kaun se customer se paisa aana hai aur kitna
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-slate-500 text-lg mb-2">✓ No outstanding dues!</p>
                                    <p className="text-slate-400 text-sm">All orders are fully paid</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {data.map((customer) => (
                                        <div key={customer.customerId} className="border rounded-lg overflow-hidden">
                                            {/* Customer Header */}
                                            <div
                                                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                                                onClick={() => toggleCustomer(customer.customerId)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        {expandedCustomers.has(customer.customerId) ? (
                                                            <ChevronDown className="w-4 h-4" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <div>
                                                        <p className="font-bold text-lg text-slate-900">{customer.customerName}</p>
                                                        <p className="text-sm text-slate-600">{customer.customerPhone}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-slate-600">Total Due</p>
                                                    <p className="text-2xl font-bold text-red-600">{formatCurrency(customer.totalDue)}</p>
                                                </div>
                                            </div>

                                            {/* Order Details */}
                                            {expandedCustomers.has(customer.customerId) && (
                                                <div className="border-t bg-white p-4 space-y-4">
                                                    {customer.orders.map((order) => (
                                                        <div key={order.orderId} className="border rounded-lg p-4 bg-slate-50">
                                                            {/* Order Date & Status */}
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h4 className="font-bold text-slate-900">{formatDate(order.orderDate)}</h4>
                                                                <Badge variant={order.status === 'unpaid' ? 'destructive' : 'secondary'}>
                                                                    {order.status.toUpperCase()}
                                                                </Badge>
                                                            </div>

                                                            {/* Items */}
                                                            <div className="bg-white p-3 rounded mb-3 space-y-1">
                                                                <p className="text-xs font-semibold text-slate-600 mb-2">ITEMS:</p>
                                                                {order.items.map((item, idx) => (
                                                                    <div key={idx} className="flex justify-between text-sm">
                                                                        <span className="text-slate-700">
                                                                            • {item.productName} ({item.quantity} × {formatCurrency(item.price)})
                                                                        </span>
                                                                        <span className="font-medium">{formatCurrency(item.total)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Amounts */}
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-slate-600">Order Total:</span>
                                                                    <span className="font-bold">{formatCurrency(order.totalAmount)}</span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-slate-600">Paid:</span>
                                                                    <span className="font-medium text-green-600">{formatCurrency(order.paidAmount)}</span>
                                                                </div>
                                                                <div className="flex justify-between border-t pt-2">
                                                                    <span className="font-semibold text-slate-700">Due Amount:</span>
                                                                    <span className="font-bold text-red-600 text-lg">{formatCurrency(order.dueAmount)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
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
