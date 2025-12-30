import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
    return (
        <div className="space-y-8">
            <div>
                <Skeleton className="h-9 w-48 mb-2" />
                <Skeleton className="h-5 w-96" />
            </div>

            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="rounded-2xl sm:rounded-3xl min-h-[120px] sm:min-h-[140px]">
                        <CardHeader className="p-4 sm:p-6 pb-2">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 pt-0">
                            <Skeleton className="h-8 w-32 mb-2" />
                            <Skeleton className="h-3 w-40" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-64" />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-64" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
