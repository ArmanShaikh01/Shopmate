"use client"

import { Button } from "@/components/ui/button"
import { Minus, Plus, Package } from "lucide-react"
import { useCart } from "@/components/providers/cart-provider"
import { useRouter } from "next/navigation"

interface ProductCardProps {
    product: any
    isLoggedIn: boolean
}

export default function ProductCard({ product, isLoggedIn }: ProductCardProps) {
    const { items, addItem, updateQuantity } = useCart()
    const router = useRouter()

    const cartItem = items.find((item) => item.id === product.id)
    const availableStock = product.stock_quantity - product.reserved_quantity
    const totalPrice = cartItem ? (cartItem.quantity * product.price).toFixed(0) : 0

    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.preventDefault()
        if (!isLoggedIn) {
            router.push("/login")
            return
        }
        action()
    }

    return (
        <div className="group relative bg-white rounded-2xl p-4 sm:p-5 mb-3 border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all duration-200">
            {/* Mobile Layout: Stacked */}
            <div className="flex flex-col sm:hidden gap-3">
                {/* Top Row: Icon, Name, Price */}
                <div className="flex items-start gap-3">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-slate-900 mb-0.5">
                            {product.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                            {product.category || 'General'}
                        </p>
                    </div>
                    <div className="text-right shrink-0">
                        <div className="font-bold text-lg text-slate-900">₹{product.price}</div>
                        <div className="text-xs text-slate-500">per {product.unit || 'pc'}</div>
                    </div>
                </div>

                {/* Bottom Row: Stock, Controls, Total */}
                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-slate-600">
                        <span className="font-medium">{availableStock}</span> {product.unit || 'pc'} available
                    </div>
                    <div className="flex items-center gap-3">
                        {cartItem ? (
                            <div className="flex items-center gap-2 bg-blue-600 rounded-full px-2 py-1.5 shadow-md">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-white hover:bg-white/20 rounded-full transition-all active:scale-90"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        updateQuantity(product.id, Math.max(0, cartItem.quantity - 1))
                                    }}
                                >
                                    <Minus className="w-4 h-4" />
                                </Button>
                                <span className="min-w-[2rem] text-center font-bold text-white text-base">
                                    {cartItem.quantity}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-white hover:bg-white/20 rounded-full transition-all active:scale-90"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        updateQuantity(product.id, Math.min(availableStock, cartItem.quantity + 1))
                                    }}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                size="sm"
                                className="h-9 px-5 rounded-full bg-white border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-semibold text-sm gap-1.5 transition-all active:scale-95"
                                onClick={(e) => handleAction(e, () => addItem({
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    maxStock: availableStock
                                }))}
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </Button>
                        )}
                        {cartItem && (
                            <div className="text-right">
                                <div className="font-bold text-base text-blue-600">₹{totalPrice}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop Layout: Horizontal */}
            <div className="hidden sm:flex items-center gap-3">
                {/* Product Icon */}
                <div className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" strokeWidth={2} />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-slate-900 truncate mb-0.5">
                        {product.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                        {product.category || 'General'}
                    </p>
                </div>

                {/* Price */}
                <div className="text-right shrink-0 w-[70px]">
                    <div className="font-bold text-lg text-slate-900">₹{product.price}</div>
                    <div className="text-xs text-slate-500">per {product.unit || 'pc'}</div>
                </div>

                {/* Available Quantity */}
                <div className="text-center shrink-0 w-[70px]">
                    <div className="text-sm font-medium text-slate-600">{availableStock} {product.unit || 'pc'}</div>
                </div>

                {/* Quantity Controls */}
                <div className="shrink-0 w-[120px] flex justify-center">
                    {cartItem ? (
                        <div className="flex items-center gap-2 bg-blue-600 rounded-full px-2 py-1.5 shadow-md">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-white hover:bg-white/20 rounded-full transition-all active:scale-90"
                                onClick={(e) => {
                                    e.preventDefault()
                                    updateQuantity(product.id, Math.max(0, cartItem.quantity - 1))
                                }}
                            >
                                <Minus className="w-4 h-4" />
                            </Button>
                            <span className="min-w-[2rem] text-center font-bold text-white text-base">
                                {cartItem.quantity}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-white hover:bg-white/20 rounded-full transition-all active:scale-90"
                                onClick={(e) => {
                                    e.preventDefault()
                                    updateQuantity(product.id, Math.min(availableStock, cartItem.quantity + 1))
                                }}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <Button
                            size="sm"
                            className="h-9 px-5 rounded-full bg-white border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-semibold text-sm gap-1.5 transition-all active:scale-95"
                            onClick={(e) => handleAction(e, () => addItem({
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                maxStock: availableStock
                            }))}
                        >
                            <Plus className="w-4 h-4" />
                            Add
                        </Button>
                    )}
                </div>

                {/* Total Price */}
                <div className="text-right shrink-0 w-[80px]">
                    {cartItem ? (
                        <>
                            <div className="font-bold text-lg text-blue-600">₹{totalPrice}</div>
                            <div className="text-xs text-slate-400">↗ {cartItem.quantity} × ₹{product.price}</div>
                        </>
                    ) : (
                        <div className="text-slate-300">—</div>
                    )}
                </div>
            </div>
        </div>
    )
}
