import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Login/LoginPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { CategoriesPage } from './pages/Categories/CategoriesPage';
import { ExpensesListPage } from './pages/Expenses/List/ExpensesListPage';
import { NewExpensePage } from './pages/Expenses/New/NewExpensePage';
import { ExpenseDetailsPage } from './pages/Expenses/Details/ExpenseDetailsPage';
import { EditExpensePage } from './pages/Expenses/Edit/EditExpensePage';
import { NextMonthPage } from './pages/NextMonth/NextMonthPage';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/expenses" element={<ExpensesListPage />} />
          <Route path="/expenses/nova" element={<NewExpensePage />} />
          <Route path="/expenses/:id/edit" element={<EditExpensePage />} />
          <Route path="/expenses/:id" element={<ExpenseDetailsPage />} />
          <Route path="/proximo-mes" element={<NextMonthPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
