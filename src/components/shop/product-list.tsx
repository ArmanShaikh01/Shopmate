"use client"

import { useState } from "react"
import CategoryBar from "./category-bar"
import ProductCard from "./product-card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface Product {
    id: string
    name: string
    category: string | null
    price: number
    stock_quantity: number
}

interface ProductListProps {
    initialProducts: Product[]
    isLoggedIn: boolean
}

export default function ProductList({ initialProducts, isLoggedIn }: ProductListProps) {
    const [search, setSearch] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")

    const categories = Array.from(new Set(initialProducts.map(p => p.category))).filter(Boolean) as string[]

    const filteredProducts = initialProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.category?.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = selectedCategory === "All" || p.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="space-y-4 sticky top-0 bg-slate-50/95 backdrop-blur-sm z-30 py-4 pt-0">
                <div className="relative max-w-2xl mx-auto lg:mx-0">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                        placeholder="Search products..."
                        className="h-12 sm:h-14 pl-12 rounded-2xl border-slate-200 bg-white text-base sm:text-lg focus:ring-2 focus:ring-blue-100 shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <CategoryBar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}
                />
            </div>

            {/* Product List */}
            <div className="space-y-0">
                {filteredProducts.length > 0 ? (
                    <>
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                isLoggedIn={isLoggedIn}
                            />
                        ))}
                    </>
                ) : (
                    <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200">
                        <p className="text-slate-400 text-base">No products found matching your criteria</p>
                    </div>
                )}
            </div>
        </div>
    )
}
