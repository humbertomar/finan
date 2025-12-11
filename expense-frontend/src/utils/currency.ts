/**
 * Formata um valor numérico para o padrão monetário brasileiro (BRL)
 * @param value - Valor numérico a ser formatado
 * @returns String formatada no padrão R$ 1.234,56
 */
export function formatCurrency(value: number | string): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
        return 'R$ 0,00';
    }

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(numValue);
}

/**
 * Remove a formatação de moeda e retorna apenas o número
 * @param formatted - String formatada como moeda
 * @returns Número sem formatação
 */
export function parseCurrency(formatted: string): number {
    const cleaned = formatted.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
}
