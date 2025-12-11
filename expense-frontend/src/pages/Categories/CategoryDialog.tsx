import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    const { register, handleSubmit, reset, setValue } = useForm<{ name: string }>();

    useEffect(() => {
        if (categoryToEdit) {
            setValue('name', categoryToEdit.name);
        } else {
            reset({ name: '' });
        }
    }, [categoryToEdit, reset, setValue, open]);

    const onSubmit = async (data: { name: string }) => {
        setIsLoading(true);
        try {
            if (categoryToEdit) {
                await updateCategory(categoryToEdit.id, data.name);
            } else {
                await createCategory(data.name);
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
