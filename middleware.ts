import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // This is a simple client-side routing middleware
  // In production, you would use proper JWT tokens and server-side session management
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
