import { api } from './api';
import type { Expense } from './expenses';

export interface DashboardSummary {
    totalIncome: number;
    totalSpent: number; // This replaces currentMonthInstallments/Total roughly
    balance: number;
    totalNextMonth: number;
    categoryDistribution: { name: string; value: number; color?: string }[]; // Backend returns this structure (no color yet, we can add color in frontend)
    recentExpenses: Expense[];
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
    const now = new Date();
    const currentMonth = (now.getMonth() + 1).toString();
    const currentYear = now.getFullYear().toString();

    return getDashboardSummaryByRange(currentMonth, currentYear, currentMonth, currentYear);
};

export const getDashboardSummaryByRange = async (
    startMonth: string,
    startYear: string,
    endMonth: string,
    endYear: string
): Promise<DashboardSummary> => {
    const response = await api.get('/reports/dashboard', {
        params: {
            month: endMonth,
            year: endYear,
            startMonth,
            startYear
        }
    });

    const data = response.data;

    // Add colors to pie chart here
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];
    const categoryDistribution = data.pieChart.map((item: any, index: number) => ({
        ...item,
        color: colors[index % colors.length]
    }));

    return {
        totalIncome: Number(data.totalIncome) || 0,
        totalSpent: Number(data.totalSpent) || 0,
        balance: Number(data.balance) || 0,
        totalNextMonth: Number(data.totalNextMonth) || 0,
        categoryDistribution,
        recentExpenses: data.recentExpenses || []
    };
};

export const getDashboardByDateRange = async (
    startDate: Date,
    endDate: Date
): Promise<DashboardSummary> => {
    const startMonth = (startDate.getMonth() + 1).toString();
    const startYear = startDate.getFullYear().toString();
    const endMonth = (endDate.getMonth() + 1).toString();
    const endYear = endDate.getFullYear().toString();

    return getDashboardSummaryByRange(startMonth, startYear, endMonth, endYear);
};
