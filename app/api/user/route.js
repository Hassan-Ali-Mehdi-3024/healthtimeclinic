import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Get current user info
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }
    
    const [rows] = await pool.query('SELECT id, username, full_name, email, role, created_at FROM users WHERE username = ?', [username]);
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(request) {
  try {
    const body = await request.json();
    const { full_name, username, email, currentPassword, newPassword, currentUsername } = body;
    
    if (!currentUsername) {
      return NextResponse.json({ error: 'Current username is required' }, { status: 400 });
    }
    
    // Get current user
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [currentUsername]);
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const user = users[0];
    
    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
      }
      
      if (currentPassword !== user.password) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
      
      // Update with new password
      await pool.query(
        'UPDATE users SET full_name = ?, username = ?, email = ?, password = ? WHERE id = ?',
        [full_name, username, email || null, newPassword, user.id]
      );
    } else {
      // Update without password change
      await pool.query(
        'UPDATE users SET full_name = ?, username = ?, email = ? WHERE id = ?',
        [full_name, username, email || null, user.id]
      );
    }
    
    // Return updated user (without password)
    const [updatedUsers] = await pool.query('SELECT id, username, full_name, email, role, created_at FROM users WHERE id = ?', [user.id]);
    
    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: updatedUsers[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
