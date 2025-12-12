import { api } from './api';

export interface Category {
    id: string;
    name: string;
    userId: string;
    type: 'EXPENSE' | 'INCOME';
}

export const getCategories = async (type?: 'EXPENSE' | 'INCOME') => {
    const params = type ? { type } : {};
    const response = await api.get<Category[]>('/categories', { params });
    return response.data;
};

export const createCategory = async (name: string, type: 'EXPENSE' | 'INCOME' = 'EXPENSE') => {
    const response = await api.post<Category>('/categories', { name, type });
    return response.data;
};

export const updateCategory = async (id: string, name: string) => {
    const response = await api.put<Category>(`/categories/${id}`, { name });
    return response.data;
};

export const deleteCategory = async (id: string) => {
    await api.delete(`/categories/${id}`);
};
