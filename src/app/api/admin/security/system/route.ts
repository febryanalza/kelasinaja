import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, isAdmin } from '@/lib/auth';
import prisma from '@/lib/db';
import os from 'os';

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

    // Get system statistics
    const [
      totalUsers,
      activeUsersToday,
      totalVideos,
      totalTransactions
    ] = await Promise.all([
      prisma.users.count(),
      prisma.users.count({
        where: {
          updated_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      }),
      prisma.videos.count(),
      prisma.token_transactions.count()
    ]);

    // Get system performance metrics
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = Math.round((usedMemory / totalMemory) * 100);

    // CPU usage simulation (in real app, you'd use a proper monitoring library)
    const cpuUsage = Math.floor(Math.random() * 30) + 20; // 20-50%
    
    // Disk usage simulation
    const diskUsage = Math.floor(Math.random() * 40) + 40; // 40-80%

    const systemStatus = {
      cpu_usage: cpuUsage,
      memory_usage: memoryUsage,
      disk_usage: diskUsage,
      active_users: activeUsersToday,
      total_users: totalUsers,
      total_videos: totalVideos,
      total_transactions: totalTransactions,
      last_updated: new Date().toLocaleTimeString('id-ID')
    };

    return NextResponse.json({
      success: true,
      system_status: systemStatus
    });

  } catch (error: any) {
    console.error('Error fetching system status:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengambil data sistem' 
      },
      { status: 500 }
    );
  }
}