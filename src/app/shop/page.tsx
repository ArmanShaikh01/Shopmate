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
            <main className="container py-6 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6">
                <div className="mb-8 sm:mb-10">
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
                        Shopping List
                    </h1>
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
                        © 2024 Meri Dukan. All products sourced locally.
                    </p>
                </div>
            </footer>
        </div>
    )
}
