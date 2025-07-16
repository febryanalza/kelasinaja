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

    // Get date ranges
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    // Parallel queries for better performance
    const [
      totalStudents,
      totalTeachers,
      totalVideos,
      totalTransactions,
      dailyTransactions,
      monthlyTransactions,
      growthData
    ] = await Promise.all([
      // Total students
      prisma.users.count({
        where: { role: 'student' }
      }),
      
      // Total teachers
      prisma.users.count({
        where: { role: 'teacher' }
      }),
      
      // Total videos
      prisma.videos.count(),
      
      // Total transactions
      prisma.token_transactions.count(),
      
      // Daily revenue
      prisma.token_transactions.aggregate({
        where: {
          transaction_type: 'purchase',
          payment_status: 'completed',
          created_at: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        _sum: {
          amount: true
        }
      }),
      
      // Monthly revenue
      prisma.token_transactions.aggregate({
        where: {
          transaction_type: 'purchase',
          payment_status: 'completed',
          created_at: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        _sum: {
          amount: true
        }
      }),
      
      // Growth data (last 6 months)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(CASE WHEN role = 'student' THEN 1 END) as students,
          COUNT(CASE WHEN role = 'teacher' THEN 1 END) as teachers
        FROM users 
        WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month ASC
      `
    ]);

    // Format growth data
    const formattedGrowthData = (growthData as any[]).map(item => ({
      date: new Date(item.month).toLocaleDateString('id-ID', { month: 'short' }),
      students: Number(item.students),
      teachers: Number(item.teachers)
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        totalVideos,
        totalTransactions,
        dailyRevenue: dailyTransactions._sum.amount || 0,
        monthlyRevenue: monthlyTransactions._sum.amount || 0
      },
      growthData: formattedGrowthData
    });

  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengambil statistik dashboard' 
      },
      { status: 500 }
    );
  }
}