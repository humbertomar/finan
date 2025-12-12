import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { createRecurringExpense, updateRecurringExpense, type RecurringExpense } from '@/api/recurring';
import { getCategories, type Category } from '@/api/categories';
import { Loader2 } from 'lucide-react';

interface RecurringExpenseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    expenseToEdit?: RecurringExpense | null;
    onSuccess: () => void;
}

interface FormData {
    description: string;
    amount: string;
    dayOfMonth: string;
    categoryId: string;
    active: boolean;
}

export function RecurringExpenseDialog({ open, onOpenChange, expenseToEdit, onSuccess }: RecurringExpenseDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const { register, handleSubmit, reset, setValue, control } = useForm<FormData>();

    useEffect(() => {
        const loadCategories = async () => {
            try {
                // Filter for expense categories only? Or both? Recurring usually is expense.
                const data = await getCategories('EXPENSE');
                setCategories(data);
            } catch (error) {
                console.error('Failed to load categories');
            }
        };
        if (open) loadCategories();
    }, [open]);

    useEffect(() => {
        if (expenseToEdit) {
            setValue('description', expenseToEdit.description);
            setValue('amount', String(expenseToEdit.amount));
            setValue('dayOfMonth', String(expenseToEdit.dayOfMonth));
            setValue('categoryId', String(expenseToEdit.categoryId));
            setValue('active', expenseToEdit.active);
        } else {
            reset({
                description: '',
                amount: '',
                dayOfMonth: '1',
                categoryId: '',
                active: true
            });
        }
    }, [expenseToEdit, reset, setValue, open]);

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            const payload = {
                description: data.description,
                amount: parseFloat(data.amount.replace(',', '.')),
                dayOfMonth: parseInt(data.dayOfMonth),
                categoryId: Number(data.categoryId),
                active: data.active
            };

            if (expenseToEdit) {
                await updateRecurringExpense(expenseToEdit.id, payload);
            } else {
                await createRecurringExpense(payload);
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to save recurring expense', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle>{expenseToEdit ? 'Editar Despesa Fixa' : 'Nova Despesa Fixa'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Descrição</Label>
                        <Input id="description" className="col-span-3" {...register('description', { required: true })} />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">Valor</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            className="col-span-3"
                            {...register('amount', { required: true })}
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="day" className="text-right">Data Venc.</Label>
                        <Controller
                            control={control}
                            name="dayOfMonth"
                            rules={{ required: true }}
                            render={({ field }) => {
                                // Create a date string for the input (YYYY-MM-DD format)
                                const currentDay = field.value ? parseInt(field.value) : 1;
                                const today = new Date();
                                const year = today.getFullYear();
                                const month = String(today.getMonth() + 1).padStart(2, '0');
                                const day = String(currentDay).padStart(2, '0');
                                const dateString = `${year}-${month}-${day}`;

                                return (
                                    <div className="col-span-3 space-y-1">
                                        <Input
                                            id="day"
                                            type="date"
                                            value={dateString}
                                            onChange={(e) => {
                                                // Extract day directly from the date string (YYYY-MM-DD)
                                                const selectedDay = e.target.value.split('-')[2];
                                                field.onChange(String(parseInt(selectedDay)));
                                            }}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Vence todo dia {field.value || '1'} do mês
                                        </p>
                                    </div>
                                );
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Categoria</Label>
                        <Controller
                            control={control}
                            name="categoryId"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Ativo</Label>
                        <div className="col-span-3 flex items-center space-x-2">
                            <Controller
                                control={control}
                                name="active"
                                render={({ field }) => (
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                            <Label className="font-normal text-muted-foreground">Gerar automaticamente</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
