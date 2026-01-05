import { NextResponse } from 'next/server';
import pool from '../../../../../lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const [rows] = await pool.query(
      'SELECT * FROM patient_comments WHERE patient_id = ? ORDER BY created_at DESC',
      [id]
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { comment } = await request.json();
    
    const [result] = await pool.query(
      'INSERT INTO patient_comments (patient_id, comment) VALUES (?, ?)',
      [id, comment]
    );
    
    return NextResponse.json({ 
      id: result.insertId, 
      patient_id: id,
      comment,
      created_at: new Date().toISOString()
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');
    
    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }
    
    await pool.query('DELETE FROM patient_comments WHERE id = ?', [commentId]);
    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
