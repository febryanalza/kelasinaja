import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, extractTokenFromHeader, isAdmin } from '@/lib/auth';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
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
    if (!decoded || !isAdmin(decoded.role)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mengakses resource ini' },
        { status: 403 }
      );
    }

    const { userId, newPassword } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID diperlukan' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    let hashedPassword: string;
    let message: string;

    if (newPassword) {
      // Admin sets specific password
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Password minimal 6 karakter' },
          { status: 400 }
        );
      }
      
      hashedPassword = await bcrypt.hash(newPassword, 12);
      message = 'Password berhasil diubah';
    } else {
      // Generate random password
      const randomPassword = crypto.randomBytes(8).toString('hex');
      hashedPassword = await bcrypt.hash(randomPassword, 12);
      message = `Password berhasil direset. Password baru: ${randomPassword}`;
    }

    // Update password
    await prisma.users.update({
      where: { id: userId },
      data: {
        hash_password: hashedPassword,
        updated_at: new Date()
      }
    });

    // Log activity
    await prisma.token_transactions.create({
      data: {
        user_id: userId,
        amount: 0,
        transaction_type: 'admin_action',
        description: 'Password direset oleh admin',
        payment_status: 'completed'
      }
    });

    return NextResponse.json({
      success: true,
      message
    });

  } catch (error: any) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mereset password' 
      },
      { status: 500 }
    );
  }
}