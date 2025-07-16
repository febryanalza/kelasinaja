import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, extractTokenFromHeader, isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    
    if (type) {
      whereClause.transaction_type = type;
    }

    if (status) {
      whereClause.payment_status = status;
    }

    // Get transactions with user data
    const [transactions, totalCount] = await Promise.all([
      prisma.token_transactions.findMany({
        where: whereClause,
        include: {
          users: {
            select: {
              full_name: true,
              email: true,
              avatar_url: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.token_transactions.count({ where: whereClause })
    ]);

    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      user_name: tx.users.full_name,
      user_email: tx.users.email,
      user_avatar: tx.users.avatar_url,
      transaction_type: tx.transaction_type,
      amount: Number(tx.amount),
      payment_method: tx.payment_method,
      payment_status: tx.payment_status,
      description: tx.description,
      created_at: tx.created_at.toISOString()
    }));

    return NextResponse.json({
      success: true,
      transactions: formattedTransactions,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengambil data transaksi' 
      },
      { status: 500 }
    );
  }
}