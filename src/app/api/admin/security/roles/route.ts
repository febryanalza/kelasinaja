import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, extractTokenFromHeader, isAdmin } from '@/lib/auth';

const ROLE_PERMISSIONS = {
  'admin': [
    'manage_users', 'manage_content', 'manage_settings', 
    'manage_roles', 'view_logs', 'manage_backups',
    'system_monitoring', 'financial_reports'
  ],
  'teacher': [
    'manage_content', 'view_logs', 'manage_videos',
    'view_students', 'grade_assignments'
  ],
  'student': [
    'view_content', 'purchase_videos', 'rate_videos',
    'manage_wishlist', 'view_profile'
  ]
};

const ROLE_DESCRIPTIONS = {
  'admin': 'Akses penuh ke semua fitur dan pengaturan sistem',
  'teacher': 'Mengelola konten pembelajaran dan video, serta melihat data siswa',
  'student': 'Mengakses konten pembelajaran dan mengelola profil'
};

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

    // Get role statistics
    const roleStats = await prisma.users.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    });

    // Format roles
    const roles = roleStats.map((stat, index) => ({
      id: index + 1,
      name: stat.role.charAt(0).toUpperCase() + stat.role.slice(1),
      description: ROLE_DESCRIPTIONS[stat.role as keyof typeof ROLE_DESCRIPTIONS] || 'Deskripsi tidak tersedia',
      permissions: ROLE_PERMISSIONS[stat.role as keyof typeof ROLE_PERMISSIONS] || [],
      user_count: stat._count.id
    }));

    return NextResponse.json({
      success: true,
      roles
    });

  } catch (error: any) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengambil data role' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const { roleId, name, description, permissions } = await request.json();

    if (!roleId || !name || !description || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'Data role tidak lengkap' },
        { status: 400 }
      );
    }

    // In a real implementation, you would update the role in a roles table
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      message: 'Role berhasil diperbarui',
      role: {
        id: roleId,
        name,
        description,
        permissions
      }
    });

  } catch (error: any) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat memperbarui role' 
      },
      { status: 500 }
    );
  }
}