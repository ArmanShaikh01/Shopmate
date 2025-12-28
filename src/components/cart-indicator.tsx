'use client'

import React from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/components/providers/cart-provider'

export default function CartIndicator() {
    const { itemCount } = useCart()

    return (
        <Link href="/cart">
            <Button variant="outline" size="icon" className="relative group">
                <ShoppingCart size={20} className="group-hover:text-blue-600 transition-colors" />
                {itemCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full text-xs">
                        {itemCount}
                    </Badge>
                )}
            </Button>
        </Link>
    )
}
