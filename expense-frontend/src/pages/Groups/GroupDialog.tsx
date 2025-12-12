import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createGroup, updateGroup, type Group } from '@/api/groups';
import { Loader2 } from 'lucide-react';

interface GroupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groupToEdit?: Group | null;
    onSuccess: () => void;
}

interface FormData {
    name: string;
}

export function GroupDialog({ open, onOpenChange, groupToEdit, onSuccess }: GroupDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>();

    useEffect(() => {
        if (groupToEdit) {
            setValue('name', groupToEdit.name);
        } else {
            reset({ name: '' });
        }
    }, [groupToEdit, reset, setValue, open]);

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            if (groupToEdit) {
                await updateGroup(groupToEdit.id, data);
            } else {
                await createGroup(data);
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to save group', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{groupToEdit ? 'Editar Grupo' : 'Novo Grupo'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Nome
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="name"
                                placeholder="Ex: Casa, Viagem Rio..."
                                {...register('name', { required: 'Nome é obrigatório' })}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                            )}
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
