import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/auth/store';
import { api } from '@/api/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import { Lock, Mail, Loader2 } from 'lucide-react';

export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });
            const { access_token, user } = response.data;

            login(access_token, user);
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            setError('Credenciais inválidas ou erro no servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    const fillCredentialsBetim = () => {
        setError('');
        setEmail('betim@contas.com.br');
        setPassword('betim123');
    };

    const fillCredentialsLidy = () => {
        setError('');
        setEmail('lidy@contas.com.br');
        setPassword('lidy123');
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
            <Card className="w-full max-w-md bg-white shadow-2xl border border-slate-100">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-semibold text-slate-900">
                        Login
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                        Entre com suas credenciais para acessar o sistema
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* E-mail */}
                        <div className="space-y-2 text-left">
                            <Label htmlFor="email">E-mail</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    className="pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Senha */}
                        <div className="space-y-2 text-left">
                            <Label htmlFor="password">Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm font-medium text-center text-red-500">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Entrar
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-400">
                                Acesso rápido (dev)
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={fillCredentialsBetim}
                        >
                            Entrar como Betim
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={fillCredentialsLidy}
                        >
                            Entrar como Lidy
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

export default LoginPage;
