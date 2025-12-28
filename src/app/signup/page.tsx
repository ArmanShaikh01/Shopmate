import { signup } from '../auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage({
    searchParams,
}: {
    searchParams: { error?: string }
}) {
    const errorMessage = searchParams.error ? decodeURIComponent(searchParams.error) : null

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 py-8">
            <Card className="w-[450px] border-none shadow-2xl shadow-blue-100/50 rounded-3xl overflow-hidden">
                <CardHeader className="pb-6 pt-8 text-center bg-white text-slate-900 border-b border-slate-50">
                    <div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                        <UserPlus className="text-white" size={28} />
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight">
                        Create Account
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-medium text-sm">
                        Join Meri Dukan as a customer
                    </CardDescription>
                </CardHeader>
                <form action={signup}>
                    <input type="hidden" name="role" value="customer" />
                    <CardContent className="space-y-4 pt-6 pb-4">
                        {errorMessage && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold text-center">
                                {errorMessage}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-slate-700 font-bold ml-1 text-sm">Full Name</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                type="text"
                                placeholder="John Doe"
                                required
                                className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700 font-bold ml-1 text-sm">Email Address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-slate-700 font-bold ml-1 text-sm">Phone Number</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="9876543210"
                                required
                                pattern="[0-9]{10}"
                                className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-700 font-bold ml-1 text-sm">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                minLength={8}
                                className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all"
                            />
                            <p className="text-xs text-slate-500 ml-1">Minimum 8 characters</p>
                        </div>

                        <div className="pt-2 text-xs text-slate-600 text-center">
                            By signing up, you agree to our{' '}
                            <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-700 font-semibold underline">
                                Privacy Policy
                            </Link>
                        </div>
                    </CardContent>
                    <CardFooter className="pb-8 px-8 flex flex-col gap-4">
                        <Button className="w-full h-12 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 shadow-lg transition-all active:scale-[0.98]">
                            Create Account
                        </Button>
                        <div className="text-center text-sm text-slate-600">
                            Already have an account?{' '}
                            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold">
                                Sign In
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
