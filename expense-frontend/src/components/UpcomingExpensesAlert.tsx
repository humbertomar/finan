import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, X } from 'lucide-react';
import { getRecurringExpenses, type RecurringExpense } from '@/api/recurring';
import { formatCurrency } from '@/utils/currency';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface UpcomingExpense {
    expense: RecurringExpense;
    daysUntilDue: number;
    urgency: 'today' | 'tomorrow' | 'soon';
}

export function UpcomingExpensesAlert() {
    const [upcomingExpenses, setUpcomingExpenses] = useState<UpcomingExpense[]>([]);
    const [dismissed, setDismissed] = useState<string[]>([]);

    useEffect(() => {
        fetchUpcomingExpenses();
    }, []);

    const fetchUpcomingExpenses = async () => {
        try {
            const allExpenses = await getRecurringExpenses();
            const activeExpenses = allExpenses.filter(e => e.active);

            const today = new Date();
            const currentDay = today.getDate();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();

            const upcoming: UpcomingExpense[] = [];

            for (const expense of activeExpenses) {
                const dueDay = expense.dayOfMonth;
                let daysUntilDue: number;

                if (dueDay >= currentDay) {
                    // Due this month
                    daysUntilDue = dueDay - currentDay;
                } else {
                    // Due next month
                    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                    daysUntilDue = (lastDayOfMonth - currentDay) + dueDay;
                }

                // Only show if due in next 5 days
                if (daysUntilDue <= 5) {
                    let urgency: 'today' | 'tomorrow' | 'soon';
                    if (daysUntilDue === 0) urgency = 'today';
                    else if (daysUntilDue === 1) urgency = 'tomorrow';
                    else urgency = 'soon';

                    upcoming.push({ expense, daysUntilDue, urgency });
                }
            }

            // Sort by days until due (most urgent first)
            upcoming.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
            setUpcomingExpenses(upcoming);
        } catch (error) {
            console.error('Failed to fetch upcoming expenses:', error);
        }
    };

    const getUrgencyColor = (urgency: 'today' | 'tomorrow' | 'soon') => {
        switch (urgency) {
            case 'today':
                return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
            case 'tomorrow':
                return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
            default:
                return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
        }
    };

    const getDaysText = (daysUntilDue: number) => {
        if (daysUntilDue === 0) return 'hoje';
        if (daysUntilDue === 1) return 'amanhã';
        return `em ${daysUntilDue} dias`;
    };

    const handleDismiss = (expenseId: number) => {
        setDismissed([...dismissed, expenseId.toString()]);
    };

    const visibleExpenses = upcomingExpenses
        .filter(item => !dismissed.includes(item.expense.id.toString()))
        .slice(0, 5);

    if (visibleExpenses.length === 0) return null;

    return (
        <div className="space-y-3">
            {visibleExpenses.map(({ expense, daysUntilDue, urgency }) => (
                <Alert
                    key={expense.id}
                    className={`${getUrgencyColor(urgency)} relative`}
                >
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="flex items-center justify-between pr-8">
                        <span>Despesa Fixa Vencendo</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => handleDismiss(expense.id)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </AlertTitle>
                    <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
                        <div className="flex-1">
                            <p className="font-semibold">{expense.description}</p>
                            <p className="text-sm opacity-90">
                                Vence <strong>{getDaysText(daysUntilDue)}</strong> (dia {expense.dayOfMonth})
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-bold">
                                {formatCurrency(Number(expense.amount))}
                            </Badge>
                        </div>
                    </AlertDescription>
                </Alert>
            ))}

            {upcomingExpenses.length > 5 && (
                <Link to="/recurring-expenses">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        Ver todas as despesas fixas
                    </Button>
                </Link>
            )}
        </div>
    );
}
