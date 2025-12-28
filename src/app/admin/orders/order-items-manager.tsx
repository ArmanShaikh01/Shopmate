'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { Trash2, Package, History } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

export default function OrderItemsManager({ order, items }: { order: any, items: any[] }) {
    const isEditable = order.status === 'pending' || order.status === 'confirmed'

    return (
        <div className="space-y-6">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                            <th className="pb-4 pl-4">Product Details</th>
                            <th className="pb-4 text-center">Quantity</th>
                            <th className="pb-4 text-right">Unit Price</th>
                            <th className="pb-4 text-right pr-4">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {items.map((item) => (
                            <ItemRow key={item.id} item={item} orderId={order.id} editable={isEditable} />
                        ))}
                    </tbody>
                </table>
            </div>

            {items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                    <Package size={32} className="opacity-20" />
                    <div className="italic font-medium">No items found in this order.</div>
                </div>
            )}
        </div>
    )
}

function ItemRow({ item, orderId, editable }: { item: any, orderId: string, editable: boolean }) {
    const [qty, setQty] = useState(item.quantity)
    const [isSaving, setIsSaving] = useState(false)
    const router = useRouter()

    const handleBlur = async () => {
        if (qty === item.quantity) return
        setIsSaving(true)
        try {
            const res = await fetch(`/api/admin/orders/${orderId}/items`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    itemId: item.id,
                    productId: item.product_id,
                    oldQty: item.quantity,
                    newQty: qty
                })
            })
            if (!res.ok) throw new Error('Failed to update quantity')

            toast({ title: "Quantity Updated", description: "The order item has been updated." })
            router.refresh()
        } catch (e) {
            toast({ title: "Update Failed", description: "Insufficient stock or error.", variant: "destructive" })
            setQty(item.quantity) // Revert
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to remove this item?")) return

        try {
            const res = await fetch(`/api/admin/orders/${orderId}/items`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    itemId: item.id,
                    productId: item.product_id,
                    quantity: item.quantity
                })
            })
            if (!res.ok) throw new Error('Failed to remove item')
            toast({ title: "Item Removed" })
            router.refresh()
        } catch (e) {
            toast({ title: "Error", variant: "destructive" })
        }
    }

    return (
        <tr className="group hover:bg-slate-50/50 transition-colors">
            <td className="py-4 pl-4">
                <div className="font-bold text-slate-800">{item.products?.name || 'Unknown Product'}</div>
                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.products?.unit || 'pcs'}</div>
            </td>

            <td className="py-4">
                <div className="flex justify-center">
                    {editable ? (
                        <div className="relative group/input flex items-center gap-2">
                            <Input
                                type="number"
                                className="h-9 w-20 text-center font-bold bg-white border-slate-200 rounded-lg focus:ring-blue-500 transition-all shadow-sm"
                                value={qty}
                                onChange={e => setQty(parseInt(e.target.value) || 0)}
                                onBlur={handleBlur}
                                disabled={isSaving}
                            />
                            {isSaving && <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />}
                        </div>
                    ) : (
                        <Badge variant="secondary" className="font-black text-slate-600 px-3 py-1 bg-slate-100 border-none">
                            {item.quantity}
                        </Badge>
                    )}
                </div>
            </td>

            <td className="py-4 text-right font-mono text-slate-500">
                {formatCurrency(item.price_at_time)}
            </td>

            <td className="py-4 text-right pr-4">
                <div className="flex items-center justify-end gap-3">
                    <div className="font-black text-slate-900 tracking-tighter text-base">
                        {formatCurrency(item.price_at_time * qty)}
                    </div>
                    {editable && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            onClick={handleDelete}
                        >
                            <Trash2 size={16} />
                        </Button>
                    )}
                </div>
            </td>
        </tr>
    )
}
