'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Store, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()

    const emailVerified = searchParams.get('verified') === 'true'

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const supabase = createClient()

            // Sign in
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (authError) {
                // Show user-friendly error messages
                if (authError.message.includes('Invalid login credentials')) {
                    setError('Invalid email or password. Please check and try again.')
                } else if (authError.message.includes('Email not confirmed')) {
                    setError('Please verify your email first. Check your inbox for the verification link.')
                    router.push(`/verify-email?email=${encodeURIComponent(email)}`)
                    return
                } else {
                    setError(authError.message)
                }
                setLoading(false)
                return
            }

            const user = authData.user
            if (!user) {
                setError('Login failed. Please try again.')
                setLoading(false)
                return
            }

            // Fetch role from profiles table (single optimized query)
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            const userRole = profile?.role || 'customer'

            // Refresh router to ensure session is established
            router.refresh()

            // Small delay to ensure cookies are set
            await new Promise(resolve => setTimeout(resolve, 100))

            // Client-side redirect
            if (userRole === 'shopkeeper') {
                router.push('/admin/dashboard')
            } else {
                router.push('/shop')
            }

        } catch (err: any) {
            setError('Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-4">
            <Card className="w-full max-w-md border-none shadow-2xl shadow-blue-100/50 rounded-3xl overflow-hidden">
                <CardHeader className="pb-8 pt-10 text-center bg-white text-slate-900 border-b border-slate-50">
                    <div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                        <Store className="text-white" size={28} />
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight">
                        Welcome Back
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-medium text-base">
                        Sign in to your account
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4 pt-8 px-6 sm:px-8">
                        {emailVerified && (
                            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-700 text-sm font-semibold text-center">
                                ✅ Email verified! Please login to continue.
                            </div>
                        )}

                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold flex items-start gap-3">
                                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                                <span>{error}</span>
                            </div>
                        )}

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
                            <Label htmlFor="password" className="text-slate-700 font-bold ml-1 text-sm">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all text-base"
                                disabled={loading}
                            />
                            <div className="text-right">
                                <Link
                                    href="/forgot-password"
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
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
                                    Signing In...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                        <div className="text-center text-sm text-slate-600">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-bold">
                                Sign Up
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}
