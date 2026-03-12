# JobCallCenter.ma API Documentation

## Table of Contents
- [Base URL](#base-url)
- [Authentication](#authentication)
- [User Management](#user-management)
- [Job Listings](#job-listings)
- [Companies](#companies)
- [Applications](#applications)
- [Categories](#categories)
- [File Uploads](#file-uploads)
- [Newsletter](#newsletter)
- [Statistics](#statistics)
- [Error Handling](#error-handling)

## Base URL
```
http://localhost:5000/api
```

## Overview

This API documentation covers all endpoints available in the JobCallCenter.ma platform. The API provides a comprehensive set of features for job seekers, employers, and administrators.

### Features

#### For Job Seekers
- User registration and profile management
- Job search and filtering
- Application submission and tracking
- Resume and profile management
- Job alerts and notifications

#### For Employers
- Company profile management
- Job posting and management
- Candidate search and filtering
- Application management
- Interview scheduling

#### Platform Features
- Multi-language support (French, Arabic)
- Responsive design for all devices
- Real-time notifications
- Advanced search and filtering
- Secure file uploads
- Newsletter subscription
- Analytics and reporting

### Rate Limiting
- Standard: 100 requests per minute
- Authentication: 10 login attempts per 15 minutes
- File Uploads: 5MB max file size

### Response Format
All API responses follow a consistent JSON format:
```json
{
  "success": boolean,
  "message": "Descriptive message",
  "data": {},
  "pagination": {}
}
```

### Authentication
Most endpoints require authentication using a JWT token in the Authorization header:
```
Authorization: Bearer your_jwt_token
```

### Error Handling
All error responses include:
- HTTP status code
- Error message
- Error code (when applicable)
- Additional details (when available)

Example error response:
```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Human-readable error message"
}
```

### Versioning
The API is versioned in the URL. The current version is `v1`.

### Support
For support, please contact support@jobcallcenter.ma

## Authentication

### Register User
```
POST /auth/register
```
Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+212600000000",
  "role": "candidat", // Optional: "candidat" or "employer" (default: "candidat")
  "acceptTerms": true // Must be true to register
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "candidat",
    "isVerified": false,
    "createdAt": "2025-06-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid email format
- `409 Conflict`: Email already registered
- `422 Unprocessable Entity`: Validation errors

### Login User
```
POST /auth/login
```
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "candidat",
    "profileImage": "https://example.com/profile.jpg"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: Account not verified or disabled

### Get Current User
```
GET /auth/me
```
Get the currently authenticated user's profile.

**Headers:**
```
Authorization: Bearer JWT_TOKEN
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "candidat",
    "profileImage": "https://example.com/profile.jpg",
    "phone": "+212600000000",
    "isVerified": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "address": {
      "street": "123 Main St",
      "city": "Casablanca",
      "postalCode": "20000",
      "country": "Morocco"
    },
    "preferences": {
      "notifications": true,
      "language": "fr",
      "jobAlerts": true
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User not found

### Forgot Password
```
POST /auth/forgot-password
```
Request a password reset email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### Reset Password
```
POST /auth/reset-password
```
Reset password using a token from email.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "new_secure_password"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

### Update Password
```
PUT /auth/update-password
```
Update the current user's password.

**Headers:**
```
Authorization: Bearer JWT_TOKEN
```

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_secure_password"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

## Jobs

### Get All Jobs
```
GET /jobs
```
**Query Parameters:**
- `search`: Search term for job title, description, or location
- `category`: Filter by category ID
- `location.city`: Filter by city
- `jobType`: Filter by job type (CDI, CDD, Freelance, Stage, Temps partiel)
- `experience`: Filter by experience level
- `education`: Filter by education level
- `sort`: Sort field(s), e.g. `-createdAt` for newest first
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "pagination": {
    "next": { "page": 2, "limit": 10 },
    "prev": null
  },
  "total": 50,
  "data": [
    {
      "_id": "job_id",
      "title": "Job Title",
      "company": {
        "_id": "company_id",
        "name": "Company Name",
        "logo": "logo_url",
        "location": {
          "city": "City",
          "country": "Country"
        }
      },
      "location": {
        "city": "City",
        "address": "Address",
        "country": "Country"
      },
      "jobType": "CDI",
      "category": {
        "_id": "category_id",
        "name": "Category Name"
      },
      "salary": {
        "min": 30000,
        "max": 50000,
        "currency": "MAD",
        "isDisplayed": true
      },
      "experience": "3-5 ans",
      "education": "Bac+5/Master",
      "createdAt": "date",
      "updatedAt": "date"
    }
  ]
}
```

### Get Job by ID
```
GET /jobs/:id
```
**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "job_id",
    "title": "Job Title",
    "company": {
      "_id": "company_id",
      "name": "Company Name",
      "logo": "logo_url",
      "location": {
        "city": "City",
        "country": "Country"
      },
      "description": "Company description",
      "website": "company_website",
      "industry": "industry",
      "size": "11-50"
    },
    "location": {
      "city": "City",
      "address": "Address",
      "country": "Country"
    },
    "jobType": "CDI",
    "category": {
      "_id": "category_id",
      "name": "Category Name"
    },
    "salary": {
      "min": 30000,
      "max": 50000,
      "currency": "MAD",
      "isDisplayed": true
    },
    "description": "Job description",
    "requirements": "Job requirements",
    "responsibilities": "Job responsibilities",
    "benefits": "Job benefits",
    "skills": ["Skill 1", "Skill 2"],
    "experience": "3-5 ans",
    "education": "Bac+5/Master",
    "applicationDeadline": "deadline_date",
    "isActive": true,
    "isFeatured": false,
    "views": 100,
    "applicationsCount": 10,
    "postedBy": "user_id",
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

### Create Job
```
POST /jobs
```
**Headers:**
```
Authorization: Bearer JWT_TOKEN
```
**Request Body:**
```json
{
  "title": "Job Title",
  "company": "company_id",
  "location": {
    "city": "City",
    "address": "Address",
    "country": "Country"
  },
  "jobType": "CDI",
  "category": "category_id",
  "salary": {
    "min": 30000,
    "max": 50000,
    "currency": "MAD",
    "isDisplayed": true
  },
  "description": "Job description",
  "requirements": "Job requirements",
  "responsibilities": "Job responsibilities",
  "benefits": "Job benefits",
  "skills": ["Skill 1", "Skill 2"],
  "experience": "3-5 ans",
  "education": "Bac+5/Master",
  "applicationDeadline": "deadline_date",
  "isActive": true,
  "isFeatured": false
}
```

## Companies
**Query Parameters:**
- `search`: Search term for job title, description, or location
- `category`: Filter by category ID
- `location.city`: Filter by city
- `jobType`: Filter by job type (CDI, CDD, Freelance, Stage, Temps partiel)
- `experience`: Filter by experience level
- `education`: Filter by education level
- `sort`: Sort field(s), e.g. `-createdAt` for newest first
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10, max: 100)
- `fields`: Comma-separated list of fields to return

      "updatedAt": "date"
    }
  ]
}
```

### Get Top Companies
```
GET /companies/top
```
**Query Parameters:**
- `limit`: Number of top companies to return (default: 4)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "company_id",
      "name": "Company Name",
      "logo": "logo_url",
      "industry": "Industry",
      "location": {
        "city": "City",
        "country": "Country"
      },
      "jobCount": 15
    }
  ]
}
```

### Get Company Stats
```
GET /companies/stats
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "company_id",
      "name": "Company Name",
      "logo": "logo_url",
      "jobCount": 15
    }
  ]
}
```

### Get Company by ID
```
GET /companies/:id
```

### Create Company
```
POST /companies
```
**Headers:**
```
Authorization: Bearer JWT_TOKEN
```
**Request Body:**
```json
{
  "name": "Company Name",
  "logo": "logo_url",
  "website": "company_website",
  "industry": "Industry",
  "size": "11-50",
  "description": "Company description",
  "location": {
    "address": "Address",
    "city": "City",
    "country": "Country"
  },
  "contactEmail": "contact@company.com",
  "contactPhone": "phone_number",
  "socialMedia": {
    "linkedin": "linkedin_url",
    "facebook": "facebook_url",
    "twitter": "twitter_url",
    "instagram": "instagram_url"
  }
}
```

## Categories

### Get All Categories
```
GET /categories
```

### Get Categories with Job Counts
```
GET /categories/with-counts
```

## Applications

### Create Application
```
POST /applications
```
**Headers:**
```
Authorization: Bearer JWT_TOKEN
```
**Request Body:**
```json
{
  "job": "job_id",
  "resume": "resume_url",
  "coverLetter": "cover_letter"
}
```

### Get Candidate Applications
```
GET /applications/candidate
```
**Headers:**
```
Authorization: Bearer JWT_TOKEN
```

### Get Job Applications
```
GET /applications/job/:jobId
```
**Headers:**
```
Authorization: Bearer JWT_TOKEN
```

## File Upload

### Upload Resume
```
POST /upload/resume
```
**Headers:**
```
Authorization: Bearer JWT_TOKEN
Content-Type: multipart/form-data
```
**Form Data:**
```
resume: [FILE]
```

### Upload Profile Image
```
POST /upload/profile-image
```
**Headers:**
```
Authorization: Bearer JWT_TOKEN
Content-Type: multipart/form-data
```
**Form Data:**
```
profileImage: [FILE]
```

### Upload Company Logo
```
POST /upload/company-logo
```
**Headers:**
```
Authorization: Bearer JWT_TOKEN
Content-Type: multipart/form-data
```
**Form Data:**
```
companyLogo: [FILE]
```

## Newsletter

### Subscribe to Newsletter
```
POST /newsletter/subscribe
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "source": "website",  // Optional: Source of subscription (default: "website")
  "status": "active"    // Optional: Subscription status (default: "active")
}
```
**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Subscription successful",
  "data": {
    "_id": "subscription_id",
    "email": "user@example.com",
    "subscriptionDate": "2025-06-01T07:42:15.000Z",
    "status": "active",
    "source": "website"
  }
}
```
**Error Responses:**

1. **Duplicate Email (409 Conflict)**
```json
{
  "success": false,
  "error": "Email already subscribed",
  "message": "This email is already subscribed to our newsletter"
}
```

2. **Invalid Email (400 Bad Request)**
```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Please provide a valid email address"
}
```

3. **Server Error (500 Internal Server Error)**
```json
{
  "success": false,
  "error": "ServerError",
  "message": "Unable to process subscription at this time"
}
```

### Check if Email is Subscribed
```
GET /newsletter/check?email=user@example.com
```
**Query Parameters:**
- `email` (required): The email address to check

**Success Response (200 OK):**

If subscribed:
```json
{
  "success": true,
  "isSubscribed": true,
  "data": {
    "_id": "subscription_id",
    "email": "user@example.com",
    "subscriptionDate": "2025-06-01T07:42:15.000Z",
    "status": "active"
  }
}
```

If not subscribed:
```json
{
  "success": true,
  "isSubscribed": false
}
```

**Error Responses:**

1. **Missing Email (400 Bad Request)**
```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Email parameter is required"
}
```

2. **Invalid Email (400 Bad Request)**
```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Please provide a valid email address"
}
```

3. **Server Error (500 Internal Server Error)**
```json
{
  "success": false,
  "error": "ServerError",
  "message": "Unable to check subscription status"
}
```

### Get All Subscribers
```
GET /newsletter/subscribers
```
**Headers:**
```
Authorization: Bearer JWT_TOKEN
```
**Query Parameters:**
- `status`: Filter by subscription status (active, inactive)
- `source`: Filter by subscription source
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "pagination": {
    "next": { "page": 2, "limit": 10 },
    "prev": null
  },
  "total": 50,
  "data": [
    {
      "_id": "subscription_id",
      "email": "user@example.com",
      "subscriptionDate": "2025-06-01T07:42:15.000Z",
      "status": "active",
      "source": "website"
    }
  ]
}
```

### Unsubscribe from Newsletter
```
POST /newsletter/unsubscribe
```
**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully unsubscribed"
}
```

**Error Responses:**

1. **Email Not Found (404 Not Found)**
```json
{
  "success": false,
  "error": "NotFound",
  "message": "No subscription found with this email"
}
```

2. **Invalid Email (400 Bad Request)**
```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Please provide a valid email address"
}
```

3. **Server Error (500 Internal Server Error)**
```json
{
  "success": false,
  "error": "ServerError",
  "message": "Unable to process unsubscribe request"
}
```

**Note:** This endpoint also works with a GET request for email client compatibility:
```
GET /newsletter/unsubscribe?email=user@example.com
```

## Statistics

### Get Platform Statistics
```
GET /stats
```
**Response:**
```json
{
  "success": true,
  "data": {
    "totalJobs": 1250,
    "totalCompanies": 350,
    "totalCandidates": 5000,
    "totalApplications": 8500,
    "activeJobs": 800,
    "jobsByCategory": [
      { "category": "IT & Development", "count": 300 },
      { "category": "Customer Service", "count": 250 }
    ],
    "jobsByLocation": [
      { "city": "Casablanca", "count": 500 },
      { "city": "Rabat", "count": 300 }
    ]
  }
}
```
**Form Data:**
```
companyLogo: [FILE]
```

## Newsletter

### Subscribe to Newsletter
```
POST /newsletter/subscribe
```
**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### Unsubscribe from Newsletter
```
POST /newsletter/unsubscribe
```
**Request Body:**
```json
{
  "email": "user@example.com"
}
```

## Candidate Dashboard

### Get Dashboard Statistics
```
GET /candidat/dashboard/stats
```
**Headers:**
```
Authorization: Bearer JWT_TOKEN
```
**Response:**
```json
{
  "success": true,
  "data": {
    "viewedJobs": 4,
    "applications": 1,
    "savedJobs": 0,
    "scheduledInterviews": 0
  }
}
```

### Get Upcoming Interviews
```
GET /candidat/interviews/upcoming
```
**Headers:**
```
Authorization: Bearer JWT_TOKEN
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "interview_id",
      "jobId": "job_id",
      "jobTitle": "Superviseur Centre d'Appels",
      "companyId": "company_id",
      "companyName": "CallMaster Solutions",
      "interviewDate": "2025-05-30T10:00:00Z",
      "interviewType": "Via Microsoft Teams",
      "interviewLink": "https://teams.microsoft.com/meeting/link",
      "status": "scheduled",
      "notes": "Prepare to discuss your experience with team management"
    }
  ]
}
```

### Get Recommended Jobs
```
GET /candidat/jobs/recommended
```
**Headers:**
```
Authorization: Bearer JWT_TOKEN
```
**Query Parameters:**
- `limit`: Maximum number of results (default: 5)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "job_id",
      "title": "Agent de service client",
      "companyId": "company_id",
      "companyName": "Teleperformance",
      "location": "Casablanca",
      "salary": "5000-7000 MAD",
      "matchScore": 85,
      "postedAt": "2025-05-20T14:30:00Z"
    }
  ]
}
```

### Get Profile Completion
```
GET /candidat/profile/completion
```
**Headers:**
```
Authorization: Bearer JWT_TOKEN
```
**Response:**
```json
{
  "success": true,
  "data": {
    "percentage": 80,
    "completed": [
      "basic_info",
      "experience",
      "education",
      "skills",
      "cv"
    ],
    "missing": [
      "languages",
      "certifications"
    ]
  }
}
```

## Employer Dashboard

### Get Dashboard Statistics
```
GET /employeur/dashboard/stats
```
**Headers:**
```
Authorization: Bearer JWT_TOKEN
```
**Response:**
```json
{
  "success": true,
  "data": {
    "activeJobs": 0,
    "draftJobs": 0,
    "applications": 0,
    "interviews": 0
  }
}
```

### Get Recent Applications
```
GET /employeur/applications/recent
```
**Headers:**
```
Authorization: Bearer JWT_TOKEN
```
**Query Parameters:**
- `limit`: Maximum number of results (default: 5)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "application_id",
      "jobId": "job_id",
      "jobTitle": "Agent de service client",
      "candidatId": "candidat_id",
      "candidatName": "John Doe",
      "appliedAt": "2025-05-20T14:30:00Z",
      "status": "new",
      "resumeUrl": "https://jobcallcenter1.s3.eu-west-1.amazonaws.com/resumes/resume_id.pdf"
    }
  ]
}
```

### Get Upcoming Interviews
```
GET /employeur/interviews/upcoming
```
**Headers:**
```
Authorization: Bearer JWT_TOKEN
```
**Query Parameters:**
- `limit`: Maximum number of results (default: 5)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "interview_id",
      "jobId": "job_id",
      "jobTitle": "Agent de service client",
      "candidatId": "candidat_id",
      "candidatName": "John Doe",
      "interviewDate": "2025-05-30T10:00:00Z",
      "interviewType": "Via Microsoft Teams",
      "interviewLink": "https://teams.microsoft.com/meeting/link",
      "status": "scheduled",
      "notes": "Discuss previous experience in customer service"
    }
  ]
}
```

### Get Company Profile
```
GET /employeur/company
```
**Headers:**
```
Authorization: Bearer JWT_TOKEN
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "company_id",
    "name": "Company Name",
    "logo": "https://jobcallcenter1.s3.eu-west-1.amazonaws.com/logos/logo_id.png",
    "industry": "Call Center",
    "size": "50-200",
    "website": "https://company-website.com",
    "description": "Company description",
    "address": {
      "street": "123 Main Street",
      "city": "Casablanca",
      "postalCode": "20000",
      "country": "Morocco"
    },
    "contactEmail": "contact@company.com",
    "contactPhone": "+212600000000",
    "socialMedia": {
      "linkedin": "https://linkedin.com/company/company-name",
      "facebook": "https://facebook.com/company-name",
      "twitter": "https://twitter.com/company-name"
    },
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

### Update Company Profile
```
PUT /employeur/company
```
**Headers:**
```
Authorization: Bearer JWT_TOKEN
```
**Request Body:**
```json
{
  "name": "Updated Company Name",
  "industry": "Call Center",
  "size": "50-200",
  "website": "https://company-website.com",
  "description": "Updated company description",
  "address": {
    "street": "123 Main Street",
    "city": "Casablanca",
    "postalCode": "20000",
    "country": "Morocco"
  },
  "contactEmail": "contact@company.com",
  "contactPhone": "+212600000000",
  "socialMedia": {
    "linkedin": "https://linkedin.com/company/company-name",
    "facebook": "https://facebook.com/company-name",
    "twitter": "https://twitter.com/company-name"
  }
}
```

### Get All Jobs by Employer
```
GET /employeur/jobs
```
**Headers:**
```
Authorization: Bearer JWT_TOKEN
```
**Query Parameters:**
- `status`: Filter by status (active, draft, closed, all) (default: all)
- `sort`: Sort field(s), e.g. `-createdAt` for newest first
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "job_id",
      "title": "Agent de service client",
      "status": "active",
      "location": "Casablanca",
      "jobType": "full-time",
      "salary": "5000-7000 MAD",
      "applicationsCount": 5,
      "createdAt": "2025-05-20T14:30:00Z",
      "expiresAt": "2025-06-20T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```
