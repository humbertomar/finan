import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createIncome, updateIncome, type Income } from '@/api/incomes';
import { getCategories, type Category } from '@/api/categories';
import { Loader2 } from 'lucide-react';


interface IncomeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    incomeToEdit?: Income | null;
    onSuccess: () => void;
}

interface FormData {
    description: string;
    amount: string; // handling as string for input
    date: string;
    categoryId: string;
}

export function IncomeDialog({ open, onOpenChange, incomeToEdit, onSuccess }: IncomeDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<FormData>();

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await getCategories('INCOME');
                setCategories(data);
            } catch (error) {
                console.error('Failed to load categories');
            }
        };
        if (open) loadCategories();
    }, [open]);

    useEffect(() => {
        if (incomeToEdit) {
            setValue('description', incomeToEdit.description);
            setValue('amount', String(incomeToEdit.amount));
            setValue('date', incomeToEdit.date.split('T')[0]);
            setValue('categoryId', String(incomeToEdit.categoryId));
        } else {
            reset({
                description: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                categoryId: ''
            });
        }
    }, [incomeToEdit, reset, setValue, open]);

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            const payload = {
                description: data.description,
                amount: parseFloat(data.amount.replace(',', '.')), // Basic handling
                date: new Date(data.date).toISOString(),
                categoryId: Number(data.categoryId)
            };

            if (incomeToEdit) {
                await updateIncome(incomeToEdit.id, payload);
            } else {
                await createIncome(payload);
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to save income', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle>{incomeToEdit ? 'Editar Receita' : 'Nova Receita'}</DialogTitle>
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
                        <Label htmlFor="date" className="text-right">Data</Label>
                        <Input id="date" type="date" className="col-span-3" {...register('date', { required: true })} />
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
