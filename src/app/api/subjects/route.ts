import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Ambil semua subject dari database
    const subjects = await prisma.subject.findMany({
      select: {
        id: true,
        title: true
      },
      orderBy: {
        title: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      subjects
    });

  } catch (error: any) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengambil data mata pelajaran' 
      },
      { status: 500 }
    );
  }
}