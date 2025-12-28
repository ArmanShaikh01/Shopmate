import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <Link href="/">
                    <Button variant="ghost" className="mb-6">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Home
                    </Button>
                </Link>

                <Card className="shadow-xl border-none">
                    <CardHeader className="border-b bg-white">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                <Shield className="text-white" size={20} />
                            </div>
                            <CardTitle className="text-3xl font-black">Privacy Policy</CardTitle>
                        </div>
                        <p className="text-sm text-slate-500">
                            Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-slate-900">1. Information We Collect</h2>
                            <div className="text-slate-700 space-y-2 leading-relaxed">
                                <p>We collect information that you provide directly to us when you:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Create an account (name, email, phone number)</li>
                                    <li>Place an order (delivery address, order details)</li>
                                    <li>Contact us for support</li>
                                </ul>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-slate-900">2. How We Use Your Information</h2>
                            <div className="text-slate-700 space-y-2 leading-relaxed">
                                <p>We use the information we collect to:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Process and fulfill your orders</li>
                                    <li>Send you order updates and notifications</li>
                                    <li>Provide customer support</li>
                                    <li>Improve our services and user experience</li>
                                    <li>Prevent fraud and ensure security</li>
                                </ul>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-slate-900">3. Data Storage and Security</h2>
                            <div className="text-slate-700 space-y-2 leading-relaxed">
                                <p>
                                    Your data is stored securely using Supabase, a secure cloud database platform.
                                    We implement industry-standard security measures including:
                                </p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Encrypted password storage</li>
                                    <li>Secure HTTPS connections</li>
                                    <li>Row-level security policies</li>
                                    <li>Regular security audits</li>
                                </ul>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-slate-900">4. Information Sharing</h2>
                            <div className="text-slate-700 leading-relaxed">
                                <p>
                                    We do not sell, trade, or rent your personal information to third parties.
                                    Your information is only shared with:
                                </p>
                                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                                    <li>The shopkeeper, for order fulfillment purposes only</li>
                                    <li>Service providers who assist in our operations (hosting, email services)</li>
                                </ul>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-slate-900">5. Your Rights</h2>
                            <div className="text-slate-700 space-y-2 leading-relaxed">
                                <p>You have the right to:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Access your personal data</li>
                                    <li>Update or correct your information</li>
                                    <li>Delete your account and associated data</li>
                                    <li>Opt-out of promotional communications</li>
                                    <li>Request a copy of your data</li>
                                </ul>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-slate-900">6. Cookies and Tracking</h2>
                            <div className="text-slate-700 leading-relaxed">
                                <p>
                                    We use essential cookies to maintain your login session and provide core functionality.
                                    We do not use tracking cookies or third-party analytics at this time.
                                </p>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-slate-900">7. Children's Privacy</h2>
                            <div className="text-slate-700 leading-relaxed">
                                <p>
                                    Our services are not directed to children under 13. We do not knowingly collect
                                    personal information from children under 13. If you believe we have collected such
                                    information, please contact us immediately.
                                </p>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-slate-900">8. Changes to This Policy</h2>
                            <div className="text-slate-700 leading-relaxed">
                                <p>
                                    We may update this privacy policy from time to time. We will notify you of any
                                    significant changes by posting the new policy on this page and updating the
                                    "Last updated" date.
                                </p>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-bold text-slate-900">9. Contact Us</h2>
                            <div className="text-slate-700 leading-relaxed">
                                <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                                <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <p className="font-semibold">Meri Dukan</p>
                                    <p className="text-sm">Email: privacy@meridukan.com</p>
                                    <p className="text-sm">Phone: +91 XXX XXX XXXX</p>
                                </div>
                            </div>
                        </section>

                        <div className="pt-6 border-t">
                            <p className="text-sm text-slate-500 leading-relaxed">
                                By using Meri Dukan, you acknowledge that you have read and understood this Privacy Policy
                                and agree to its terms.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
