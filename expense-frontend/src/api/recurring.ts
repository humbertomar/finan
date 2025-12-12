import { api } from './api';
import type { Category } from './categories';

export interface RecurringExpense {
    id: number;
    description: string;
    amount: number;
    active: boolean;
    frequency: string;
    dayOfMonth: number;
    lastGenerated?: string;
    categoryId: number;
    category?: Category;
}

export const getRecurringExpenses = async (): Promise<RecurringExpense[]> => {
    const response = await api.get('/recurring-expenses');
    return response.data;
};

export const createRecurringExpense = async (data: Partial<RecurringExpense>): Promise<RecurringExpense> => {
    const response = await api.post('/recurring-expenses', data);
    return response.data;
};

export const updateRecurringExpense = async (id: number, data: Partial<RecurringExpense>): Promise<RecurringExpense> => {
    const response = await api.patch(`/recurring-expenses/${id}`, data);
    return response.data;
};

export const deleteRecurringExpense = async (id: number): Promise<void> => {
    await api.delete(`/recurring-expenses/${id}`);
};
