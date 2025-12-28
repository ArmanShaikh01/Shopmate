import { resetPassword } from '../auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock } from 'lucide-react'

export default function ResetPasswordPage({
    searchParams,
}: {
    searchParams: { error?: string }
}) {
    const errorMessage = searchParams.error ? decodeURIComponent(searchParams.error) : null

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <Card className="w-[400px] border-none shadow-2xl shadow-blue-100/50 rounded-3xl overflow-hidden">
                <CardHeader className="pb-8 pt-10 text-center bg-white text-slate-900 border-b border-slate-50">
                    <div className="mx-auto w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                        <Lock className="text-white" size={24} />
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight">
                        Reset Password
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-medium">
                        Enter your new password
                    </CardDescription>
                </CardHeader>
                <form action={resetPassword}>
                    <CardContent className="space-y-4 pt-8">
                        {errorMessage && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold text-center">
                                {errorMessage}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-700 font-bold ml-1 text-sm">
                                New Password
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                minLength={8}
                                className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all text-base"
                            />
                            <p className="text-xs text-slate-500 ml-1">Minimum 8 characters</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-slate-700 font-bold ml-1 text-sm">
                                Confirm Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                required
                                minLength={8}
                                className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all text-base"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="pb-10 px-8">
                        <Button className="w-full h-14 rounded-2xl font-bold text-lg bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-[0.98]">
                            Reset Password
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
