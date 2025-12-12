import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/auth/store';

export function MainLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useAuthStore();

    return (
        <div className="min-h-screen bg-background font-sans antialiased">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Header mobile com botão hambúrguer + user info */}
            <div className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 md:hidden shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        aria-label="Abrir menu"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="text-lg font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Finanças
                    </span>
                </div>

                {/* User Info */}
                <Link to="/settings" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                </Link>
            </div>

            {/* Header Desktop */}
            <div className="hidden md:block fixed top-0 left-64 right-0 z-30 h-16 border-b bg-card shadow-sm">
                <div className="h-full px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">

                        </span>
                    </div>

                    {/* User Info Desktop */}
                    <Link to="/settings" className="flex items-center gap-3 hover:bg-muted/50 rounded-lg px-3 py-2 transition-colors">
                        <div className="text-right">
                            <p className="text-sm font-medium">{user?.name}</p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                            <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                </div>
            </div>

            {/* Main content com padding responsivo */}
            <main className="md:pl-64 pt-16">
                <div className="container py-4 md:py-6 px-4">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
