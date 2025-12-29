'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { useToast } from '@/hooks/use-toast'

export default function SignupPage() {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const { toast } = useToast()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Validate inputs
        if (!email || !password || !fullName || !phone) {
            setError('All fields are required')
            setLoading(false)
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters')
            setLoading(false)
            return
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            setError('Phone number must be 10 digits')
            setLoading(false)
            return
        }

        try {
            // Create user with admin client (auto-confirmed)
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    fullName,
                    phone,
                }),
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                setError(result.error || 'Signup failed. Please try again.')
                setLoading(false)
                return
            }

            // Auto-login the user
            const supabase = createClient()
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (signInError) {
                setError('Account created but login failed. Please try logging in.')
                setLoading(false)
                return
            }

            // Show success toast
            toast({
                title: "Account Created! 🎉",
                description: "Welcome to Meri Dukan! Redirecting to shop...",
                duration: 3000,
            })

            // Fast client-side redirect
            setTimeout(() => {
                router.push('/shop')
                router.refresh()
            }, 500)

        } catch (err: any) {
            setError('Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-4">
            <Card className="w-full max-w-md border-none shadow-2xl shadow-blue-100/50 rounded-3xl overflow-hidden">
                <CardHeader className="pb-6 pt-8 text-center bg-white text-slate-900 border-b border-slate-50">
                    <div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                        <UserPlus className="text-white" size={28} />
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight">
                        Create Account
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-medium text-base">
                        Join Meri Dukan as a customer
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSignup}>
                    <CardContent className="space-y-4 pt-6 pb-4 px-6 sm:px-8">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold flex items-start gap-3">
                                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-slate-700 font-bold ml-1 text-sm">Full Name</Label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="John Doe"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all text-base"
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700 font-bold ml-1 text-sm">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all text-base"
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-slate-700 font-bold ml-1 text-sm">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="9876543210"
                                required
                                pattern="[0-9]{10}"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all text-base"
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-700 font-bold ml-1 text-sm">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all text-base"
                                disabled={loading}
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
                    <CardFooter className="pb-10 px-6 sm:px-8 flex flex-col gap-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 rounded-2xl font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
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
