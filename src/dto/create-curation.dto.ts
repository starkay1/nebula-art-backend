import { 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  IsArray, 
  IsBoolean, 
  MaxLength, 
  IsIn,
  ArrayMinSize 
} from 'class-validator';

export class CreateCurationDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description?: string;

  @IsNotEmpty({ message: 'At least one artwork is required' })
  @IsArray({ message: 'Artwork IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one artwork is required' })
  @IsString({ each: true, message: 'Each artwork ID must be a string' })
  artworkIds: string[];

  @IsOptional()
  @IsString({ message: 'Cover image URL must be a string' })
  @MaxLength(500, { message: 'Cover image URL must not exceed 500 characters' })
  coverImageUrl?: string;

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @MaxLength(50, { each: true, message: 'Each tag must not exceed 50 characters' })
  tags?: string[];

  @IsOptional()
  @IsString({ message: 'Theme must be a string' })
  @MaxLength(50, { message: 'Theme must not exceed 50 characters' })
  @IsIn(['contemporary', 'classical', 'modern', 'abstract', 'landscape', 'portrait', 'still-life', 'conceptual', 'mixed'], {
    message: 'Theme must be one of: contemporary, classical, modern, abstract, landscape, portrait, still-life, conceptual, mixed'
  })
  theme?: string;

  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  @MaxLength(50, { message: 'Category must not exceed 50 characters' })
  @IsIn(['exhibition', 'collection', 'showcase', 'competition', 'educational', 'seasonal', 'featured'], {
    message: 'Category must be one of: exhibition, collection, showcase, competition, educational, seasonal, featured'
  })
  category?: string;

  @IsOptional()
  @IsBoolean({ message: 'isPublic must be a boolean' })
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isFeatured must be a boolean' })
  isFeatured?: boolean;
}
