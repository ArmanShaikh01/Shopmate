'use client'

import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Package, XCircle, Loader2 } from 'lucide-react'

export default function OrderActions({ order }: { order: any }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleStatusChange = async (newStatus: string) => {
        if (!confirm(`Mark status as ${newStatus.toUpperCase()}?`)) return
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/orders/${order.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newStatus })
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error)

            toast({ title: "Success", description: `Order status updated to ${newStatus}.` })
            router.refresh()
        } catch (e: any) {
            toast({ title: "Update Failed", description: e.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const currentStatus = order.status?.toLowerCase() || 'pending'

    return (
        <div className="flex flex-wrap gap-2">
            {currentStatus === 'pending' && (
                <>
                    <Button variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 gap-2" onClick={() => handleStatusChange('cancelled')} disabled={loading}>
                        <XCircle size={18} /> Reject
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 gap-2" onClick={() => handleStatusChange('confirmed')} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />} Confirm Order
                    </Button>
                </>
            )}

            {currentStatus === 'confirmed' && (
                <Button className="bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-100 gap-2" onClick={() => handleStatusChange('packed')} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Package size={18} />} Mark as Packed
                </Button>
            )}

            {currentStatus === 'packed' && (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-sm font-bold">
                    <Package size={16} /> ORDER READY FOR PICKUP
                </div>
            )}
        </div>
    )
}
