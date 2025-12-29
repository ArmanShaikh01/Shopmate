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
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    className="fixed bottom-4 right-4 sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto w-auto sm:w-[calc(100%-2rem)] max-w-2xl z-[9999] pointer-events-none"
                >
                    <div className="bg-white/95 backdrop-blur-xl border border-blue-100 rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-2xl shadow-blue-200/50 flex items-center justify-between gap-2 pointer-events-auto">
                        <div className="flex items-center gap-2 sm:gap-4 pl-2 sm:pl-4">
                            <div className="relative">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                    <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 rounded-full border-2 sm:border-4 border-white flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white">
                                    {itemCount}
                                </div>
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-xs sm:text-sm font-medium text-slate-500">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                                <p className="text-lg sm:text-xl font-bold text-slate-900">₹{total.toFixed(0)}</p>
                            </div>
                        </div>

                        <Button size="lg" className="h-10 sm:h-14 px-4 sm:px-8 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 gap-1 sm:gap-2 font-semibold text-sm sm:text-base transition-all hover:scale-105 active:scale-95 group" asChild>
                            <Link href="/cart">
                                <span className="hidden sm:inline">View Cart</span>
                                <span className="sm:hidden">₹{total.toFixed(0)}</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
