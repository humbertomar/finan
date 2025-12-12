import { IsDateString, IsNotEmpty, IsNumber, IsPositive, IsString, IsInt } from 'class-validator';

export class CreateIncomeDto {
    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    amount: number;

    @IsNotEmpty()
    @IsDateString()
    date: string;

    @IsNotEmpty()
    @IsInt()
    categoryId: number;
}
