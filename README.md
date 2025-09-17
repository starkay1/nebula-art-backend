# Nebula Art Backend

A production-ready Node.js + TypeScript backend service for the Nebula Art platform, built with Express.js and TypeORM.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Image Processing**: Automatic image optimization with multiple size variants using Sharp.js
- **Database**: PostgreSQL with TypeORM for robust data management
- **API Documentation**: RESTful API with comprehensive error handling
- **Security**: Rate limiting, CORS, helmet security headers
- **Logging**: Structured logging with Winston
- **Validation**: Request validation using class-validator
- **File Upload**: Secure image upload with processing pipeline

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT (jsonwebtoken)
- **Image Processing**: Sharp.js
- **Validation**: class-validator
- **Logging**: Winston
- **Security**: Helmet, CORS, bcrypt

## Quick Start

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 13 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nebula-art-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up PostgreSQL database:
```bash
createdb nebula_art
```

5. Run database migrations:
```bash
npm run migration:run
```

6. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=nebula_art

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - Logout user

### Users
- `GET /users/me` - Get current user profile (authenticated)
- `PUT /users/me` - Update current user profile (authenticated)
- `GET /users/artists` - Get list of artists
- `GET /users/:userId` - Get user by ID
- `POST /users/follow/:userId` - Follow a user (authenticated)
- `DELETE /users/follow/:userId` - Unfollow a user (authenticated)

### Artworks
- `POST /artworks` - Create artwork (authenticated, artists only)
- `GET /artworks` - Get artworks with pagination and filtering
- `GET /artworks/:id` - Get artwork by ID
- `PUT /artworks/:id` - Update artwork (authenticated, owner only)
- `DELETE /artworks/:id` - Delete artwork (authenticated, owner only)
- `POST /artworks/:id/like` - Toggle like on artwork (authenticated)
- `GET /artworks/featured` - Get featured artworks
- `GET /artworks/search` - Search artworks

### Curations
- `POST /curations` - Create curation (authenticated)
- `GET /curations` - Get curations with pagination and filtering
- `GET /curations/:id` - Get curation by ID
- `PUT /curations/:id` - Update curation (authenticated, owner only)
- `DELETE /curations/:id` - Delete curation (authenticated, owner only)
- `POST /curations/:id/artworks` - Add artwork to curation (authenticated, owner only)
- `DELETE /curations/:id/artworks/:artworkId` - Remove artwork from curation (authenticated, owner only)
- `GET /curations/featured` - Get featured curations

## Database Schema

### Users
- User profiles with artist capabilities
- Follow relationships
- Authentication credentials

### Artworks
- Image metadata and URLs
- Artist relationships
- Like and view statistics
- Tags and categorization

### Curations
- Collections of artworks
- Curator relationships
- Ordering and metadata

### Comments
- Nested comment system
- Like functionality
- Moderation support

## Image Processing

The system automatically processes uploaded images into three variants:

1. **Thumbnail**: 200x200px (square crop)
2. **Medium**: 800x600px (maintain aspect ratio)
3. **Original**: Optimized original size

All images are compressed to JPEG format with quality optimization.

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run migration:generate` - Generate new migration
- `npm run migration:run` - Run pending migrations

### Project Structure

```
src/
├── main.ts                  # Application entry point
├── config/                  # Configuration files
├── controllers/             # HTTP route controllers
├── services/                # Business logic layer
├── repositories/            # Data access layer
├── entities/                # TypeORM entities
├── dto/                     # Data transfer objects
├── guards/                  # Authentication guards
├── middleware/              # Custom middleware
├── utils/                   # Utility functions
└── shared/                  # Shared constants and types
```

## Security Features

- JWT authentication with configurable expiration
- Password hashing with bcrypt
- Rate limiting per endpoint
- CORS configuration
- Security headers with Helmet
- Input validation and sanitization
- SQL injection prevention with TypeORM

## Logging

Structured logging with Winston:
- Request/response logging
- Error tracking
- Performance monitoring
- Security event logging

## Error Handling

Comprehensive error handling with:
- Validation error responses
- Authentication/authorization errors
- Database constraint violations
- File upload errors
- Rate limiting responses

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secret
4. Configure file storage (local or cloud)
5. Set up reverse proxy (nginx)
6. Configure SSL/TLS
7. Set up monitoring and logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
