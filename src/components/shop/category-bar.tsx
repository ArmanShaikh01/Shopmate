"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CategoryBarProps {
    categories: string[]
    selectedCategory: string
    onSelect: (category: string) => void
}

export default function CategoryBar({
    categories,
    selectedCategory,
    onSelect
}: CategoryBarProps) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <Button
                variant={selectedCategory === "All" ? "default" : "secondary"}
                className={cn(
                    "rounded-xl h-10 px-6 font-medium whitespace-nowrap",
                    selectedCategory === "All" ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-none"
                )}
                onClick={() => onSelect("All")}
            >
                All
            </Button>
            {categories.map((category) => (
                <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "secondary"}
                    className={cn(
                        "rounded-xl h-10 px-6 font-medium whitespace-nowrap",
                        selectedCategory === category ? "bg-blue-600 hover:bg-blue-700" : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm"
                    )}
                    onClick={() => onSelect(category)}
                >
                    {category}
                </Button>
            ))}
        </div>
    )
}
