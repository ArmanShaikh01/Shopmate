import Link from 'next/link'
import SiteHeader from '@/components/site-header'

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <SiteHeader />

            <main className="flex-1 container py-6">
                {children}
            </main>

            <footer className="border-t py-6 bg-white">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-12 md:flex-row">
                    <p className="text-sm text-slate-500 text-center">© 2024 Meri Dukan. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
