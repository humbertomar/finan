import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Login/LoginPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { CategoriesPage } from './pages/Categories/CategoriesPage';
import { ExpensesListPage } from './pages/Expenses/List/ExpensesListPage';
import { NewExpensePage } from './pages/Expenses/New/NewExpensePage';
import { ExpenseDetailsPage } from './pages/Expenses/Details/ExpenseDetailsPage';
import { EditExpensePage } from './pages/Expenses/Edit/EditExpensePage';
import { NextMonthPage } from './pages/NextMonth/NextMonthPage';
import { IncomeListPage } from './pages/Incomes/IncomeListPage';
import { RecurringExpensesPage } from './pages/Recurring/RecurringExpensesPage';
import { GroupsListPage } from './pages/Groups/GroupsListPage';
import { GroupDetailsPage } from './pages/Groups/GroupDetailsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { ThemeProvider } from "@/components/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/incomes" element={<IncomeListPage />} />
            <Route path="/expenses" element={<ExpensesListPage />} />
            <Route path="/expenses/nova" element={<NewExpensePage />} />
            <Route path="/expenses/:id/edit" element={<EditExpensePage />} />
            <Route path="/expenses/:id" element={<ExpenseDetailsPage />} />
            <Route path="/proximo-mes" element={<NextMonthPage />} />
            <Route path="/recurring-expenses" element={<RecurringExpensesPage />} />
            <Route path="/groups" element={<GroupsListPage />} />
            <Route path="/groups/:id" element={<GroupDetailsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
