import { NextRequest, NextResponse } from 'next/server';
import { mockCandidats } from './mock-data';

// This API route will proxy requests to the backend
export async function GET(request: NextRequest) {
  try {
    // Get the backend URL from environment variables or use a default
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Try multiple endpoints based on our known API mismatches
    const endpoints = [
      '/candidats',
      '/api/candidats',
      '/candidates',
      '/api/candidates',
      '/users/candidates',
      '/api/users/candidates'
    ];
    
    let response = null;
    let error = null;
    let backendData = null;
    
    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      try {
        const fullUrl = `${backendUrl}${endpoint}`;
        console.log(`Trying to fetch candidates from backend: ${fullUrl}`);
        
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
          console.log(`Successfully fetched candidates from: ${fullUrl}`);
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
      console.log('Using mock candidates data as fallback');
      return NextResponse.json({
        candidats: mockCandidats,
        source: 'mock'
      });
    }
    
    // Process the backend data to ensure consistent format
    let candidatsData;
    if (Array.isArray(backendData)) {
      candidatsData = backendData;
    } else if (backendData.candidats && Array.isArray(backendData.candidats)) {
      candidatsData = backendData.candidats;
    } else if (backendData.candidates && Array.isArray(backendData.candidates)) {
      candidatsData = backendData.candidates;
    } else if (backendData.users && Array.isArray(backendData.users)) {
      candidatsData = backendData.users;
    } else if (backendData.data && Array.isArray(backendData.data)) {
      candidatsData = backendData.data;
    } else if (backendData.results && Array.isArray(backendData.results)) {
      candidatsData = backendData.results;
    } else {
      console.warn('Unexpected data format from backend, using mock data');
      candidatsData = mockCandidats;
    }
    
    return NextResponse.json({
      candidats: candidatsData,
      source: backendData ? 'backend' : 'mock'
    });
  } catch (error) {
    console.error('Error in candidats API route:', error);
    // Return mock data on error
    return NextResponse.json({
      candidats: mockCandidats,
      source: 'mock',
      error: 'Backend error, using mock data'
    });
  }
}
