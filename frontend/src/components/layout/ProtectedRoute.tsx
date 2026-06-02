import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingScreen from '@/components/shared/LoadingScreen';

function ProtectedRoute() {
    const { user, isLoading } = useAuth();

    if (isLoading) return <LoadingScreen />;

    if (!user) return <Navigate to="/login" replace />;

    return <Outlet />;
}

export default ProtectedRoute;