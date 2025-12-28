import { Button } from "@/components/ui/button"
import { ShoppingCart, Package } from "lucide-react"
import Link from "next/link"

export default function LandingHero() {
    return (
        <div className="relative overflow-hidden bg-white">
            <div className="container relative py-20 lg:py-32">
                <div className="flex flex-col items-center text-center space-y-8">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                        <div className="w-8 h-8 text-white">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-slate-900">Meri Dukan</h2>
                        <p className="text-slate-500 text-sm">Your Local Store</p>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900">
                        Your Neighborhood Store, <span className="text-blue-600">Online</span>
                    </h1>

                    <p className="max-w-[600px] text-lg text-slate-500 md:text-xl">
                        Create your shopping list before visiting. Fresh products, fair prices, trusted service.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button size="lg" className="h-14 px-8 text-lg rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 gap-2 transition-all hover:scale-105 active:scale-95" asChild>
                            <Link href="/shop">
                                <ShoppingCart className="w-5 h-5" />
                                Start Shopping
                                <span className="ml-1 text-blue-200">→</span>
                            </Link>
                        </Button>

                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-2xl border-slate-200 gap-2 transition-all hover:bg-slate-50 hover:scale-105 active:scale-95" asChild>
                            <Link href="/orders">
                                <Package className="w-5 h-5 text-slate-600" />
                                Track Orders
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Abstract Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(59,130,246,0.05)_0%,rgba(255,255,255,0)_100%)]" />
        </div>
    )
}
