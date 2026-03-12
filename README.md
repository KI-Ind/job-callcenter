# JobCallCenter.ma

A modern job portal platform for call center positions in Morocco, connecting candidates with employers in the call center industry.

## Overview

JobCallCenter.ma is a comprehensive web application designed to streamline the job search and recruitment process for the call center industry in Morocco. The platform provides a user-friendly interface for job seekers to find relevant positions and for employers to post job listings and manage applications.

## Features

### For Job Seekers

- **Job Search**: Advanced search functionality with filters for location, job type, experience level, and more
- **Company Profiles**: Detailed information about call center companies operating in Morocco, including real-time job counts
- **Application Management**: Track application status and history
- **Profile Management**: Create and manage professional profiles with resume upload
- **Job Alerts**: Subscribe to receive notifications about new job postings
- **Newsletter Subscription**: Stay updated with the latest industry news and opportunities with offline support

### For Employers

- **Job Posting**: Create and manage job listings with detailed descriptions
- **Candidate Management**: Review applications and manage candidate pipelines
- **Company Profile**: Showcase company information, culture, and benefits
- **Analytics**: Access insights about job posting performance and applicant demographics
- **Featured Listings**: Promote job postings for increased visibility

### Platform Features

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Multi-language Support**: Available in French and Arabic with proper localization
- **Real-time Notifications**: Instant updates on application status changes
- **Dynamic Content**: Real-time job counts and company statistics with automatic refresh
- **Offline Support**: Key features like newsletter subscription work without internet connection
- **Secure Authentication**: JWT-based authentication system with role-based access control
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Performance Optimized**: Efficient data fetching with caching and request deduplication

## Technical Stack

### Frontend
- Next.js (React framework)
- TypeScript
- Tailwind CSS for styling
- React Query for data fetching
- Context API for state management

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- Multer for file uploads
- RESTful API architecture

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/jobcallcenter.git
cd jobcallcenter
```

2. Install dependencies for both frontend and backend
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables
Create `.env` files in both the backend and frontend directories based on the provided `.env.example` files.

4. Start the development servers
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd frontend
npm run dev
```

5. Access the application
Open your browser and navigate to `http://localhost:3000`

## API Documentation

The backend API documentation is available in the `backend/API_DOCUMENTATION.md` file. It provides detailed information about all available endpoints, request/response formats, and authentication requirements.

## Recent Updates

### Dynamic Company List
- Implemented real-time job counts for companies
- Added multiple endpoint fallbacks for reliable data fetching
- Enhanced sorting and filtering options for company listings

### Newsletter Subscription System
- Added robust newsletter subscription functionality
- Implemented duplicate email detection and handling
- Added proper error handling and user feedback
- Created local storage fallback for offline support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any inquiries, please reach out to contact@jobcallcenter.ma
# job-callcenter
