import { api } from './api';

export interface Category {
    id: string;
    name: string;
    userId: string;
}

export const getCategories = async () => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
};

export const createCategory = async (name: string) => {
    const response = await api.post<Category>('/categories', { name });
    return response.data;
};

export const updateCategory = async (id: string, name: string) => {
    const response = await api.put<Category>(`/categories/${id}`, { name });
    return response.data;
};

export const deleteCategory = async (id: string) => {
    await api.delete(`/categories/${id}`);
};
