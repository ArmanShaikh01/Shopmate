"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface Customer {
    id: string
    name: string
    phone: string
}

interface OrderItem {
    productName: string
    quantity: number
    unit: string
    price: number
    total: number
}

interface Payment {
    date: string
    amount: number
    method: string
}

interface Order {
    orderId: string
    orderDate: string
    items: OrderItem[]
    totalAmount: number
    payments: Payment[]
    paidAmount: number
    dueAmount: number
}

interface CustomerData {
    customer: Customer
    summary: {
        totalOrders: number
        totalAmount: number
        totalPaid: number
        outstandingBalance: number
    }
    orders: Order[]
}

export default function CustomerWiseKhata({ filterOutstanding = false }: { filterOutstanding?: boolean }) {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
    const [data, setData] = useState<CustomerData | null>(null)
    const [loading, setLoading] = useState(false)
    const [loadingCustomers, setLoadingCustomers] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchCustomers()
    }, [])

    const fetchCustomers = async () => {
        try {
            setLoadingCustomers(true)
            const response = await fetch('/api/admin/khata/customers')

            if (!response.ok) {
                throw new Error('Failed to fetch customers')
            }

            const result = await response.json()
            setCustomers(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoadingCustomers(false)
        }
    }

    const fetchCustomerData = async (customerId: string) => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch(`/api/admin/khata/customer-wise?customerId=${customerId}`)

            if (!response.ok) {
                throw new Error('Failed to fetch customer data')
            }

            const result = await response.json()
            setData(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleCustomerChange = (customerId: string) => {
        setSelectedCustomerId(customerId)
        fetchCustomerData(customerId)
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

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="space-y-6">
            {/* Customer Selector */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Customer</CardTitle>
                    <CardDescription>View complete account history for a customer</CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingCustomers ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <Select value={selectedCustomerId} onValueChange={handleCustomerChange}>
                            <SelectTrigger className="max-w-md">
                                <SelectValue placeholder="Choose a customer" />
                            </SelectTrigger>
                            <SelectContent>
                                {customers.map((customer) => (
                                    <SelectItem key={customer.id} value={customer.id}>
                                        {customer.name} - {customer.phone}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
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
                    {/* Customer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">{data.customer.name}</CardTitle>
                            <CardDescription className="text-base">{data.customer.phone}</CardDescription>
                        </CardHeader>
                    </Card>

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
                                <CardDescription>Total Paid</CardDescription>
                                <CardTitle className="text-3xl text-green-600">{formatCurrency(data.summary.totalPaid)}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Outstanding Balance</CardDescription>
                                <CardTitle className="text-3xl text-red-600">{formatCurrency(data.summary.outstandingBalance)}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Orders History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order History</CardTitle>
                            <CardDescription>Complete account details (most recent first)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data.orders.length === 0 ? (
                                <p className="text-center text-slate-500 py-8">No orders found</p>
                            ) : (
                                <div className="space-y-6">
                                    {data.orders.map((order) => (
                                        <div key={order.orderId} className="border rounded-lg p-4 space-y-3">
                                            {/* Order Date */}
                                            <div className="flex items-center justify-between border-b pb-2">
                                                <h3 className="font-bold text-lg text-slate-900">
                                                    {formatDate(order.orderDate)}
                                                </h3>
                                                <span className="text-sm text-slate-500">{formatDateTime(order.orderDate)}</span>
                                            </div>

                                            {/* Items */}
                                            <div className="space-y-1 bg-slate-50 p-3 rounded">
                                                <p className="text-xs font-semibold text-slate-600 mb-2">ITEMS ORDERED:</p>
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span className="text-slate-700">
                                                            • {item.productName} ({item.quantity} {item.unit} × {formatCurrency(item.price)})
                                                        </span>
                                                        <span className="font-medium">{formatCurrency(item.total)}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Order Total */}
                                            <div className="flex justify-between font-bold text-base border-t pt-2">
                                                <span>Total:</span>
                                                <span>{formatCurrency(order.totalAmount)}</span>
                                            </div>

                                            {/* Payments */}
                                            {order.payments.length > 0 && (
                                                <div className="bg-green-50 p-3 rounded space-y-1">
                                                    <p className="text-xs font-semibold text-green-700 mb-2">PAYMENTS RECEIVED:</p>
                                                    {order.payments.map((payment, idx) => (
                                                        <div key={idx} className="flex justify-between text-sm">
                                                            <span className="text-green-700">
                                                                {formatDate(payment.date)} - {payment.method}
                                                            </span>
                                                            <span className="font-semibold text-green-700">
                                                                {formatCurrency(payment.amount)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between font-bold text-sm border-t border-green-200 pt-1 mt-1">
                                                        <span className="text-green-700">Total Paid:</span>
                                                        <span className="text-green-700">{formatCurrency(order.paidAmount)}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Due Amount */}
                                            {order.dueAmount > 0 ? (
                                                <div className="bg-red-50 p-3 rounded">
                                                    <div className="flex justify-between font-bold text-base">
                                                        <span className="text-red-700">Remaining Due:</span>
                                                        <span className="text-red-700">{formatCurrency(order.dueAmount)}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-green-50 p-2 rounded text-center">
                                                    <span className="text-sm font-semibold text-green-700">✓ FULLY PAID</span>
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
