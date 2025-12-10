import { api } from './api';
import type { Expense } from './expenses';

export interface DashboardSummary {
    currentMonthTotal: number;
    currentMonthInstallments: number;
    nextMonthInstallments: number;
    categoryDistribution: { name: string; value: number; color: string }[];
    recentExpenses: Expense[];
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
    const now = new Date();
    const currentMonth = (now.getMonth() + 1).toString();
    const currentYear = now.getFullYear().toString();

    // Fetch current month expenses
    const expensesResponse = await api.get<Expense[]>('/expenses', {
        params: { month: currentMonth, year: currentYear }
    });

    // Fetch current month installments
    const installmentsResponse = await api.get('/expenses/installments', {
        params: { month: currentMonth, year: currentYear }
    });

    // Fetch next month installments
    const nextMonth = now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2;
    const nextYear = now.getMonth() + 2 > 12 ? now.getFullYear() + 1 : now.getFullYear();
    const nextInstallmentsResponse = await api.get('/expenses/installments', {
        params: { month: nextMonth.toString(), year: nextYear.toString() }
    });

    const expenses = expensesResponse.data;
    const installments = installmentsResponse.data;
    const nextInstallments = nextInstallmentsResponse.data;

    // Calculate current month total from expenses
    const currentMonthTotal = expenses.reduce((sum, exp) => sum + Number(exp.totalAmount), 0);

    // Calculate installments totals
    const currentMonthInstallments = installments.reduce((sum: number, inst: any) => sum + Number(inst.amount), 0);
    const nextMonthInstallments = nextInstallments.reduce((sum: number, inst: any) => sum + Number(inst.amount), 0);

    // Calculate category distribution
    const categoryMap = new Map<string, number>();
    expenses.forEach(exp => {
        const categoryName = exp.category?.name || 'Sem categoria';
        const current = categoryMap.get(categoryName) || 0;
        categoryMap.set(categoryName, current + Number(exp.totalAmount));
    });

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const categoryDistribution = Array.from(categoryMap.entries()).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
    }));

    // Get recent expenses (last 5)
    const recentExpenses = expenses.slice(0, 5);

    return {
        currentMonthTotal,
        currentMonthInstallments,
        nextMonthInstallments,
        categoryDistribution,
        recentExpenses
    };
};
