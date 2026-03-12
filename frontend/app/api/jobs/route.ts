import { NextRequest, NextResponse } from 'next/server';
import { mockJobs } from './mock-data';

// This API route will proxy requests to the backend
export async function GET(request: NextRequest) {
  try {
    // Get the backend URL from environment variables or use a default
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Get the limit parameter from the request URL, default to 100
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || '100';
    
    // Try multiple backend endpoints based on our known API mismatches
    const endpoints = [
      `/jobs?limit=${limit}`,
      `/api/jobs?limit=${limit}`,
      `/jobs/search?limit=${limit}`
    ];
    
    let response = null;
    let error = null;
    let backendData = null;
    
    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      try {
        const fullUrl = `${backendUrl}${endpoint}`;
        console.log(`Trying to fetch jobs from backend: ${fullUrl}`);
        
        const res = await fetch(fullUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
          // Set a short timeout to prevent long waits if the backend is down
          signal: AbortSignal.timeout(3000)
        });
        
        if (res.ok) {
          response = res;
          console.log(`Successfully fetched jobs from: ${fullUrl}`);
          backendData = await res.json();
          break;
        }
      } catch (endpointError) {
        console.error(`Failed to fetch from ${endpoint}:`, endpointError);
        error = endpointError;
        // Continue to next endpoint
      }
    }
    
    // If all backend endpoints failed, use mock data
    if (!backendData) {
      console.log('Using mock data as fallback');
      return NextResponse.json({
        jobs: mockJobs,
        source: 'mock'
      });
    }
    
    // Process the backend data to ensure consistent format
    let jobsData;
    if (Array.isArray(backendData)) {
      jobsData = backendData;
    } else if (backendData.jobs && Array.isArray(backendData.jobs)) {
      jobsData = backendData.jobs;
    } else if (backendData.data && Array.isArray(backendData.data)) {
      jobsData = backendData.data;
    } else if (backendData.results && Array.isArray(backendData.results)) {
      jobsData = backendData.results;
    } else {
      console.warn('Unexpected data format from backend, using mock data');
      jobsData = mockJobs;
    }
    
    return NextResponse.json({
      jobs: jobsData,
      source: backendData ? 'backend' : 'mock'
    });
  } catch (error) {
    console.error('Error in jobs API route:', error);
    // Return mock data on error
    return NextResponse.json({
      jobs: mockJobs,
      source: 'mock',
      error: 'Backend error, using mock data'
    });
  }
}
