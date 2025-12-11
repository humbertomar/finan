import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Wallet, TrendingUp, Eye } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getDashboardSummary, type DashboardSummary } from '@/api/dashboard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/utils/currency';

export function DashboardPage() {
    const [data, setData] = useState<DashboardSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const summary = await getDashboardSummary();
                setData(summary);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                Carregando dashboard...
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Cards superiores */}
            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Despesas deste Mês</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold">
                            {formatCurrency(data.currentMonthTotal)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total de despesas cadastradas
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Parcelas deste Mês</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold">
                            {formatCurrency(data.currentMonthInstallments)}
                        </div>
                        <p className="text-xs text-muted-foreground">A pagar neste mês</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Próximo Mês</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold">
                            {formatCurrency(data.nextMonthInstallments)}
                        </div>
                        <p className="text-xs text-muted-foreground">Parcelas comprometidas</p>
                    </CardContent>
                </Card>
            </div>

            {/* Gráfico + lista de recentes */}
            <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base md:text-lg">Distribuição por Categoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.categoryDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                                <PieChart>
                                    <Pie
                                        data={data.categoryDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => {
                                            const p = percent ?? 0;
                                            return `${name}: ${(p * 100).toFixed(0)}%`;
                                        }}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {data.categoryDistribution.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) =>
                                            formatCurrency(value)
                                        }
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-[250px] md:h-[300px] items-center justify-center text-muted-foreground text-sm">
                                Nenhuma despesa cadastrada neste mês
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base md:text-lg">Despesas Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 md:space-y-4 max-h-[250px] md:max-h-[300px] overflow-y-auto">
                            {data.recentExpenses.length > 0 ? (
                                data.recentExpenses.map((expense) => (
                                    <div
                                        key={expense.id}
                                        className="flex items-center justify-between gap-2"
                                    >
                                        <div className="space-y-1 min-w-0 flex-1">
                                            <p className="text-sm font-medium leading-none truncate">
                                                {expense.description}
                                            </p>
                                            <p className="text-xs md:text-sm text-muted-foreground">
                                                {format(
                                                    new Date(expense.date),
                                                    "dd 'de' MMMM",
                                                    { locale: ptBR }
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-sm font-medium text-red-600 whitespace-nowrap">
                                                {formatCurrency(Number(expense.totalAmount))}
                                            </span>
                                            <Link to={`/expenses/${expense.id}`}>
                                                <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex h-[200px] items-center justify-center text-muted-foreground text-sm">
                                    Nenhuma despesa recente
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default DashboardPage;
