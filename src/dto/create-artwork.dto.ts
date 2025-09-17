import { 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  IsArray, 
  IsNumber, 
  IsBoolean, 
  MaxLength, 
  Min, 
  IsIn 
} from 'class-validator';

export class CreateArtworkDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description?: string;

  @IsNotEmpty({ message: 'Image data is required' })
  @IsString({ message: 'Image data must be a string' })
  imageData: string; // Base64 encoded image or file path

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @MaxLength(50, { each: true, message: 'Each tag must not exceed 50 characters' })
  tags?: string[];

  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  @MaxLength(50, { message: 'Category must not exceed 50 characters' })
  @IsIn(['painting', 'sculpture', 'photography', 'digital', 'mixed-media', 'drawing', 'printmaking', 'installation', 'other'], {
    message: 'Category must be one of: painting, sculpture, photography, digital, mixed-media, drawing, printmaking, installation, other'
  })
  category?: string;

  @IsOptional()
  @IsString({ message: 'Medium must be a string' })
  @MaxLength(100, { message: 'Medium must not exceed 100 characters' })
  medium?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Width must be a number' })
  @Min(1, { message: 'Width must be at least 1' })
  width?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Height must be a number' })
  @Min(1, { message: 'Height must be at least 1' })
  height?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a number with at most 2 decimal places' })
  @Min(0, { message: 'Price must be non-negative' })
  price?: number;

  @IsOptional()
  @IsString({ message: 'Currency must be a string' })
  @IsIn(['CNY', 'USD', 'EUR', 'GBP', 'JPY'], {
    message: 'Currency must be one of: CNY, USD, EUR, GBP, JPY'
  })
  currency?: string;

  @IsOptional()
  @IsBoolean({ message: 'isForSale must be a boolean' })
  isForSale?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isPublic must be a boolean' })
  isPublic?: boolean;

  // These fields are set by the service after image processing
  imageUrl?: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
}
