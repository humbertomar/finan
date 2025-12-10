import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getFutureInstallments } from '@/api/expenses';
import type { InstallmentDetailed } from '@/api/expenses';
import { getCategories } from '@/api/categories';
import type { Category } from '@/api/categories';
import { Loader2, CalendarClock } from 'lucide-react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


export function NextMonthPage() {
    const [installments, setInstallments] = useState<InstallmentDetailed[]>([]);
    const [filteredInstallments, setFilteredInstallments] = useState<InstallmentDetailed[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [summary, setSummary] = useState({ total: 0, shared: 0 });

    // Filters
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedShared, setSelectedShared] = useState<string>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [data, categoriesData] = await Promise.all([
                    getFutureInstallments(),
                    getCategories()
                ]);
                setInstallments(data || []);
                setFilteredInstallments(data || []);
                setCategories(categoriesData);

                const total = data.reduce((acc, curr) => acc + Number(curr.amount), 0);
                const shared = data.filter(i => i.expense.isShared).reduce((acc, curr) => acc + Number(curr.amount), 0);
                setSummary({ total, shared });

            } catch (error) {
                console.error("Failed to fetch future installments", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = [...installments];

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(inst => inst.expense.category?.name === categories.find(c => c.id.toString() === selectedCategory)?.name);
        }

        // Filter by shared status
        if (selectedShared !== 'all') {
            const isShared = selectedShared === 'shared';
            filtered = filtered.filter(inst => inst.expense.isShared === isShared);
        }

        // Filter by date range
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            filtered = filtered.filter(inst => {
                const instDate = new Date(inst.date);
                return instDate >= start && instDate <= end;
            });
        }

        setFilteredInstallments(filtered);

        // Recalculate summary
        const total = filtered.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const shared = filtered.filter(i => i.expense.isShared).reduce((acc, curr) => acc + Number(curr.amount), 0);
        setSummary({ total, shared });
    }, [installments, selectedCategory, selectedShared, startDate, endDate]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Próximo Mês</h2>
                <p className="text-muted-foreground">Previsão de gastos e parcelas futuras.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Comprometido</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {Number(summary.total).toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Compartilhado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {Number(summary.shared).toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Data Inicial</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Data Final</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Categoria</Label>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Todas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas as Categorias</SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select value={selectedShared} onValueChange={setSelectedShared}>
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Todas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas</SelectItem>
                                    <SelectItem value="shared">Compartilhadas</SelectItem>
                                    <SelectItem value="personal">Pessoais</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarClock className="h-5 w-5" />
                        Parcelas Futuras
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vencimento</TableHead>
                                    <TableHead>Despesa</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead>Parcela</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInstallments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            Nenhuma parcela futura encontrada.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredInstallments.map((inst) => (
                                        <TableRow key={inst.id}>
                                            <TableCell>{format(new Date(inst.date), 'MM/yyyy')}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{inst.expense.description}</div>
                                                {inst.expense.isShared && <span className="text-xs text-blue-600">Compartilhado</span>}
                                            </TableCell>
                                            <TableCell>{inst.expense.category?.name || '-'}</TableCell>
                                            <TableCell>#{inst.number}</TableCell>
                                            <TableCell className="text-right font-medium">R$ {Number(inst.amount).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
