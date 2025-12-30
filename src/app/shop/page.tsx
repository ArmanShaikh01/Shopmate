import { createClient } from '@/lib/supabase/server'
import ProductList from '@/components/shop/product-list'
import ViewCartBar from '@/components/shop/view-cart-bar'

export const metadata = {
    title: 'Shop | Meri Dukan',
    description: 'Browse our fresh inventory',
}

export const revalidate = 0

export default async function ShopPage() {
    const supabase = createClient()

    // Check if user is logged in for the client component
    const { data: { user } } = await supabase.auth.getUser()

    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name')

    return (
        <div className="min-h-screen bg-slate-50">
            <main className="container py-6 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6 pb-6 sm:pb-28">
                <div className="mb-8 sm:mb-10">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            Shopping List
                        </h1>
                        <a
                            href="/"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl transition-all border border-slate-200 hover:border-slate-300 shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Home
                        </a>
                    </div>
                    <p className="text-slate-500 font-medium text-sm sm:text-base">
                        Build your pre-order list • Fresh daily inventory
                    </p>
                </div>

                <ProductList
                    initialProducts={products || []}
                    isLoggedIn={!!user}
                />
            </main>

            <ViewCartBar />

            <footer className="border-t py-8 sm:py-10 bg-white mt-12 sm:mt-16">
                <div className="container text-center px-4">
                    <p className="text-xs sm:text-sm text-slate-400 font-medium">
                        © 2026 Meri Dukan. All products sourced locally.
                    </p>
                </div>
            </footer>
        </div>
    )
}
