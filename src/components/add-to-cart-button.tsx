'use client'

import React from 'react'
import { Plus, Minus, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/providers/cart-provider'
import { toast } from '@/hooks/use-toast'

export default function AddToCartButton({ product }: { product: any }) {
    const { addItem, items, updateQuantity } = useCart()
    const cartItem = items.find(i => i.id === product.id)
    const currentQty = cartItem?.quantity || 0
    const availableStock = product.stock_quantity - (product.reserved_quantity || 0)

    const handleAdd = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            maxStock: availableStock
        })
        if (!cartItem) {
            toast({
                title: "Added to cart",
                description: `${product.name} added to your list.`,
                duration: 1500,
            })
        }
    }

    const handleRemove = () => {
        if (cartItem) {
            updateQuantity(product.id, Math.max(0, cartItem.quantity - 1))
        }
    }

    if (currentQty > 0) {
        return (
            <div className="flex items-center justify-between w-full bg-slate-50 rounded-md p-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-white"
                    onClick={(e) => {
                        e.preventDefault()
                        handleRemove()
                    }}
                >
                    <Minus size={14} />
                </Button>
                <span className="text-sm font-semibold w-8 text-center">{currentQty}</span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-white"
                    disabled={currentQty >= availableStock}
                    onClick={(e) => {
                        e.preventDefault()
                        handleAdd()
                    }}
                >
                    <Plus size={14} />
                </Button>
            </div>
        )
    }

    return (
        <Button
            className="w-full"
            onClick={(e) => {
                e.preventDefault()
                handleAdd()
            }}
            disabled={availableStock <= 0}
        >
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to List
        </Button>
    )
}
