'use client'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteProduct } from './actions'
import { toast } from '@/hooks/use-toast'

export function DeleteProductButton({ id }: { id: string }) {
    const handleDelete = async (formData: FormData) => {
        if (!confirm('Are you sure you want to delete this product?')) return

        try {
            await deleteProduct(formData)
            toast({ title: 'Deleted', description: 'Product removed from inventory.' })
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' })
        }
    }

    return (
        <form action={handleDelete} className="inline-block">
            <input type="hidden" name="id" value={id} />
            <Button variant="ghost" size="sm" type="submit" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
            </Button>
        </form>
    )
}
