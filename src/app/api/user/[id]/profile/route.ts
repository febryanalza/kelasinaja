import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token akses diperlukan' },
        { status: 401 }
      );
    }
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.userId !== params.id) {
      return NextResponse.json(
        { error: 'Tidak diizinkan mengakses resource ini' },
        { status: 403 }
      );
    }

    // Ambil data user terlebih dahulu
    const user = await prisma.users.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
        grade: true,
        role: true,
        badge: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Ambil data tokens secara terpisah
    let tokenBalance = 0;
    let tokenLastUpdated = null;

    try {
      const userToken = await prisma.tokens.findFirst({
        where: { user_id: params.id },
        select: {
          amount: true,
          last_updated: true
        },
        orderBy: {
          last_updated: 'desc'
        }
      });

      if (userToken) {
        tokenBalance = Number(userToken.amount) || 0;
        tokenLastUpdated = userToken.last_updated;
      }
    } catch (tokenError) {
      console.log('Token data not available:', tokenError);
      // Token data tidak tersedia, gunakan default
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        token_balance: tokenBalance,
        token_last_updated: tokenLastUpdated,
        created_at: user.created_at.toISOString(),
        updated_at: user.updated_at.toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    
    // Log detail error untuk debugging
    if (error.code) {
      console.error('Prisma error code:', error.code);
    }
    if (error.meta) {
      console.error('Prisma error meta:', error.meta);
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengambil data profile',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token akses diperlukan' },
        { status: 401 }
      );
    }
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.userId !== params.id) {
      return NextResponse.json(
        { error: 'Tidak diizinkan mengakses resource ini' },
        { status: 403 }
      );
    }

    const { full_name, avatar_url, grade } = await request.json();

    // Validasi input
    if (full_name && typeof full_name !== 'string') {
      return NextResponse.json(
        { error: 'Nama lengkap harus berupa string' },
        { status: 400 }
      );
    }

    if (avatar_url && typeof avatar_url !== 'string') {
      return NextResponse.json(
        { error: 'URL avatar harus berupa string' },
        { status: 400 }
      );
    }

    if (grade && typeof grade !== 'string') {
      return NextResponse.json(
        { error: 'Kelas harus berupa string' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update user profile
    const updateData: any = {
      updated_at: new Date()
    };

    if (full_name !== undefined) updateData.full_name = full_name;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (grade !== undefined) updateData.grade = grade;

    const updatedUser = await prisma.users.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
        grade: true,
        role: true,
        badge: true,
        created_at: true,
        updated_at: true
      }
    });

    // Get token balance
    let tokenBalance = 0;
    try {
      const userToken = await prisma.tokens.findFirst({
        where: { user_id: params.id },
        select: { amount: true },
        orderBy: { last_updated: 'desc' }
      });
      
      if (userToken) {
        tokenBalance = Number(userToken.amount) || 0;
      }
    } catch (tokenError) {
      console.log('Token data not available for update response');
    }

    return NextResponse.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      user: {
        ...updatedUser,
        token_balance: tokenBalance,
        created_at: updatedUser.created_at.toISOString(),
        updated_at: updatedUser.updated_at.toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat memperbarui profil',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}