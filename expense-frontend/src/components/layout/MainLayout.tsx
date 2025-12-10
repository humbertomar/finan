import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function MainLayout() {
    return (
        <div className="min-h-screen bg-background font-sans antialiased">
            <Sidebar />
            <main className="pl-64">
                <div className="container py-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
