import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Expense } from '@/api/expenses';
import { markInstallmentAsPaid } from '@/api/expenses';
import { useState } from 'react';
import { formatCurrency } from '@/utils/currency';

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
            <DialogContent className="max-w-[95vw] md:max-w-4xl bg-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900">
                        Pagar Parcelas
                    </DialogTitle>
                    <DialogDescription className="text-sm md:text-base text-gray-600 mt-2">
                        <div className="space-y-1">
                            <div><span className="font-semibold">Despesa:</span> {expense.description}</div>
                            <div><span className="font-semibold">Valor total:</span> {formatCurrency(Number(expense.totalAmount))}</div>
                        </div>
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 md:mt-6">
                    {expense.installments && expense.installments.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                            {/* Desktop: Table */}
                            <div className="hidden md:block">
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
                                                    {formatCurrency(Number(installment.amount))}
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

                            {/* Mobile: Cards */}
                            <div className="md:hidden space-y-3 p-3">
                                {expense.installments.map((installment) => (
                                    <div key={installment.id} className="border rounded-lg p-3 space-y-2 bg-white">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-gray-900">
                                                Parcela {installment.number}
                                            </span>
                                            {installment.status === 'PAID' ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle className="mr-1 h-3 w-3" />
                                                    Pago
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    <Clock className="mr-1 h-3 w-3" />
                                                    Pendente
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Vencimento:</span>
                                            <span className="font-medium">{format(new Date(installment.date), 'MM/yyyy')}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Valor:</span>
                                            <span className="font-semibold text-gray-900">{formatCurrency(Number(installment.amount))}</span>
                                        </div>
                                        {installment.status === 'OPEN' && (
                                            <Button
                                                size="sm"
                                                className="w-full min-h-[44px] bg-green-600 hover:bg-green-700 text-white mt-2"
                                                onClick={() => handlePay(installment.id)}
                                                disabled={payingId === installment.id}
                                            >
                                                {payingId === installment.id ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Pagando...
                                                    </>
                                                ) : (
                                                    'Pagar Parcela'
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg text-sm md:text-base">
                            Esta despesa não possui parcelas.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
