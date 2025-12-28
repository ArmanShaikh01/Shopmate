'use client'

import { Card, CardContent } from '@/components/ui/card'

function LoadingBox({ className }: { className?: string }) {
    return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />
}

export default function PaymentsLoading() {
    return (
        <div className="space-y-6">
            <div>
                <LoadingBox className="h-10 w-48 mb-2" />
                <LoadingBox className="h-4 w-64" />
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="space-y-0">
                        <LoadingBox className="h-12 w-full" />
                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                            <LoadingBox key={i} className="h-14 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
