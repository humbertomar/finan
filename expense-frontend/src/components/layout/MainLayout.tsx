import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';

export function MainLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background font-sans antialiased">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Header mobile com botão hambúrguer */}
            <div className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center border-b bg-white px-4 md:hidden">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    aria-label="Abrir menu"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <span className="ml-4 text-lg font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Finanças
                </span>
            </div>

            {/* Main content com padding responsivo */}
            <main className="md:pl-64 pt-16 md:pt-0">
                <div className="container py-4 md:py-6 px-4">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
