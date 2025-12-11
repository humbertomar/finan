import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getExpenses, getExpenseById, deleteExpense } from '@/api/expenses';
import type { Expense } from '@/api/expenses';
import { getCategories } from '@/api/categories';
import type { Category } from '@/api/categories';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Eye, Pencil, Trash2, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/auth/store';
import { PayInstallmentsModal } from '@/components/PayInstallmentsModal';
import { formatCurrency } from '@/utils/currency';

export function ExpensesListPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Date range filter - default to current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [startDate, setStartDate] = useState<string>(
        firstDayOfMonth.toISOString().split('T')[0]
    );
    const [endDate, setEndDate] = useState<string>(lastDayOfMonth.toISOString().split('T')[0]);

    const { user } = useAuthStore(); // agora de fato usado
    const [payModalOpen, setPayModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Calculate all months in the range
            const monthsToFetch: Array<{ month: string; year: string }> = [];
            const current = new Date(start.getFullYear(), start.getMonth(), 1);
            const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

            while (current <= endMonth) {
                monthsToFetch.push({
                    month: (current.getMonth() + 1).toString(),
                    year: current.getFullYear().toString(),
                });
                current.setMonth(current.getMonth() + 1);
            }

            // Fetch expenses from all months in range
            const allExpensesPromises = monthsToFetch.map(({ month, year }) =>
                getExpenses({
                    month,
                    year,
                    categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
                })
            );

            const [allExpensesArrays, categoriesData] = await Promise.all([
                Promise.all(allExpensesPromises),
                getCategories(),
            ]);

            // Flatten all expenses from different months
            const allExpenses = allExpensesArrays.flat();

            // Filter by exact date range
            const startDateTime = new Date(startDate);
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);

            const filteredExpenses = allExpenses.filter((expense) => {
                const expenseDate = new Date(expense.date);
                return expenseDate >= startDateTime && expenseDate <= endDateTime;
            });

            setExpenses(filteredExpenses);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate, selectedCategory]);

    const handleDelete = async (id: string, description: string) => {
        if (
            !confirm(
                `Tem certeza que deseja excluir a despesa "${description}"? Esta ação não pode ser desfeita.`
            )
        ) {
            return;
        }

        try {
            await deleteExpense(id);
            fetchData(); // Refresh list
        } catch (error) {
            console.error('Failed to delete expense', error);
            alert('Erro ao excluir despesa. Tente novamente.');
        }
    };

    const handlePayClick = async (expense: Expense) => {
        // Fetch full expense details with installments
        const fullExpense = await getExpenseById(expense.id);
        setSelectedExpense(fullExpense);
        setPayModalOpen(true);
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                        Despesas {user?.name ? `de ${user.name}` : ''}
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Gerencie seus gastos e acompanhe o orçamentos.
                    </p>
                </div>
                <Link to="/expenses/nova" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto min-h-[44px]">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Despesa
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                    <CardDescription>Filtre suas despesas por período e categoria</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="grid gap-2 flex-1">
                            <Label>Data Inicial</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2 flex-1">
                            <Label>Data Final</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2 flex-1 w-full sm:max-w-xs">
                            <Label>Categoria</Label>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas as Categorias</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const now = new Date();
                                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                                const lastDay = new Date(
                                    now.getFullYear(),
                                    now.getMonth() + 1,
                                    0
                                );
                                setStartDate(firstDay.toISOString().split('T')[0]);
                                setEndDate(lastDay.toISOString().split('T')[0]);
                            }}
                        >
                            Este Mês
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const now = new Date();
                                const firstDay = new Date(
                                    now.getFullYear(),
                                    now.getMonth() - 1,
                                    1
                                );
                                const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
                                setStartDate(firstDay.toISOString().split('T')[0]);
                                setEndDate(lastDay.toISOString().split('T')[0]);
                            }}
                        >
                            Mês Passado
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const now = new Date();
                                const threeMonthsAgo = new Date(
                                    now.getFullYear(),
                                    now.getMonth() - 2,
                                    1
                                );
                                const lastDay = new Date(
                                    now.getFullYear(),
                                    now.getMonth() + 1,
                                    0
                                );
                                setStartDate(threeMonthsAgo.toISOString().split('T')[0]);
                                setEndDate(lastDay.toISOString().split('T')[0]);
                            }}
                        >
                            Últimos 3 Meses
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const now = new Date();
                                const firstDay = new Date(now.getFullYear(), 0, 1);
                                const lastDay = new Date(now.getFullYear(), 11, 31);
                                setStartDate(firstDay.toISOString().split('T')[0]);
                                setEndDate(lastDay.toISOString().split('T')[0]);
                            }}
                        >
                            Este Ano
                        </Button>
                    </div>
                </CardContent>
                <CardContent>
                    {isLoading ? (
                        <div className="py-8 text-center text-muted-foreground">Carregando...</div>
                    ) : expenses.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            Nenhuma despesa encontrada para este período.
                        </div>
                    ) : (
                        <>
                            {/* Mobile: Cards */}
                            <div className="md:hidden space-y-3">
                                {expenses.map((expense) => (
                                    <Card key={expense.id} className="border-l-4 border-l-primary">
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold truncate">
                                                        {expense.description}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {format(new Date(expense.date), 'dd/MM/yyyy', {
                                                            locale: ptBR,
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="font-bold text-red-600 whitespace-nowrap">
                                                        {formatCurrency(Number(expense.totalAmount))}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 text-xs">
                                                <span className="bg-muted px-2 py-1 rounded">
                                                    {expense.category?.name || 'Sem categoria'}
                                                </span>
                                                <span className="bg-muted px-2 py-1 rounded">
                                                    {expense.location}
                                                </span>
                                                {expense.isShared && (
                                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                        Partilhado
                                                    </span>
                                                )}
                                                {expense.totalInstallments && expense.totalInstallments > 1 && (
                                                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                                        Parcelado
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <Link to={`/expenses/${expense.id}`} className="flex-1">
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Ver
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePayClick(expense)}
                                                >
                                                    <DollarSign className="h-4 w-4 text-green-600" />
                                                </Button>
                                                <Link to={`/expenses/${expense.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(expense.id, expense.description)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
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
                                            <TableHead>Local</TableHead>
                                            <TableHead>Valor</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {expenses.map((expense) => (
                                            <TableRow key={expense.id}>
                                                <TableCell>
                                                    {format(new Date(expense.date), 'dd/MM/yyyy', {
                                                        locale: ptBR,
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {expense.description}
                                                        {expense.isShared && (
                                                            <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                                                                Partilhado
                                                            </span>
                                                        )}
                                                        {expense.totalInstallments &&
                                                            expense.totalInstallments > 1 && (
                                                                <span className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
                                                                    Parcelado
                                                                </span>
                                                            )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {expense.category?.name || '-'}
                                                </TableCell>
                                                <TableCell>{expense.location}</TableCell>
                                                <TableCell className="font-medium text-red-600">
                                                    {formatCurrency(Number(expense.totalAmount))}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link to={`/expenses/${expense.id}`}>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Visualizar"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Pagar parcelas"
                                                            onClick={() => handlePayClick(expense)}
                                                        >
                                                            <DollarSign className="h-4 w-4 text-green-600" />
                                                        </Button>
                                                        <Link to={`/expenses/${expense.id}/edit`}>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Editar"
                                                            >
                                                                <Pencil className="h-4 w-4 text-blue-600" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Excluir"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    expense.id,
                                                                    expense.description
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
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

            <PayInstallmentsModal
                expense={selectedExpense}
                open={payModalOpen}
                onOpenChange={setPayModalOpen}
                onSuccess={() => {
                    fetchData();
                    setPayModalOpen(false);
                }}
            />
        </div>
    );
}
