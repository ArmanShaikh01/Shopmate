'use client'

import { Card, CardContent } from '@/components/ui/card'

function LoadingBox({ className }: { className?: string }) {
    return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />
}

export default function DashboardLoading() {
    return (
        <div className="space-y-8">
            <div>
                <LoadingBox className="h-10 w-48 mb-2" />
                <LoadingBox className="h-4 w-96" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="rounded-3xl">
                        <CardContent className="p-6">
                            <LoadingBox className="h-4 w-24 mb-4" />
                            <LoadingBox className="h-8 w-32 mb-2" />
                            <LoadingBox className="h-3 w-40" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardContent className="p-6">
                        <LoadingBox className="h-6 w-32 mb-4" />
                        <LoadingBox className="h-4 w-64" />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardContent className="p-6">
                        <LoadingBox className="h-6 w-32 mb-4" />
                        <LoadingBox className="h-4 w-48" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
