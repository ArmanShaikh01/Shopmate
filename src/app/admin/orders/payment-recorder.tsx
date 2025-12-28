'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Wallet, IndianRupee, Loader2, ArrowRight } from 'lucide-react'

export default function PaymentRecorder({ orderId, dueAmount }: { orderId: string, dueAmount: number }) {
    const [amount, setAmount] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handlePay = async () => {
        const val = parseFloat(amount)
        if (!val || val <= 0) return

        setLoading(true)
        try {
            const res = await fetch(`/api/admin/orders/${orderId}/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: val, method: 'cash_on_delivery' })
            })
            const json = await res.json()

            if (!res.ok) throw new Error(json.error)

            setAmount('')
            toast({ title: "Payment Recorded", description: `Successfully added ₹${val}` })
            router.refresh()
        } catch (e: any) {
            toast({ title: "Failed", description: e.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                        type="number"
                        placeholder="Enter amount"
                        className="bg-white border-slate-200 text-slate-900 pl-10 rounded-lg h-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-lg"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        disabled={loading}
                    />
                </div>
                <Button
                    onClick={handlePay}
                    disabled={loading || !amount}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-12 px-8 font-semibold flex gap-2 shadow-md transition-all active:scale-95"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                    Accept
                </Button>
            </div>
            <button
                onClick={() => setAmount(dueAmount.toString())}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
            >
                <Wallet size={12} />
                Quick fill: Full amount (₹{dueAmount})
            </button>
        </div>
    )
}
