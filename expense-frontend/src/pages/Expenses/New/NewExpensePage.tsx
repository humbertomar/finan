import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getCategories } from '@/api/categories';
import type { Category } from '@/api/categories';
import { createExpense } from '@/api/expenses';
import { Loader2 } from 'lucide-react';

export function NewExpensePage() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, control, watch } = useForm<{
        description: string;
        amount: number;
        date: string;
        location: string;
        categoryId: string;
        isShared: boolean;
        isInstallment: boolean;
        installments: number;
    }>({
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            isShared: false,
            isInstallment: false,
            installments: 1,
            categoryId: ''
        }
    });

    const isInstallment = watch('isInstallment');

    useEffect(() => {
        const loadCategories = async () => {
            const data = await getCategories();
            setCategories(data);
        }
        loadCategories();
    }, []);

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            await createExpense({
                description: data.description,
                totalAmount: Number(data.amount),
                date: new Date(data.date).toISOString(),
                location: data.location,
                categoryId: Number(data.categoryId),
                isShared: data.isShared,
                isInstallment: data.isInstallment,
                installmentCount: data.isInstallment ? Number(data.installments) : 1
            });
            navigate('/expenses');
        } catch (error: any) {
            console.error("Error creating expense", error);
            console.error("Error response:", error.response?.data);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Nova Despesa</CardTitle>
                    <CardDescription>Registre uma nova despesa ou compra parcelada.</CardDescription>
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

                        <div className="space-y-4 rounded-lg border p-4">
                            <div className="flex items-center space-x-2">
                                <Controller
                                    name="isInstallment"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox id="isInstallment" checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <Label htmlFor="isInstallment">É parcelado?</Label>
                            </div>

                            {isInstallment && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label htmlFor="installments">Número de Parcelas</Label>
                                    <Input type="number" min="2" id="installments" {...register('installments')} />
                                    <p className="text-sm text-muted-foreground">
                                        O sistema irá gerar as parcelas automaticamente para os próximos meses.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar Despesa
                            </Button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
