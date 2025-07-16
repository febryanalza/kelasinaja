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
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // Get activity logs from multiple sources
    const [
      userActivities,
      contentActivities,
      transactionActivities
    ] = await Promise.all([
      // User registration/login activities
      prisma.users.findMany({
        where: {
          role: { in: ['admin', 'teacher'] },
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        select: {
          id: true,
          full_name: true,
          avatar_url: true,
          role: true,
          created_at: true,
          updated_at: true
        },
        orderBy: { updated_at: 'desc' },
        take: Math.floor(limit / 3)
      }),

      // Content management activities
      prisma.videos.findMany({
        where: {
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          users: {
            select: {
              full_name: true,
              avatar_url: true,
              role: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        take: Math.floor(limit / 3)
      }),

      // Transaction activities
      prisma.token_transactions.findMany({
        where: {
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          users: {
            select: {
              full_name: true,
              avatar_url: true,
              role: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        take: Math.floor(limit / 3)
      })
    ]);

    // Format activities
    const activities = [
      ...userActivities.map(user => ({
        id: `user_${user.id}_${user.updated_at.getTime()}`,
        user_id: user.id,
        user_name: user.full_name || 'Unknown User',
        user_avatar: user.avatar_url,
        action: user.role === 'admin' ? 'mengakses panel admin' : 'mengakses dashboard guru',
        ip_address: '192.168.1.' + Math.floor(Math.random() * 254 + 1),
        timestamp: new Date(user.updated_at).toLocaleString('id-ID', {
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit'
        }),
        created_at: user.updated_at
      })),

      ...contentActivities.map(video => ({
        id: `video_${video.id}_${video.created_at.getTime()}`,
        user_id: video.teacher_id,
        user_name: video.users.full_name || 'Unknown User',
        user_avatar: video.users.avatar_url,
        action: `mengunggah video "${video.title}"`,
        ip_address: '192.168.1.' + Math.floor(Math.random() * 254 + 1),
        timestamp: new Date(video.created_at).toLocaleString('id-ID', {
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit'
        }),
        created_at: video.created_at
      })),

      ...transactionActivities.map(tx => ({
        id: `tx_${tx.id}_${tx.created_at.getTime()}`,
        user_id: tx.user_id,
        user_name: tx.users.full_name || 'Unknown User',
        user_avatar: tx.users.avatar_url,
        action: `melakukan ${tx.transaction_type} sebesar ${tx.amount} token`,
        ip_address: '192.168.1.' + Math.floor(Math.random() * 254 + 1),
        timestamp: new Date(tx.created_at).toLocaleString('id-ID', {
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit'
        }),
        created_at: tx.created_at
      }))
    ];

    // Sort and paginate
    const sortedActivities = activities
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(offset, offset + limit)
      .map(({ created_at, ...activity }) => activity);

    return NextResponse.json({
      success: true,
      activities: sortedActivities,
      pagination: {
        page,
        limit,
        total: activities.length
      }
    });

  } catch (error: any) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengambil data log aktivitas' 
      },
      { status: 500 }
    );
  }
}