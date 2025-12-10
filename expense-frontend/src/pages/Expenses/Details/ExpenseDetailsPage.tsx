import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getExpenseById, markInstallmentAsPaid, deleteExpense } from '@/api/expenses';
import type { Expense } from '@/api/expenses';
import { Loader2, ArrowLeft, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ExpenseDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [expense, setExpense] = useState<Expense | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchExpense = async () => {
        if (!id) return;
        try {
            const data = await getExpenseById(id);
            setExpense(data);
        } catch (error) {
            console.error("Failed to fetch expense details", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchExpense();
    }, [id]);

    const handlePayInstallment = async (installmentId: string) => {
        try {
            await markInstallmentAsPaid(installmentId);
            fetchExpense(); // Refresh data
        } catch (error) {
            console.error("Failed to pay installment", error);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        if (!confirm('Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.')) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteExpense(id);
            navigate('/expenses');
        } catch (error) {
            console.error("Failed to delete expense", error);
            alert('Erro ao excluir despesa. Tente novamente.');
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (!expense) return <div>Despesa não encontrada</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 hover:pl-2 transition-all">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>
                <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    {isDeleting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Excluindo...
                        </>
                    ) : (
                        <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir Despesa
                        </>
                    )}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Detalhes da Despesa</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Descrição</h3>
                            <p className="text-lg font-semibold">{expense.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Valor Total</h3>
                                <p className="text-lg">R$ {Number(expense.totalAmount).toFixed(2)}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Data</h3>
                                <p className="text-lg">{format(new Date(expense.date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Categoria</h3>
                                <p>{expense.category?.name || '-'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Local</h3>
                                <p>{expense.location}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Tipo</h3>
                            <div className="flex gap-2 mt-1">
                                {expense.isShared && <Badge variant="secondary">Compartilhada</Badge>}
                                {expense.totalInstallments && expense.totalInstallments > 1 && <Badge variant="outline">Parcelada ({expense.totalInstallments}x)</Badge>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {expense.installments && expense.installments.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Parcelas</CardTitle>
                            <CardDescription>Acompanhe o pagamento das parcelas.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">#</TableHead>
                                        <TableHead>Vencimento</TableHead>
                                        <TableHead>Valor</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ação</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {expense.installments.map((installment) => (
                                        <TableRow key={installment.id}>
                                            <TableCell>{installment.number}</TableCell>
                                            <TableCell>{format(new Date(installment.date), 'MM/yyyy')}</TableCell>
                                            <TableCell>R$ {Number(installment.amount).toFixed(2)}</TableCell>
                                            <TableCell>
                                                {installment.status === 'PAID' ? (
                                                    <span className="flex items-center text-green-600 text-xs font-medium">
                                                        <CheckCircle className="mr-1 h-3 w-3" /> Pago
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-yellow-600 text-xs font-medium">
                                                        <Clock className="mr-1 h-3 w-3" /> Pendente
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {installment.status === 'OPEN' && (
                                                    <Button size="sm" variant="outline" onClick={() => handlePayInstallment(installment.id)}>
                                                        Pagar
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
