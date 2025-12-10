import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Expense } from '@/api/expenses';
import { markInstallmentAsPaid } from '@/api/expenses';
import { useState } from 'react';

interface PayInstallmentsModalProps {
    expense: Expense | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function PayInstallmentsModal({ expense, open, onOpenChange, onSuccess }: PayInstallmentsModalProps) {
    const [payingId, setPayingId] = useState<string | null>(null);

    const handlePay = async (installmentId: string) => {
        setPayingId(installmentId);
        try {
            await markInstallmentAsPaid(installmentId);
            onSuccess();
        } catch (error) {
            console.error("Failed to pay installment", error);
            alert('Erro ao pagar parcela. Tente novamente.');
        } finally {
            setPayingId(null);
        }
    };

    if (!expense) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl bg-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                        Pagar Parcelas
                    </DialogTitle>
                    <DialogDescription className="text-base text-gray-600 mt-2">
                        <div className="space-y-1">
                            <div><span className="font-semibold">Despesa:</span> {expense.description}</div>
                            <div><span className="font-semibold">Valor total:</span> R$ {Number(expense.totalAmount).toFixed(2)}</div>
                        </div>
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6">
                    {expense.installments && expense.installments.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="w-[80px] font-semibold text-gray-900">#</TableHead>
                                        <TableHead className="font-semibold text-gray-900">Vencimento</TableHead>
                                        <TableHead className="font-semibold text-gray-900">Valor</TableHead>
                                        <TableHead className="font-semibold text-gray-900">Status</TableHead>
                                        <TableHead className="text-right font-semibold text-gray-900">Ação</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {expense.installments.map((installment) => (
                                        <TableRow key={installment.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium text-gray-900">
                                                {installment.number}
                                            </TableCell>
                                            <TableCell className="text-gray-700">
                                                {format(new Date(installment.date), 'MM/yyyy')}
                                            </TableCell>
                                            <TableCell className="font-semibold text-gray-900">
                                                R$ {Number(installment.amount).toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                {installment.status === 'PAID' ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                        <CheckCircle className="mr-1.5 h-4 w-4" />
                                                        Pago
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                                        <Clock className="mr-1.5 h-4 w-4" />
                                                        Pendente
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {installment.status === 'OPEN' && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={() => handlePay(installment.id)}
                                                        disabled={payingId === installment.id}
                                                    >
                                                        {payingId === installment.id ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Pagando...
                                                            </>
                                                        ) : (
                                                            'Pagar'
                                                        )}
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                            Esta despesa não possui parcelas.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
