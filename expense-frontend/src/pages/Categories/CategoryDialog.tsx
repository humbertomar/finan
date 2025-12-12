import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createCategory, updateCategory } from '@/api/categories';
import type { Category } from '@/api/categories';
import { Loader2 } from 'lucide-react';

interface CategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categoryToEdit?: Category | null;
    onSuccess: () => void;
}

export function CategoryDialog({ open, onOpenChange, categoryToEdit, onSuccess }: CategoryDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, reset, setValue, control } = useForm<{ name: string; type: 'EXPENSE' | 'INCOME' }>();

    useEffect(() => {
        if (categoryToEdit) {
            setValue('name', categoryToEdit.name);
            setValue('type', categoryToEdit.type || 'EXPENSE'); // Handle potential missing type in old data
        } else {
            reset({ name: '', type: 'EXPENSE' });
        }
    }, [categoryToEdit, reset, setValue, open]);

    const onSubmit = async (data: { name: string; type: 'EXPENSE' | 'INCOME' }) => {
        setIsLoading(true);
        try {
            if (categoryToEdit) {
                // Update doesn't strictly support type change in API yet? 
                // Let's check api/categories.ts. updateCategory only takes name.
                // Currently only creating supports type.
                await updateCategory(categoryToEdit.id, data.name);
            } else {
                await createCategory(data.name, data.type);
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to save category', error);
            // Ideally show toast error here
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle>{categoryToEdit ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Nome
                        </Label>
                        <Input id="name" className="col-span-3" {...register('name', { required: true })} />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Tipo
                        </Label>
                        <Controller
                            control={control}
                            name="type"
                            defaultValue="EXPENSE"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EXPENSE">Despesa</SelectItem>
                                        <SelectItem value="INCOME">Receita</SelectItem>
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
