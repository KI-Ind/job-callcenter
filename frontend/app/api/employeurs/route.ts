import { NextRequest, NextResponse } from 'next/server';
import { mockEmployeurs } from './mock-data';

// This API route will proxy requests to the backend
export async function GET(request: NextRequest) {
  try {
    // Get the backend URL from environment variables or use a default
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Try multiple endpoints based on our known API mismatches
    const endpoints = [
      '/employeurs',
      '/api/employeurs',
      '/entreprises',
      '/api/entreprises',
      '/companies',
      '/api/companies'
    ];
    
    let response = null;
    let error = null;
    let backendData = null;
    
    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      try {
        const fullUrl = `${backendUrl}${endpoint}`;
        console.log(`Trying to fetch employers from backend: ${fullUrl}`);
        
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
          console.log(`Successfully fetched employers from: ${fullUrl}`);
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
      console.log('Using mock employers data as fallback');
      return NextResponse.json({
        employeurs: mockEmployeurs,
        source: 'mock'
      });
    }
    
    // Process the backend data to ensure consistent format
    let employeursData;
    if (Array.isArray(backendData)) {
      employeursData = backendData;
    } else if (backendData.employeurs && Array.isArray(backendData.employeurs)) {
      employeursData = backendData.employeurs;
    } else if (backendData.companies && Array.isArray(backendData.companies)) {
      employeursData = backendData.companies;
    } else if (backendData.entreprises && Array.isArray(backendData.entreprises)) {
      employeursData = backendData.entreprises;
    } else if (backendData.data && Array.isArray(backendData.data)) {
      employeursData = backendData.data;
    } else if (backendData.results && Array.isArray(backendData.results)) {
      employeursData = backendData.results;
    } else {
      console.warn('Unexpected data format from backend, using mock data');
      employeursData = mockEmployeurs;
    }
    
    return NextResponse.json({
      employeurs: employeursData,
      source: backendData ? 'backend' : 'mock'
    });
  } catch (error) {
    console.error('Error in employeurs API route:', error);
    // Return mock data on error
    return NextResponse.json({
      employeurs: mockEmployeurs,
      source: 'mock',
      error: 'Backend error, using mock data'
    });
  }
}
