import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store';

export const ProtectedRoute = () => {
    const { isAuthenticated, token } = useAuthStore();

    if (!isAuthenticated || !token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
