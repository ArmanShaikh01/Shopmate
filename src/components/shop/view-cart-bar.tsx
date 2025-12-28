"use client"

import { useCart } from "@/components/providers/cart-provider"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function ViewCartBar() {
    const { items, total } = useCart()
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)

    return (
        <AnimatePresence>
            {itemCount > 0 && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl z-50"
                >
                    <div className="bg-white/80 backdrop-blur-xl border border-blue-100 rounded-3xl p-3 shadow-2xl shadow-blue-200/50 flex items-center justify-between">
                        <div className="flex items-center gap-4 pl-4">
                            <div className="relative">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-bold text-white">
                                    {itemCount}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{itemCount} items in cart</p>
                                <p className="text-xl font-bold text-slate-900">₹{total.toFixed(2)}</p>
                            </div>
                        </div>

                        <Button size="lg" className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 gap-2 font-semibold transition-all hover:scale-105 active:scale-95 group" asChild>
                            <Link href="/cart">
                                View Cart
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
