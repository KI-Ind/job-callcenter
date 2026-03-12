# JobCallCenter.ma API Documentation

## Table of Contents
- [Introduction](#introduction)
- [Authentication](#authentication)
- [Candidate APIs](#candidate-apis)
  - [Profile Management](#candidate-profile-management)
  - [Job Search & Applications](#job-search--applications)
- [Employer APIs](#employer-apis)
  - [Company Profile](#company-profile)
  - [Job Posting Management](#job-posting-management)
  - [Candidate Management](#candidate-management)
- [Portal/Admin APIs](#portaladmin-apis)
  - [User Management](#user-management)
  - [Content Management](#content-management)
  - [Analytics](#analytics)
- [Common APIs](#common-apis)
  - [Categories](#categories)
  - [File Uploads](#file-uploads)
  - [Newsletter](#newsletter)
- [Error Handling](#error-handling)

## Introduction

Welcome to the JobCallCenter.ma API documentation. This API provides a robust set of endpoints for managing job postings, applications, companies, and user accounts for both job seekers and employers.

### Base URL
```
https://api.jobcallcenter.ma/v1
```

### Authentication
Most endpoints require authentication using a JWT token in the Authorization header:
```
Authorization: Bearer your_jwt_token
```

### Response Format
All API responses follow this JSON structure:
```json
{
  "success": boolean,
  "message": "Descriptive message",
  "data": {},
  "pagination": {}
}
```

### Error Handling
Errors follow this format:
```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Human-readable error message"
}
```

### Rate Limiting
- Standard: 100 requests per minute
- Authentication: 10 login attempts per 15 minutes
- File Uploads: 5MB max file size

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
  "password": "securePassword123",
  "phone": "+212600000000",
  "role": "candidate", // or "employer"
  "acceptTerms": true
}
```

**Success Response (201):**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "candidate",
    "isVerified": false
  }
}
```

### Login
```
POST /auth/login
```
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "candidate" // Optional: "candidate" or "employer"
}
```

## Candidate APIs

### Profile Management

#### Get Candidate Profile
```
GET /candidates/me
```

**Headers:**
```
Authorization: Bearer JWT_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "candidate_id",
    "user": "user_id",
    "title": "Software Developer",
    "bio": "Experienced developer...",
    "skills": ["JavaScript", "React", "Node.js"],
    "experience": [
      {
        "title": "Senior Developer",
        "company": "Tech Corp",
        "startDate": "2020-01-01",
        "endDate": null,
        "current": true,
        "description": "Led development team..."
      }
    ],
    "education": [
      {
        "degree": "Master's in Computer Science",
        "institution": "University of Casablanca",
        "startYear": 2015,
        "endYear": 2017
      }
    ],
    "resume": "url_to_resume",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Job Search & Applications

#### Search Jobs
```
GET /jobs/search
```

**Query Parameters:**
- `keywords`: Search in title/description
- `location`: City or region
- `jobType`: CDI, CDD, Freelance, etc.
- `experienceLevel`: Entry, Mid, Senior
- `salaryMin`: Minimum salary
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

#### Apply for Job
```
POST /candidates/applications
```

**Headers:**
```
Authorization: Bearer JWT_TOKEN
Content-Type: multipart/form-data
```

**Form Data:**
- `jobId`: ID of the job to apply for
- `resume`: Resume file
- `coverLetter`: (Optional) Cover letter text or file

## Employer APIs

### Company Profile

#### Get Company Profile
```
GET /employers/company
```

**Headers:**
```
Authorization: Bearer JWT_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "company_id",
    "name": "Tech Solutions",
    "description": "Leading technology solutions provider...",
    "logo": "https://storage.example.com/logos/company_logo.jpg",
    "website": "https://techsolutions.ma",
    "industry": "Information Technology",
    "size": "51-200",
    "founded": 2015,
    "location": {
      "address": "123 Business District",
      "city": "Casablanca",
      "country": "Morocco",
      "postalCode": "20000"
    },
    "contact": {
      "email": "contact@techsolutions.ma",
      "phone": "+212522000000",
      "linkedin": "https://linkedin.com/company/tech-solutions"
    },
    "socialMedia": {
      "linkedin": "https://linkedin.com/company/tech-solutions",
      "twitter": "https://twitter.com/techsolutions",
      "facebook": "https://facebook.com/techsolutions"
    },
    "activeJobs": 12,
    "totalJobs": 45,
    "memberSince": "2020-05-15T00:00:00.000Z"
  }
}
```

#### Update Company Profile
```
PUT /employers/company
```

**Headers:**
```
Authorization: Bearer JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Tech Solutions Updated",
  "description": "Updated company description...",
  "website": "https://techsolutions-updated.ma",
  "industry": "Software Development",
  "size": "201-500",
  "location": {
    "address": "456 Tech Park",
    "city": "Casablanca",
    "country": "Morocco",
    "postalCode": "20250"
  },
  "contact": {
    "email": "info@techsolutions.ma",
    "phone": "+212522111111"
  }
}
```

### Job Posting Management

#### Create Job Posting
```
POST /employers/jobs
```

**Headers:**
```
Authorization: Bearer JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Senior Full Stack Developer",
  "description": "<p>We are looking for an experienced Full Stack Developer...</p>",
  "requirements": [
    "5+ years of professional experience in web development",
    "Strong knowledge of JavaScript/TypeScript, Node.js, and React",
    "Experience with databases (MongoDB, PostgreSQL)",
    "Familiarity with cloud services (AWS, Azure, or GCP)",
    "Bachelor's degree in Computer Science or related field"
  ],
  "responsibilities": [
    "Develop and maintain web applications",
    "Collaborate with cross-functional teams",
    "Write clean, maintainable, and efficient code",
    "Participate in code reviews"
  ],
  "jobType": "CDI",
  "experienceLevel": "Senior",
  "location": {
    "city": "Casablanca",
    "address": "123 Business District",
    "isRemote": true
  },
  "salary": {
    "min": 40000,
    "max": 60000,
    "currency": "MAD",
    "isPublic": true,
    "isNegotiable": true
  },
  "benefits": [
    "Health insurance",
    "Flexible working hours",
    "Remote work options",
    "Training budget",
    "Performance bonuses"
  ],
  "skills": ["JavaScript", "TypeScript", "Node.js", "React", "MongoDB"],
  "applicationDeadline": "2024-12-31T23:59:59.000Z",
  "isActive": true,
  "applicationInstructions": "Please apply through our portal with your updated CV and cover letter."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Job posted successfully",
  "data": {
    "_id": "job_id_123",
    "title": "Senior Full Stack Developer",
    "company": "company_id_456",
    "status": "active",
    "createdAt": "2024-06-01T15:30:00.000Z",
    "applicationCount": 0
  }
}
```

#### Get Employer's Job Postings
```
GET /employers/jobs
```

**Query Parameters:**
- `status`: Filter by status (draft, active, closed, archived)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort by (newest, oldest, most_applications)

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 3
  },
  "data": [
    {
      "_id": "job_id_1",
      "title": "Senior Full Stack Developer",
      "jobType": "CDI",
      "experienceLevel": "Senior",
      "location": {
        "city": "Casablanca",
        "isRemote": true
      },
      "salary": {
        "min": 40000,
        "max": 60000,
        "currency": "MAD"
      },
      "status": "active",
      "createdAt": "2024-05-15T10:00:00.000Z",
      "applicationDeadline": "2024-12-31T23:59:59.000Z",
      "applicationCount": 5,
      "viewCount": 124
    },
    {
      "_id": "job_id_2",
      "title": "Frontend Developer",
      "jobType": "CDI",
      "experienceLevel": "Mid",
      "location": {
        "city": "Rabat",
        "isRemote": false
      },
      "salary": {
        "min": 30000,
        "max": 45000,
        "currency": "MAD"
      },
      "status": "active",
      "createdAt": "2024-05-10T14:30:00.000Z",
      "applicationDeadline": "2024-11-30T23:59:59.000Z",
      "applicationCount": 8,
      "viewCount": 210
    }
  ]
}
```

### Candidate Management

#### View Job Applications
```
GET /employers/jobs/:jobId/applications
```

**Query Parameters:**
- `status`: Filter by status (pending, reviewed, shortlisted, rejected, hired)
- `sort`: Sort by (newest, oldest, name, experience)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 5
  },
  "data": [
    {
      "_id": "application_id_1",
      "job": {
        "_id": "job_id_1",
        "title": "Senior Full Stack Developer"
      },
      "candidate": {
        "_id": "candidate_id_1",
        "name": "Mehdi Alaoui",
        "title": "Senior Developer",
        "location": "Casablanca",
        "experience": 6,
        "skills": ["JavaScript", "Node.js", "React", "MongoDB"],
        "resume": "https://storage.example.com/resumes/cv_mehdi_alaoui.pdf",
        "profilePicture": "https://storage.example.com/profiles/mehdi_alaoui.jpg"
      },
      "status": "shortlisted",
      "appliedAt": "2024-05-20T14:30:00.000Z",
      "updatedAt": "2024-05-22T10:15:00.000Z",
      "coverLetter": "Dear Hiring Manager...",
      "notes": [
        {
          "text": "Strong match for the position",
          "addedBy": "recruiter@example.com",
          "addedAt": "2024-05-21T09:30:00.000Z"
        }
      ]
    }
  ]
}
```

#### Update Application Status
```
PATCH /employers/applications/:applicationId/status
```

**Headers:**
```
Authorization: Bearer JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "shortlisted",
  "notes": "Strong candidate with relevant experience"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Application status updated successfully",
  "data": {
    "_id": "application_id_1",
    "status": "shortlisted",
    "updatedAt": "2024-06-01T16:20:00.000Z"
  }
}
```

## Portal/Admin APIs

### Authentication
Admin endpoints require an admin JWT token with the `admin` role in the Authorization header.

### User Management

#### Get All Users
```
GET /admin/users
```

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Query Parameters:**
- `role`: Filter by role (candidate, employer, admin)
- `status`: Filter by status (active, suspended, pending_verification)
- `search`: Search by name or email
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sort`: Sort by (newest, oldest, name, last_active)

**Success Response (200):**
```json
{
  "success": true,
  "count": 1245,
  "pagination": {
    "currentPage": 1,
    "totalPages": 63,
    "totalItems": 1245
  },
  "data": [
    {
      "_id": "user_id_1",
      "email": "user1@example.com",
      "firstName": "Mehdi",
      "lastName": "Alaoui",
      "role": "candidate",
      "status": "active",
      "lastLogin": "2024-05-30T14:30:00.000Z",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "profile": {
        "title": "Senior Developer",
        "location": "Casablanca"
      }
    },
    {
      "_id": "user_id_2",
      "email": "company@example.com",
      "companyName": "Tech Solutions",
      "role": "employer",
      "status": "active",
      "lastLogin": "2024-05-31T09:15:00.000Z",
      "createdAt": "2023-11-20T14:30:00.000Z",
      "company": {
        "name": "Tech Solutions",
        "industry": "Information Technology"
      }
    }
  ]
}
```

#### Get User Details
```
GET /admin/users/:userId
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id_1",
    "email": "user1@example.com",
    "firstName": "Mehdi",
    "lastName": "Alaoui",
    "phone": "+212600000000",
    "role": "candidate",
    "status": "active",
    "isEmailVerified": true,
    "lastLogin": "2024-05-30T14:30:00.000Z",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-05-30T14:30:00.000Z",
    "profile": {
      "title": "Senior Developer",
      "bio": "Experienced full-stack developer...",
      "location": "Casablanca, Morocco",
      "skills": ["JavaScript", "Node.js", "React", "MongoDB"],
      "experience": [
        {
          "title": "Senior Developer",
          "company": "Previous Company",
          "startDate": "2020-01-01",
          "endDate": null,
          "current": true
        }
      ]
    },
    "activity": {
      "loginCount": 124,
      "lastJobApplied": "2024-05-28T11:30:00.000Z",
      "applicationsCount": 8
    }
  }
}
```

#### Update User Status
```
PATCH /admin/users/:userId/status
```

**Request Body:**
```json
{
  "status": "suspended",
  "reason": "Violation of terms of service"
}
```

### Content Management

#### Get All Categories
```
GET /admin/categories
```

**Query Parameters:**
- `status`: Filter by status (active, inactive)
- `type`: Filter by type (job, resume, skill)
- `search`: Search by name
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Success Response (200):**
```json
{
  "success": true,
  "count": 45,
  "data": [
    {
      "_id": "category_1",
      "name": "Information Technology",
      "slug": "information-technology",
      "description": "IT and software development jobs",
      "status": "active",
      "type": "job",
      "jobCount": 245,
      "createdAt": "2023-01-15T00:00:00.000Z",
      "updatedAt": "2024-05-20T10:30:00.000Z"
    },
    {
      "_id": "category_2",
      "name": "Customer Service",
      "slug": "customer-service",
      "description": "Customer support and service roles",
      "status": "active",
      "type": "job",
      "jobCount": 189,
      "createdAt": "2023-01-16T00:00:00.000Z",
      "updatedAt": "2024-05-18T14:15:00.000Z"
    }
  ]
}
```

#### Create Category
```
POST /admin/categories
```

**Request Body:**
```json
{
  "name": "Artificial Intelligence",
  "description": "Jobs related to AI and machine learning",
  "type": "job",
  "status": "active",
  "icon": "ai-icon",
  "parentCategory": "category_1"
}
```

### Analytics

#### Get Platform Overview
```
GET /admin/analytics/overview
```

**Query Parameters:**
- `timeframe`: Filter by time period (today, week, month, year, custom)
- `startDate`: Start date for custom range (YYYY-MM-DD)
- `endDate`: End date for custom range (YYYY-MM-DD)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1245,
      "newThisMonth": 145,
      "activeToday": 89,
      "byType": {
        "candidates": 850,
        "employers": 385,
        "admins": 10
      },
      "growthRate": 12.5
    },
    "jobs": {
      "total": 589,
      "active": 245,
      "newThisMonth": 45,
      "byType": {
        "CDI": 320,
        "CDD": 189,
        "Freelance": 80
      },
      "categories": [
        {"name": "IT", "count": 156},
        {"name": "Customer Service", "count": 89},
        {"name": "Sales", "count": 67}
      ]
    },
    "applications": {
      "total": 1245,
      "thisMonth": 245,
      "byStatus": {
        "pending": 89,
        "reviewed": 67,
        "shortlisted": 45,
        "rejected": 34,
        "hired": 10
      },
      "conversionRate": 8.2
    },
    "engagement": {
      "avgSessionDuration": 245,
      "pageViews": 12456,
      "uniqueVisitors": 3456,
      "bounceRate": 42.5
    }
  }
}
```

#### Get User Activity Logs
```
GET /admin/analytics/activity-logs
```

**Query Parameters:**
- `userId`: Filter by user ID
- `action`: Filter by action type (login, job_view, application, etc.)
- `startDate`: Start date for filtering
- `endDate`: End date for filtering
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Success Response (200):**
```json
{
  "success": true,
  "count": 1245,
  "data": [
    {
      "_id": "log_1",
      "user": {
        "_id": "user_id_1",
        "email": "user1@example.com",
        "role": "candidate"
      },
      "action": "job_apply",
      "target": {
        "type": "job",
        "id": "job_id_123",
        "name": "Senior Developer"
      },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...",
      "timestamp": "2024-05-30T14:30:00.000Z"
    },
    {
      "_id": "log_2",
      "user": {
        "_id": "user_id_2",
        "email": "employer@example.com",
        "role": "employer"
      },
      "action": "job_post",
      "target": {
        "type": "job",
        "id": "job_id_124",
        "name": "Frontend Developer"
      },
      "ipAddress": "192.168.1.2",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15...",
      "timestamp": "2024-05-30T12:15:00.000Z"
    }
  ]
}
```

## Common APIs

### Categories

#### Get All Categories
```
GET /categories
```

**Query Parameters:**
- `type`: Filter by category type (job, resume, skill)
- `parent`: Filter by parent category ID
- `status`: Filter by status (active, inactive)
- `limit`: Number of results to return (default: 20, max: 100)

**Success Response (200):**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "_id": "category_1",
      "name": "Information Technology",
      "slug": "information-technology",
      "description": "IT and software development jobs",
      "icon": "code",
      "type": "job",
      "status": "active",
      "parent": null,
      "jobCount": 245,
      "createdAt": "2023-01-15T00:00:00.000Z",
      "updatedAt": "2024-05-20T10:30:00.000Z"
    },
    {
      "_id": "category_2",
      "name": "Software Development",
      "slug": "software-development",
      "description": "Software engineering and development",
      "icon": "laptop-code",
      "type": "job",
      "status": "active",
      "parent": "category_1",
      "jobCount": 156,
      "createdAt": "2023-01-16T00:00:00.000Z",
      "updatedAt": "2024-05-18T14:15:00.000Z"
    },
    {
      "_id": "category_3",
      "name": "Customer Service",
      "slug": "customer-service",
      "description": "Customer support and service roles",
      "icon": "headset",
      "type": "job",
      "status": "active",
      "parent": null,
      "jobCount": 189,
      "createdAt": "2023-01-17T00:00:00.000Z",
      "updatedAt": "2024-05-19T09:45:00.000Z"
    }
  ]
}
```

### File Uploads

#### Upload File
```
POST /upload
```

**Headers:**
```
Authorization: Bearer JWT_TOKEN
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: The file to upload (required)
- `type`: Type of file (resume, profile_image, company_logo, document)
- `folder`: Optional folder path for organization
- `isPublic`: Boolean indicating if the file should be publicly accessible (default: false)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "url": "https://storage.example.com/uploads/resumes/resume_12345.pdf",
    "path": "uploads/resumes/resume_12345.pdf",
    "filename": "resume_12345.pdf",
    "mimetype": "application/pdf",
    "size": 1245678,
    "uploadedAt": "2024-06-01T18:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid file type or missing required fields
- `401 Unauthorized`: Missing or invalid authentication
- `413 Payload Too Large`: File size exceeds maximum allowed
- `500 Internal Server Error`: Server error during file upload

### Newsletter

#### Subscribe to Newsletter
```
POST /newsletter/subscribe
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "preferences": ["job_alerts", "company_updates", "blog_posts"]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Thank you for subscribing to our newsletter!",
  "data": {
    "email": "user@example.com",
    "subscriptionId": "sub_123456789",
    "status": "subscribed",
    "subscribedAt": "2024-06-01T18:30:00.000Z"
  }
}
```

#### Check Subscription Status
```
GET /newsletter/status?email=user@example.com
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "isSubscribed": true,
    "status": "subscribed",
    "subscribedAt": "2024-06-01T18:30:00.000Z",
    "lastSent": "2024-05-28T10:00:00.000Z",
    "preferences": ["job_alerts", "company_updates"]
  }
}
```

#### Unsubscribe from Newsletter
```
POST /newsletter/unsubscribe
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "You have been unsubscribed from our newsletter.",
  "data": {
    "email": "user@example.com",
    "status": "unsubscribed",
    "unsubscribedAt": "2024-06-01T18:35:00.000Z"
  }
}
```

### Locations

#### Search Locations
```
GET /locations/search
```

**Query Parameters:**
- `q`: Search query (city, region, or country name)
- `type`: Filter by type (city, region, country)
- `limit`: Maximum number of results (default: 10, max: 50)

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "city_1",
      "name": "Casablanca",
      "type": "city",
      "region": "Casablanca-Settat",
      "country": "Morocco",
      "coordinates": {
        "lat": 33.5731,
        "lng": -7.5898
      },
      "jobCount": 245
    },
    {
      "id": "city_2",
      "name": "Rabat",
      "type": "city",
      "region": "Rabat-Salé-Kénitra",
      "country": "Morocco",
      "coordinates": {
        "lat": 34.0209,
        "lng": -6.8416
      },
      "jobCount": 189
    },
    {
      "id": "region_1",
      "name": "Marrakech-Safi",
      "type": "region",
      "country": "Morocco",
      "jobCount": 156
    }
  ]
}
```

### Skills

#### Get Popular Skills
```
GET /skills/popular
```

**Query Parameters:**
- `limit`: Number of results to return (default: 10, max: 50)
- `category`: Filter by category ID

**Success Response (200):**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "skill_1",
      "name": "JavaScript",
      "slug": "javascript",
      "jobCount": 345,
      "trending": true
    },
    {
      "_id": "skill_2",
      "name": "React",
      "slug": "react",
      "jobCount": 289,
      "trending": true
    },
    {
      "_id": "skill_3",
      "name": "Customer Service",
      "slug": "customer-service",
      "jobCount": 245,
      "trending": false
    }
  ]
}
```

## Error Handling

### Error Response Format
All error responses follow a consistent JSON format:

```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field1": "Error detail 1",
    "field2": "Error detail 2"
  },
  "timestamp": "2024-06-01T19:00:00.000Z"
}
```

### Standard Error Codes

| Status Code | Error Type          | Description                           | Common Scenarios |
|-------------|---------------------|---------------------------------------|------------------|
| 400         | BadRequest         | Invalid request parameters            | - Missing required fields<br>- Invalid data format<br>- Malformed request body |
| 401         | Unauthorized       | Authentication required              | - Missing or invalid JWT token<br>- Expired session<br>- Invalid credentials |
| 403         | Forbidden          | Insufficient permissions              | - User role not authorized for action<br>- Account suspended<br>- Email not verified |
| 404         | NotFound           | Resource not found                   | - Invalid resource ID<br>- Deleted content<br>- Non-existent route |
| 405         | MethodNotAllowed   | HTTP method not allowed              | - Using GET instead of POST<br>- Unsupported method for endpoint |
| 408         | RequestTimeout     | Request timeout                      | - Server took too long to respond<br>- Network issues |
| 409         | Conflict           | Resource already exists              | - Duplicate email<br>- Resource conflict |
| 413         | PayloadTooLarge    | Request entity too large             | - File upload exceeds size limit |
| 415         | UnsupportedMediaType | Unsupported media type              | - Invalid Content-Type header<br>- Unsupported file format |
| 422         | ValidationError    | Validation failed                    | - Invalid email format<br>- Password too short<br>- Out of range values |
| 429         | TooManyRequests    | Too many requests                    | - Rate limit exceeded<br>- Too many login attempts |
| 500         | InternalServerError | Server error                         | - Database connection issues<br>- Unexpected server errors |
| 503         | ServiceUnavailable | Service unavailable                  | - Maintenance mode<br>- Overloaded server |

### Common Error Scenarios

#### Authentication Errors
```json
// Invalid credentials
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid email or password",
  "code": "AUTH_INVALID_CREDENTIALS"
}

// Expired token
{
  "success": false,
  "error": "Unauthorized",
  "message": "Token has expired",
  "code": "AUTH_TOKEN_EXPIRED"
}
```

#### Validation Errors
```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

#### Rate Limiting
```json
{
  "success": false,
  "error": "TooManyRequests",
  "message": "Too many requests, please try again later",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

### Handling Errors in Client Applications

1. **Check the status code** to determine the general error category
2. **Examine the error code** for specific error identification
3. **Display user-friendly messages** based on the error code
4. **Implement retry logic** for transient errors (5xx, 429)
5. **Log detailed errors** for debugging purposes

### Best Practices

1. **Graceful Degradation**: Handle API failures gracefully in your application
2. **Retry Logic**: Implement exponential backoff for retryable errors
3. **User Feedback**: Provide clear, actionable error messages to users
4. **Error Logging**: Log detailed error information for debugging
5. **Fallback Content**: Show appropriate fallback UI when API calls fail

## Rate Limiting

The API implements rate limiting to ensure fair usage and prevent abuse. The following limits apply:

| Endpoint Category                   | Limit (per minute) |
|------------------------------------|-------------------|
| Authentication                     | 10               |
| Public Endpoints                   | 100              |
| Protected Endpoints (per user)     | 200              |
| File Uploads                       | 20               |
| Admin Endpoints                    | 50               |


Rate limit headers are included in all responses:

- `X-RateLimit-Limit`: The maximum number of requests allowed in the time window
- `X-RateLimit-Remaining`: The number of requests remaining in the current window
- `X-RateLimit-Reset`: The time at which the current window resets (in UTC epoch seconds)

When a rate limit is exceeded, the API will respond with a `429 Too Many Requests` status code and include a `Retry-After` header indicating how long to wait before making a new request.

## API Versioning

The API uses URL versioning with the format `/v{version}/` (e.g., `/v1/`). The current version is `v1`. When breaking changes are introduced, a new version will be released with appropriate deprecation notices.

### Deprecation Policy

1. **Announcement**: Deprecated endpoints will be announced at least 3 months before removal
2. **Documentation**: Deprecated endpoints will be clearly marked in the documentation
3. **Sunset Period**: At least 6 months notice will be given before removing a deprecated endpoint
4. **Version Bumps**: Major version increments indicate breaking changes

## Support

### Getting Help

For assistance with the API, please contact our support team:

- **Email**: support@jobcallcenter.ma
- **Phone**: +212 522-XXXXXX
- **Hours**: Monday-Friday, 9:00 AM - 6:00 PM (GMT+1)

### Reporting Issues

When reporting issues, please include:

1. The exact endpoint and HTTP method used
2. Request headers and body (if applicable)
3. Response status code and body
4. Steps to reproduce the issue
5. Any relevant error messages or logs

### Service Status

Check our [status page](https://status.jobcallcenter.ma) for real-time updates on API availability and incidents.

## Changelog

### v1.0.0 (2024-06-01)
- Initial public release of the JobCallCenter API
- Comprehensive documentation published
- Rate limiting and authentication implemented
- Support for job seekers, employers, and administrators

## Conclusion

This documentation covers all aspects of the JobCallCenter API. For the best integration experience:

1. Always include proper authentication headers
2. Handle errors gracefully in your application
3. Respect rate limits and implement appropriate backoff strategies
4. Monitor the API status page for updates
5. Keep your integration up-to-date with the latest API version

Thank you for using JobCallCenter! We're committed to providing a reliable and developer-friendly API for all your job portal needs.
