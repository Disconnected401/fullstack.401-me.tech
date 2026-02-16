import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool, { USE_DEMO_MODE } from '@/lib/db';
import { User } from '@/lib/types';
import { getMockUserByUsername } from '@/lib/mock-data';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Demo mode - use mock data
    if (USE_DEMO_MODE) {
      const user = getMockUserByUsername(username);

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return NextResponse.json({
        message: 'Login successful (Demo Mode)',
        user: userWithoutPassword,
      });
    }

    // Database mode
    if (!pool) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Query user from database
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );

      const users = rows as User[];

      if (users.length === 0) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const user = users[0];

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return NextResponse.json({
        message: 'Login successful',
        user: userWithoutPassword,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
