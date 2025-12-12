import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SwipeableItem } from '@/components/SwipeableItem';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { getRecurringExpenses, deleteRecurringExpense, type RecurringExpense } from '@/api/recurring';
import { Plus, Pencil, Trash2, CalendarClock } from 'lucide-react';
import { RecurringExpenseDialog } from './RecurringExpenseDialog';
import { formatCurrency } from '@/utils/currency';
import { Badge } from '@/components/ui/badge';

export function RecurringExpensesPage() {
    const [items, setItems] = useState<RecurringExpense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<RecurringExpense | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await getRecurringExpenses();
            setItems(data);
        } catch (error) {
            console.error('Failed to fetch recurring expenses', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = () => {
        setItemToEdit(null);
        setDialogOpen(true);
    };

    const handleEdit = (item: RecurringExpense) => {
        setItemToEdit(item);
        setDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Tem certeza que deseja excluir esta despesa recorrente? Isso parará a geração automática futura.')) {
            try {
                await deleteRecurringExpense(id);
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
                    <h2 className="text-3xl font-bold tracking-tight">Despesas Recorrentes</h2>
                    <p className="text-muted-foreground">Gerencie seus pagamentos fixos (Casa, Netflix, pepeto).</p>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Recorrente
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8 text-center">Carregando...</div>
                    ) : items.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">Nenhuma despesa fixa encontrada.</div>
                    ) : (
                        <>
                            {/* Mobile: Cards */}
                            <div className="md:hidden space-y-3 p-4">
                                {items.map(item => (
                                    <SwipeableItem
                                        key={item.id}
                                        onEdit={() => handleEdit(item)}
                                        onDelete={() => handleDelete(item.id)}
                                    >
                                        <Card className="border-l-4 border-l-purple-600">
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <CalendarClock className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-xs text-muted-foreground">Dia {item.dayOfMonth}</span>
                                                        </div>
                                                        <h3 className="font-semibold truncate">
                                                            {item.description}
                                                        </h3>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="font-bold whitespace-nowrap">
                                                            {formatCurrency(Number(item.amount))}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Badge variant={item.active ? 'default' : 'secondary'} className="text-xs">
                                                        {item.active ? 'Ativo' : 'Inativo'}
                                                    </Badge>
                                                    <span className="bg-muted px-2 py-1 rounded text-xs truncate max-w-[100px]">
                                                        {item.category?.name || 'Sem categoria'}
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
                                            <TableHead>Dia</TableHead>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead>Categoria</TableHead>
                                            <TableHead>Valor</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map(item => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                                                        Dia {item.dayOfMonth}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{item.description}</TableCell>
                                                <TableCell>{item.category?.name}</TableCell>
                                                <TableCell className="font-medium">
                                                    {formatCurrency(Number(item.amount))}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={item.active ? 'default' : 'secondary'}>
                                                        {item.active ? 'Ativo' : 'Inativo'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                                        <Pencil className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
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

            <RecurringExpenseDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                expenseToEdit={itemToEdit}
                onSuccess={fetchData}
            />
        </div>
    );
}
