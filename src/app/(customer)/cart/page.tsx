'use client'

import { useCart } from '@/components/providers/cart-provider'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, ShoppingBag } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CartPage() {
    const { items, updateQuantity, removeItem, total, clearCart } = useCart()
    const { toast } = useToast()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleCheckout = async () => {
        setIsSubmitting(true)

        // Prepare payload
        const payloadItems = items.map(i => ({
            productId: i.id,
            quantity: i.quantity,
            priceAtOrder: i.price
        }))

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items: payloadItems }),
            })

            const result = await response.json()

            if (response.ok && result.success) {
                clearCart()
                toast({
                    title: "Order Placed!",
                    description: "Your order has been submitted to the shop.",
                })
                router.push(`/orders?new=${result.orderId}`)
            } else {
                toast({
                    title: "Order Failed",
                    description: result.error + (result.details ? ` (${result.details})` : "") || "Something went wrong.",
                    variant: "destructive"
                })
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Network or Server Error occurred.",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 space-y-4">
                <div className="h-20 w-20 sm:h-24 sm:w-24 bg-slate-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-slate-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Your list is empty</h2>
                <p className="text-sm sm:text-base text-slate-500">Go back and explore our products.</p>
                <Link href="/shop">
                    <Button variant="outline">Browse Shop</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
                <div className="md:col-span-2 space-y-4">
                    <h1 className="text-2xl sm:text-3xl font-bold">Shopping List</h1>

                    <div className="space-y-3 sm:space-y-4">
                        {items.map((item) => (
                            <Card key={item.id} className="p-3 sm:p-4">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm sm:text-base truncate">{item.name}</h3>
                                        <p className="text-xs sm:text-sm text-slate-500">{formatCurrency(item.price)}</p>
                                    </div>

                                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                        <input
                                            type="number"
                                            className="w-14 sm:w-16 p-1 sm:p-1.5 border rounded text-center text-sm"
                                            min="1"
                                            max={item.maxStock}
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 sm:h-9 sm:w-9"
                                            onClick={() => removeItem(item.id)}
                                        >
                                            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-1">
                    <Card className="md:sticky md:top-24">
                        <CardHeader>
                            <CardTitle className="text-lg sm:text-xl">Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Items ({items.reduce((a, b) => a + b.quantity, 0)})</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-base sm:text-lg">
                                <span>Total</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3">
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                size="lg"
                                onClick={handleCheckout}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : 'Place Order'}
                            </Button>
                            <p className="text-xs text-center text-slate-400">
                                Note: Payment is collected at the shop upon pickup.
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
