import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getCategories } from '@/api/categories';
import type { Category } from '@/api/categories';
import { getExpenseById } from '@/api/expenses';
import { api } from '@/api/api';
import { Loader2, ArrowLeft } from 'lucide-react';

export function EditExpensePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const { register, handleSubmit, control, setValue } = useForm<{
        description: string;
        amount: number;
        date: string;
        location: string;
        categoryId: string;
        isShared: boolean;
    }>();

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;

            try {
                const [expense, categoriesData] = await Promise.all([
                    getExpenseById(id),
                    getCategories()
                ]);

                setCategories(categoriesData);

                // Pre-fill form with expense data
                setValue('description', expense.description);
                setValue('amount', Number(expense.totalAmount));
                setValue('date', new Date(expense.date).toISOString().split('T')[0]);
                setValue('location', expense.location);
                setValue('categoryId', expense.categoryId.toString());
                setValue('isShared', expense.isShared);
            } catch (error) {
                console.error("Failed to load expense", error);
                alert('Erro ao carregar despesa');
                navigate('/expenses');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [id, setValue, navigate]);

    const onSubmit = async (data: any) => {
        if (!id) return;

        setIsSaving(true);
        try {
            await api.patch(`/expenses/${id}`, {
                description: data.description,
                totalAmount: Number(data.amount),
                date: new Date(data.date).toISOString(),
                location: data.location,
                categoryId: Number(data.categoryId),
                isShared: data.isShared
            });
            navigate(`/expenses/${id}`);
        } catch (error) {
            console.error("Error updating expense", error);
            alert('Erro ao atualizar despesa. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mb-4 pl-0 hover:pl-2 transition-all"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Editar Despesa</CardTitle>
                    <CardDescription>Atualize as informações da despesa.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Data</Label>
                                <Input type="date" id="date" {...register('date', { required: true })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="amount">Valor Total</Label>
                                <Input type="number" step="0.01" id="amount" placeholder="0,00" {...register('amount', { required: true })} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Input id="description" placeholder="Ex: Compras do mês" {...register('description', { required: true })} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Local</Label>
                            <Input id="location" placeholder="Ex: Supermercado X" {...register('location', { required: true })} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Categoria</Label>
                            <Controller
                                name="categoryId"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                        <SelectTrigger className="bg-background">
                                            <SelectValue placeholder="Selecione uma categoria" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Controller
                                name="isShared"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox id="isShared" checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <Label htmlFor="isShared">Despesa Compartilhada</Label>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar Alterações
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
