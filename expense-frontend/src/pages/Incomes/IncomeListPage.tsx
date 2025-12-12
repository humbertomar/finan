import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SwipeableItem } from '@/components/SwipeableItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getIncomes, deleteIncome, type Income } from '@/api/incomes';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { IncomeDialog } from './IncomeDialog';
import { formatCurrency } from '@/utils/currency';

export function IncomeListPage() {
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Date filter
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(lastDay.toISOString().split('T')[0]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Does getIncomes support date range? 
            // The API I wrote supports month/year. 
            // I should ideally support date range in backend or just fetch everything and filter frontend for now (simpler for MVP).
            // Or I can just fetch by month/year loop like ExpensesListPage.
            // Let's implement month/year loop for consistency if backend doesn't support range.
            // Backend `IncomesService.findAll` supports month/year.

            const start = new Date(startDate);
            const end = new Date(endDate);
            const monthsToFetch: Array<{ month: string; year: string }> = [];

            const current = new Date(start.getFullYear(), start.getMonth(), 1);
            const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

            while (current <= endMonth) {
                monthsToFetch.push({
                    month: (current.getMonth() + 1).toString(),
                    year: current.getFullYear().toString()
                });
                current.setMonth(current.getMonth() + 1);
            }

            const promises = monthsToFetch.map(p => getIncomes(p));
            const results = await Promise.all(promises);
            const allIncomes = results.flat();

            // Filter exact dates
            const startDateTime = new Date(startDate);
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);

            const filtered = allIncomes.filter(inc => {
                const d = new Date(inc.date);
                return d >= startDateTime && d <= endDateTime;
            });

            setIncomes(filtered);
        } catch (error) {
            console.error('Failed to fetch incomes', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const handleAdd = () => {
        setIncomeToEdit(null);
        setDialogOpen(true);
    };

    const handleEdit = (income: Income) => {
        setIncomeToEdit(income);
        setDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Tem certeza que deseja excluir esta receita?')) {
            try {
                await deleteIncome(id);
                fetchData();
            } catch (error) {
                console.error('Failed to delete', error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Receitas</h2>
                    <p className="text-muted-foreground">Gerencie suas entradas financeiras.</p>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Receita
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="grid gap-2">
                            <Label>Data Inicial</Label>
                            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Data Final</Label>
                            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8 text-center">Carregando...</div>
                    ) : incomes.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">Nenhuma receita encontrada.</div>
                    ) : (
                        <>
                            {/* Mobile: Cards */}
                            <div className="md:hidden space-y-3 p-4">
                                {incomes.map(income => (
                                    <SwipeableItem
                                        key={income.id}
                                        onEdit={() => handleEdit(income)}
                                        onDelete={() => handleDelete(income.id)}
                                    >
                                        <Card className="border-l-4 border-l-green-600">
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold truncate">
                                                            {income.description}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {format(new Date(income.date), 'dd/MM/yyyy', { locale: ptBR })}
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="font-bold text-green-600 whitespace-nowrap">
                                                            {formatCurrency(Number(income.amount))}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center">
                                                    <span className="bg-muted px-2 py-1 rounded text-xs">
                                                        {income.category?.name || 'Sem categoria'}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </SwipeableItem>
                                ))}
                            </div>

                            {/* Desktop: Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead>Categoria</TableHead>
                                            <TableHead>Valor</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {incomes.map(income => (
                                            <TableRow key={income.id}>
                                                <TableCell>{format(new Date(income.date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                                                <TableCell>{income.description}</TableCell>
                                                <TableCell>{income.category?.name}</TableCell>
                                                <TableCell className="font-medium text-green-600">
                                                    {formatCurrency(Number(income.amount))}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(income)}>
                                                        <Pencil className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(income.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <IncomeDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                incomeToEdit={incomeToEdit}
                onSuccess={fetchData}
            />
        </div>
    );
}
