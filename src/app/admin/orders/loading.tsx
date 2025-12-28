'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'

function LoadingBox({ className }: { className?: string }) {
    return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />
}

export default function OrdersLoading() {
    return (
        <div className="space-y-6">
            <div>
                <LoadingBox className="h-10 w-48 mb-2" />
                <LoadingBox className="h-4 w-64" />
            </div>

            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                    <LoadingBox key={i} className="h-10 w-24" />
                ))}
            </div>

            <Card>
                <CardHeader>
                    <LoadingBox className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <LoadingBox key={i} className="h-16 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
