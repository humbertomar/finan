import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { inviteMember } from '@/api/groups';
import { Loader2 } from 'lucide-react';

interface InviteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groupId: number;
    onSuccess: () => void;
}

interface FormData {
    email: string;
}

export function InviteDialog({ open, onOpenChange, groupId, onSuccess }: InviteDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        setSuccessMessage('');
        try {
            await inviteMember(groupId, { inviteeEmail: data.email });
            setSuccessMessage('Convite enviado com sucesso!');
            setTimeout(() => {
                reset();
                setSuccessMessage('');
                onOpenChange(false);
                onSuccess();
            }, 1500);
        } catch (error: any) {
            console.error('Failed to send invite', error);
            alert(error.response?.data?.message || 'Erro ao enviar convite');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Convidar Membro</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@exemplo.com"
                                {...register('email', {
                                    required: 'Email é obrigatório',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Email inválido',
                                    },
                                })}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                            )}
                        </div>
                    </div>

                    {successMessage && (
                        <p className="text-sm text-green-600 text-center">{successMessage}</p>
                    )}

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enviar Convite
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
