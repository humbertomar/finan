import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsInt, Min, Max } from 'class-validator';

export class CreateRecurringExpenseDto {
    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    amount: number;

    @IsNotEmpty()
    @IsInt()
    categoryId: number;

    @IsOptional()
    @IsString()
    frequency?: string; // Default: MONTHLY

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(31)
    dayOfMonth?: number; // Default: 1

    @IsOptional()
    @IsBoolean()
    active?: boolean; // Default: true
}
