import { api } from './api';

export interface Income {
    id: number;
    description: string;
    amount: number;
    date: string; // ISO Date
    categoryId: number;
    category?: { name: string; id: number };
    userId: number;
}

export interface CreateIncomeData {
    description: string;
    amount: number;
    date: string;
    categoryId: number;
}

export const getIncomes = async (params?: { month?: string; year?: string }) => {
    const response = await api.get<Income[]>('/incomes', { params });
    return response.data;
};

export const createIncome = async (data: CreateIncomeData) => {
    const response = await api.post<Income>('/incomes', data);
    return response.data;
};

export const updateIncome = async (id: number, data: Partial<CreateIncomeData>) => {
    const response = await api.patch<Income>(`/incomes/${id}`, data);
    return response.data;
};

export const deleteIncome = async (id: number) => {
    const response = await api.delete(`/incomes/${id}`);
    return response.data;
};
