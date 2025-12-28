import LandingHero from "@/components/landing-hero";
import SiteHeader from "@/components/site-header";

export default function Home() {
    return (
        <div className="min-h-screen bg-white">
            <SiteHeader />
            <main>
                <LandingHero />

                {/* Why Choose Us Section */}
                <section className="container py-24 border-t border-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="space-y-4 p-8 rounded-3xl bg-slate-50/50">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Fresh Products</h3>
                            <p className="text-slate-500">Hand-picked daily essentials for your family's needs.</p>
                        </div>
                        <div className="space-y-4 p-8 rounded-3xl bg-slate-50/50">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                    <line x1="8" y1="21" x2="16" y2="21" />
                                    <line x1="12" y1="17" x2="12" y2="21" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Online Pickup</h3>
                            <p className="text-slate-500">Order from home and pick up when it's ready.</p>
                        </div>
                        <div className="space-y-4 p-8 rounded-3xl bg-slate-50/50">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Trusted Store</h3>
                            <p className="text-slate-500">Your local trusted partner for years.</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="container text-center text-sm">
                    <p>© 2024 Meri Dukan. Built with ❤️ for our community.</p>
                </div>
            </footer>
        </div>
    );
}
