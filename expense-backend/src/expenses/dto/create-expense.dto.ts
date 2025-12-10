import { IsString, IsNumber, IsBoolean, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
    @Type(() => Date)
    @IsDate()
    date: Date;

    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsNumber()
    totalAmount: number;

    @IsBoolean()
    isInstallment: boolean;

    @IsOptional()
    @IsNumber()
    installmentCount?: number;

    @IsNumber()
    categoryId: number;

    @IsBoolean()
    isShared: boolean;
}
