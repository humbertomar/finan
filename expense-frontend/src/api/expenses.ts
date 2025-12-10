import { api } from './api';

export interface Expense {
    id: string;
    description: string;
    totalAmount: number;
    date: string; // ISO Date
    location: string;
    categoryId: string;
    category?: { name: string };
    userId: string;
    isShared: boolean;
    installments?: Installment[];
    totalInstallments?: number;
}

export interface Installment {
    id: string;
    number: number;
    amount: number;
    date: string;
    status: 'OPEN' | 'PAID';
    paidByUserId?: string;
}

export interface CreateExpenseData {
    description: string;
    totalAmount: number;
    date: string;
    location: string;
    categoryId: number;
    isShared: boolean;
    isInstallment: boolean;
    installmentCount?: number; // If > 1, backend handles split
}

export const getExpenses = async (params?: { month?: string; year?: string; categoryId?: string }) => {
    const response = await api.get<Expense[]>('/expenses', { params });
    return response.data;
};

export const getExpenseById = async (id: string) => {
    const response = await api.get<Expense>(`/expenses/${id}`);
    return response.data;
};

export const createExpense = async (data: CreateExpenseData) => {
    const response = await api.post<Expense>('/expenses', data);
    return response.data;
};

export const deleteExpense = async (id: string) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
};

export const markInstallmentAsPaid = async (installmentId: string) => {
    const response = await api.patch(`/expenses/installments/${installmentId}/pay`);
    return response.data;
}

export const getFutureInstallments = async () => {
    const response = await api.get<InstallmentDetailed[]>('/expenses/future');
    return response.data;
}

export interface InstallmentDetailed extends Installment {
    expense: {
        description: string;
        category?: { name: string };
        isShared: boolean;
    }
}
