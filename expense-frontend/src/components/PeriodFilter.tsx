import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

export type PeriodPreset = 'current' | 'last3' | 'last6' | 'year' | 'custom';

export interface DateRange {
    startDate: Date;
    endDate: Date;
}

interface PeriodFilterProps {
    onPeriodChange: (preset: PeriodPreset, range: DateRange) => void;
    currentPreset: PeriodPreset;
}

export function PeriodFilter({ onPeriodChange, currentPreset }: PeriodFilterProps) {
    const [showCustom, setShowCustom] = useState(currentPreset === 'custom');

    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const presets = [
        { id: 'current' as const, label: 'Mês Atual' },
        { id: 'last3' as const, label: 'Últimos 3 Meses' },
        { id: 'last6' as const, label: 'Últimos 6 Meses' },
        { id: 'year' as const, label: 'Este Ano' },
        { id: 'custom' as const, label: 'Personalizado' },
    ];

    const getDateRange = (preset: PeriodPreset): DateRange => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        switch (preset) {
            case 'current':
                return {
                    startDate: new Date(year, month, 1),
                    endDate: new Date(year, month + 1, 0, 23, 59, 59, 999)
                };
            case 'last3':
                return {
                    startDate: new Date(year, month - 2, 1),
                    endDate: new Date(year, month + 1, 0, 23, 59, 59, 999)
                };
            case 'last6':
                return {
                    startDate: new Date(year, month - 5, 1),
                    endDate: new Date(year, month + 1, 0, 23, 59, 59, 999)
                };
            case 'year':
                return {
                    startDate: new Date(year, 0, 1),
                    endDate: new Date(year, 11, 31, 23, 59, 59, 999)
                };
            default:
                return {
                    startDate: currentMonth,
                    endDate: new Date(year, month + 1, 0, 23, 59, 59, 999)
                };
        }
    };

    const handlePresetClick = (preset: PeriodPreset) => {
        if (preset === 'custom') {
            setShowCustom(true);
        } else {
            setShowCustom(false);
            const range = getDateRange(preset);
            onPeriodChange(preset, range);
        }
    };

    const handleCustomDateChange = () => {
        const startInput = document.getElementById('start-date') as HTMLInputElement;
        const endInput = document.getElementById('end-date') as HTMLInputElement;

        if (startInput?.value && endInput?.value) {
            const startDate = new Date(startInput.value);
            const endDate = new Date(endInput.value);
            endDate.setHours(23, 59, 59, 999);

            onPeriodChange('custom', { startDate, endDate });
        }
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Período</h3>
                    </div>

                    {/* Preset Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {presets.map((preset) => (
                            <Button
                                key={preset.id}
                                variant={currentPreset === preset.id ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handlePresetClick(preset.id)}
                                className="flex-1 sm:flex-none"
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </div>

                    {/* Custom Date Inputs */}
                    {showCustom && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                            <div className="space-y-2">
                                <Label htmlFor="start-date">Data Inicial</Label>
                                <Input
                                    id="start-date"
                                    type="date"
                                    onChange={handleCustomDateChange}
                                    defaultValue={currentMonth.toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end-date">Data Final</Label>
                                <Input
                                    id="end-date"
                                    type="date"
                                    onChange={handleCustomDateChange}
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
