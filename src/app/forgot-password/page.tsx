import { forgotPassword } from '../auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { KeyRound, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage({
    searchParams,
}: {
    searchParams: { error?: string, success?: string }
}) {
    const errorMessage = searchParams.error ? decodeURIComponent(searchParams.error) : null
    const success = searchParams.success === 'true'

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <Card className="w-[400px] border-none shadow-2xl shadow-blue-100/50 rounded-3xl overflow-hidden">
                <CardHeader className="pb-8 pt-10 text-center bg-white text-slate-900 border-b border-slate-50">
                    <div className="mx-auto w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                        <KeyRound className="text-white" size={24} />
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight">
                        Forgot Password?
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-medium">
                        {success ? 'Check your email' : 'We\'ll send you a reset link'}
                    </CardDescription>
                </CardHeader>

                {success ? (
                    <CardContent className="pt-8 pb-10 px-8">
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="text-green-600" size={32} />
                            </div>
                            <div className="space-y-2">
                                <p className="text-slate-700 font-semibold">Email sent successfully!</p>
                                <p className="text-sm text-slate-600">
                                    Check your inbox for a password reset link.
                                    If you don't see it, check your spam folder.
                                </p>
                            </div>
                            <Link href="/login">
                                <Button variant="outline" className="mt-6 rounded-xl">
                                    <ArrowLeft size={16} className="mr-2" />
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                ) : (
                    <form action={forgotPassword}>
                        <CardContent className="space-y-4 pt-8">
                            {errorMessage && (
                                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold text-center">
                                    {errorMessage}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700 font-bold ml-1 text-sm">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all text-base"
                                />
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Enter the email address associated with your account and we'll send you a link to reset your password.
                            </p>
                        </CardContent>
                        <CardFooter className="pb-10 px-8 flex flex-col gap-4">
                            <Button className="w-full h-14 rounded-2xl font-bold text-lg bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-[0.98]">
                                Send Reset Link
                            </Button>
                            <Link href="/login" className="text-center text-sm text-slate-600 hover:text-slate-900 font-semibold flex items-center justify-center gap-2">
                                <ArrowLeft size={14} />
                                Back to Login
                            </Link>
                        </CardFooter>
                    </form>
                )}
            </Card>
        </div>
    )
}
