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
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // Query activity logs from multiple tables
    const activities = await prisma.$queryRaw`
      SELECT 
        'login' as type,
        u.id as user_id,
        u.full_name as user_name,
        u.avatar_url as user_avatar,
        'melakukan login ke sistem' as action,
        COALESCE(t.created_at, u.updated_at) as timestamp,
        '192.168.1.1' as ip_address
      FROM users u
      LEFT JOIN tokens t ON u.id = t.user_id
      WHERE u.role IN ('admin', 'teacher')
      
      UNION ALL
      
      SELECT 
        'content' as type,
        u.id as user_id,
        u.full_name as user_name,
        u.avatar_url as user_avatar,
        'menambahkan video baru: ' || v.title as action,
        v.created_at as timestamp,
        '192.168.1.2' as ip_address
      FROM videos v
      JOIN users u ON v.teacher_id = u.id
      WHERE v.created_at >= NOW() - INTERVAL '30 days'
      
      ORDER BY timestamp DESC
      LIMIT ${limit} OFFSET ${offset}
    ` as any[];

    // Format activities
    const formattedActivities = activities.map(activity => ({
      id: `${activity.type}_${activity.user_id}_${new Date(activity.timestamp).getTime()}`,
      user_id: activity.user_id,
      user_name: activity.user_name,
      user_avatar: activity.user_avatar,
      action: activity.action,
      timestamp: new Date(activity.timestamp).toLocaleString('id-ID'),
      ip_address: activity.ip_address,
      type: activity.type
    }));

    return NextResponse.json({
      success: true,
      activities: formattedActivities
    });

  } catch (error: any) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengambil data aktivitas' 
      },
      { status: 500 }
    );
  }
}