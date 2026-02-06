import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { username } = await request.json();

    // 1. Find user
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    const user = rows[0];

    if (!user) {
      // Return success even if user not found to prevent enumeration
      return NextResponse.json({ success: true, message: 'If account exists, email sent.' });
    }

    // 2. Generate Reset Token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // 3. Save to DB
    // Note: This relies on the columns being added via migration
    try {
      await pool.query(
        'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
        [resetToken, resetTokenExpiry.toISOString(), user.id]
      );
    } catch (dbError) {
      console.error('DB Error saving token (columns might be missing):', dbError);
      return NextResponse.json({ 
        success: false, 
        message: 'System update required. Please contact admin.' 
      }, { status: 500 });
    }

    // 4. Send Email (Mock)
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    // In a real app, use Resend/SendGrid here
    console.log('================================================');
    console.log(`PASSWORD RESET REQUEST FOR: ${username}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log('================================================');

    return NextResponse.json({ 
      success: true, 
      message: 'Reset instructions sent.' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
