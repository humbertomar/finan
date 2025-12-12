import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, List, LogOut, X, DollarSign, CalendarClock, Settings, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/auth/store';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { pathname } = useLocation();
    const { logout } = useAuthStore();

    const links = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/expenses', label: 'Despesas', icon: Wallet },
        { href: '/incomes', label: 'Receitas', icon: DollarSign },
        { href: '/categories', label: 'Categorias', icon: List },
        { href: '/recurring-expenses', label: 'Fixas', icon: CalendarClock },
        { href: '/groups', label: 'Grupos', icon: Users },
        { href: '/proximo-mes', label: 'Próximo Mês', icon: Wallet },
        { href: '/settings', label: 'Configurações', icon: Settings },
    ];

    const handleLinkClick = () => {
        // Fecha o menu em mobile ao clicar em um link
        if (window.innerWidth < 768) {
            onClose();
        }
    };

    return (
        <>
            {/* Overlay para mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-50 h-screen w-64 border-r bg-white shadow-lg transition-transform duration-300 ease-in-out",
                    // Mobile: drawer que desliza
                    "md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Header com botão de fechar (apenas mobile) */}
                <div className="flex h-16 items-center justify-between border-b px-6">
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Finanças
                    </span>
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                        aria-label="Fechar menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-4">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                        return (
                            <Link
                                key={link.href}
                                to={link.href}
                                onClick={handleLinkClick}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout button */}
                <div className="absolute bottom-4 left-4 right-4">
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Sair
                    </button>
                </div>
            </aside>
        </>
    );
}
