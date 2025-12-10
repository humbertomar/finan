import { useAuthStore } from '@/auth/store';

export function Header() {
    const { user } = useAuthStore();

    return (
        <header className="mb-8 flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Bem-vindo, {user?.name}</h1>
                <p className="text-muted-foreground">Visão geral das suas finanças.</p>
            </div>
        </header>
    );
}
