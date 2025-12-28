'use client'

import { Card, CardContent } from '@/components/ui/card'

function LoadingBox({ className }: { className?: string }) {
    return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />
}

export default function ReportsLoading() {
    return (
        <div className="space-y-6">
            <div>
                <LoadingBox className="h-10 w-64 mb-2" />
                <LoadingBox className="h-4 w-80" />
            </div>

            <div className="flex gap-4">
                <LoadingBox className="h-10 w-32" />
                <LoadingBox className="h-10 w-32" />
            </div>

            <div className="grid gap-4 grid-cols-4">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <LoadingBox className="h-4 w-24 mb-4" />
                            <LoadingBox className="h-8 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <LoadingBox key={i} className="h-24 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
