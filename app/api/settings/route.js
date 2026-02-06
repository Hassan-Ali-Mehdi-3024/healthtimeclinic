import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'data', 'settings.json');

async function getSettings() {
  try {
    const data = await fs.readFile(settingsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Return defaults if file doesn't exist
    return {
      clinicName: "Health Time Clinic",
      address: "123 Health Street, Wellness City",
      phone: "+1 234 567 8900",
      email: "contact@healthtime.com",
      currency: "Rs",
      dateFormat: "DD/MM/YYYY",
      primaryColor: "#3b82f6",
      theme: "light",
      itemsPerPage: 10
    };
  }
}

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PUT(request) {
  try {
    const newSettings = await request.json();
    // Merge with existing to prevent data loss
    const current = await getSettings();
    const updated = { ...current, ...newSettings };
    
    await fs.writeFile(settingsPath, JSON.stringify(updated, null, 2));
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}