import { PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

// (#12)
export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsNotEmpty({ message: 'First name is required' })
  @IsString()
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  firstName: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @IsString()
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  lastName: string;
}

// (#17)
export class LoginDto {
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

// (#33)
export class CreateMountainDto {
  @IsString()
  @IsNotEmpty({ message: 'Mountain name is required' })
  @MaxLength(100)
  name: string;

  @IsNumber()
  @Min(0)
  height: number;

  @IsString()
  @IsNotEmpty({ message: 'Location is required' })
  @MaxLength(200)
  location: string;

  @IsInt()
  @Min(1)
  @Max(5)
  difficultyLevel: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;
}

// (#33)
export class UpdateMountainDto extends PartialType(CreateMountainDto) {}

// (#42)
export class CreateTrailDto {
  @IsString()
  @IsNotEmpty({ message: 'Trail name is required' })
  @MaxLength(100)
  name: string;

  @IsNumber()
  @Min(0.1)
  length: number;

  @IsInt()
  @Min(1)
  estimatedTime: number;

  @IsInt()
  @Min(1)
  @Max(5)
  difficultyLevel: number;

  @IsBoolean()
  isCircular: boolean;
}

// (#42)
export class UpdateTrailDto extends PartialType(CreateTrailDto) {}

// (#49)
export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty({ message: 'Review comment is required' })
  comment: string;
}
