"use client"

import { useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, User } from 'lucide-react'
import DateWiseKhata from './date-wise-khata'
import CustomerWiseKhata from './customer-wise-khata'

export default function KhataPage() {
    const searchParams = useSearchParams()
    const defaultTab = searchParams.get('tab') || 'date-wise'
    const dateParam = searchParams.get('date')
    const filterParam = searchParams.get('filter')

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Khata / Account Book</h1>
                <p className="text-slate-600">Track daily orders and customer accounts</p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue={defaultTab} className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="date-wise" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        Date-wise
                    </TabsTrigger>
                    <TabsTrigger value="customer-wise" className="gap-2">
                        <User className="w-4 h-4" />
                        Customer-wise
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="date-wise">
                    <DateWiseKhata initialDate={dateParam || undefined} />
                </TabsContent>

                <TabsContent value="customer-wise">
                    <CustomerWiseKhata filterOutstanding={filterParam === 'outstanding'} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
