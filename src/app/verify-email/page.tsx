'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Loader2, CheckCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

function VerifyEmailForm() {
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [resending, setResending] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get('email') || ''

    const handleVerify = async () => {
        if (otp.length !== 6) {
            toast({ title: "Invalid OTP", description: "Please enter a 6-digit code", variant: "destructive" })
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token: otp })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Verification failed')
            }

            toast({ title: "Success!", description: "Email verified! Please login to continue." })

            // Redirect to login page after verification
            setTimeout(() => {
                router.push('/login?verified=true')
            }, 1500)

        } catch (error: any) {
            toast({ title: "Verification Failed", description: error.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        setResending(true)
        try {
            const res = await fetch('/api/auth/resend-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to resend OTP')
            }

            toast({ title: "OTP Sent!", description: "Check your email for a new code" })
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setResending(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <Card className="w-[450px] border-none shadow-2xl shadow-blue-100/50 rounded-3xl overflow-hidden">
                <CardHeader className="pb-6 pt-10 text-center bg-white text-slate-900 border-b border-slate-50">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                        <Mail className="text-white" size={32} />
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight">
                        Verify Your Email
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-medium text-sm">
                        Enter the 6-digit code sent to
                    </CardDescription>
                    <p className="text-blue-600 font-bold text-sm mt-1">{email}</p>
                </CardHeader>
                <CardContent className="pt-8 pb-10 px-8">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Input
                                type="text"
                                placeholder="000000"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="h-16 text-center text-2xl font-bold tracking-widest rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600/20"
                                disabled={loading}
                            />
                            <p className="text-xs text-slate-500 text-center">
                                Check your email inbox and spam folder
                            </p>
                        </div>

                        <Button
                            onClick={handleVerify}
                            disabled={loading || otp.length !== 6}
                            className="w-full h-14 rounded-2xl font-bold text-lg bg-slate-900 hover:bg-slate-800 shadow-xl transition-all active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={20} />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2" size={20} />
                                    Verify Email
                                </>
                            )}
                        </Button>

                        <div className="text-center">
                            <button
                                onClick={handleResend}
                                disabled={resending}
                                className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {resending ? 'Sending...' : 'Resend OTP'}
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        }>
            <VerifyEmailForm />
        </Suspense>
    )
}
