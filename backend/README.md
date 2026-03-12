# JobCallCenter.ma Backend API

API backend for the JobCallCenter.ma platform providing job search and recruitment services.

## Tech Stack

- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- AWS S3 for file storage
- RESTful API architecture

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB Atlas account or local MongoDB instance
- AWS S3 bucket for file storage

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://jbccdevuser:12345pak@jbccdev.mongodb.net/db
DB_NAME=jbccdev

# JWT Configuration
JWT_SECRET=jobcallcenter_secret_key
JWT_EXPIRES_IN=7d

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=eu-west-1
AWS_S3_BUCKET=jobcallcenter1
AWS_S3_BASE_URL=https://jobcallcenter1.s3.eu-west-1.amazonaws.com

# Email Configuration
EMAIL_FROM=noreply@jobcallcenter.ma
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgotpassword` - Request password reset
- `PUT /api/auth/resetpassword/:resettoken` - Reset password
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Users

- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get single user (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/stats` - Get user statistics (admin)

### Jobs

- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/featured` - Get featured jobs
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create new job (employer, admin)
- `PUT /api/jobs/:id` - Update job (employer, admin)
- `DELETE /api/jobs/:id` - Delete job (employer, admin)
- `GET /api/jobs/employer/me` - Get employer jobs (employer, admin)

### Companies

- `GET /api/companies` - Get all companies
- `GET /api/companies/:id` - Get single company
- `POST /api/companies` - Create new company (employer, admin)
- `PUT /api/companies/:id` - Update company (employer, admin)
- `DELETE /api/companies/:id` - Delete company (employer, admin)
- `GET /api/companies/owner/me` - Get company by owner (employer, admin)
- `GET /api/companies/:id/jobs` - Get company jobs

### Categories

- `GET /api/categories` - Get all categories
- `GET /api/categories/with-counts` - Get categories with job counts
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create new category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)
- `GET /api/categories/:id/jobs` - Get category jobs

### Applications

- `POST /api/applications` - Create new application (candidate)
- `GET /api/applications` - Get all applications (admin)
- `GET /api/applications/:id` - Get single application
- `PUT /api/applications/:id` - Update application (employer, admin)
- `DELETE /api/applications/:id` - Delete application
- `GET /api/applications/candidate` - Get candidate applications (candidate)
- `GET /api/applications/job/:jobId` - Get job applications (employer, admin)

### File Upload

- `POST /api/upload/resume` - Upload resume
- `POST /api/upload/profile-image` - Upload profile image
- `POST /api/upload/company-logo` - Upload company logo
- `POST /api/upload/job-image` - Upload job image
- `DELETE /api/upload/:key` - Delete file

### Newsletter

- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe` - Unsubscribe from newsletter
- `GET /api/newsletter/subscribers` - Get all subscribers (admin)

## License

This project is proprietary and confidential.
