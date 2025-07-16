import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, extractTokenFromHeader, isAdmin } from '@/lib/auth';
import bcrypt from 'bcrypt';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const dateFilter = searchParams.get('dateFilter');
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (role && role !== 'all') {
      whereClause.role = role;
    }
    
    // Date filter
    if (dateFilter && dateFilter !== 'all') {
      const now = new Date();
      let dateThreshold: Date;
      
      if (dateFilter === 'last30days') {
        dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (dateFilter === 'last90days') {
        dateThreshold = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      } else {
        dateThreshold = new Date(0); // All time
      }
      
      if (dateFilter !== 'all') {
        whereClause.created_at = {
          gte: dateThreshold
        };
      }
    }

    // Get users with pagination and include count
    const [users, totalCount, userCounts] = await Promise.all([
      prisma.users.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          full_name: true,
          avatar_url: true,
          role: true,
          grade: true,
          created_at: true,
          updated_at: true
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.users.count({ where: whereClause }),
      // Query count terpisah
      Promise.all(
        users.map(user => prisma.users.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            _count: {
              select: {
                videos: true,
                purchased_videos: true,
                liked_videos: true,
                tokens: true
              }
            }
          }
        }))
      )
    ]);

    // Format users with status simulation (since not in schema)
    const formattedUsers = users.map((user, index) => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name || 'No Name',
      avatar_url: user.avatar_url,
      role: user.role as 'admin' | 'teacher' | 'student',
      grade: user.grade,
      status: 'active' as const, // Default status since not in schema
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
      last_login: user.updated_at.toISOString(), // Use updated_at as last_login
      stats: {
        total_videos: userCounts[index]?._count.videos || 0,
        total_purchases: userCounts[index]?._count.purchased_videos || 0,
        total_likes: userCounts[index]?._count.liked_videos || 0,
        has_tokens: userCounts[index]?._count.tokens > 0
      }
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengambil data pengguna' 
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

    const { userId, action, data } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID dan action diperlukan' },
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

    let updateData: any = {};
    let message = '';

    switch (action) {
      case 'verify_teacher':
        updateData = { role: 'teacher' };
        message = 'Pengguna berhasil diverifikasi sebagai guru';
        break;
        
      case 'update_role':
        if (!data?.role || !['admin', 'teacher', 'student'].includes(data.role)) {
          return NextResponse.json(
            { error: 'Role tidak valid' },
            { status: 400 }
          );
        }
        updateData = { role: data.role };
        message = `Role pengguna berhasil diubah menjadi ${data.role}`;
        break;
        
      case 'update_profile':
        if (data?.full_name) updateData.full_name = data.full_name;
        if (data?.email) {
          // Check email uniqueness
          const emailExists = await prisma.users.findFirst({
            where: {
              email: data.email,
              id: { not: userId }
            }
          });
          
          if (emailExists) {
            return NextResponse.json(
              { error: 'Email sudah digunakan oleh pengguna lain' },
              { status: 409 }
            );
          }
          
          updateData.email = data.email;
        }
        if (data?.grade) updateData.grade = data.grade;
        message = 'Profil pengguna berhasil diperbarui';
        break;
        
      default:
        return NextResponse.json(
          { error: 'Action tidak valid' },
          { status: 400 }
        );
    }

    // Update user
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        ...updateData,
        updated_at: new Date()
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
        role: true,
        grade: true,
        created_at: true,
        updated_at: true
      }
    });

    return NextResponse.json({
      success: true,
      message,
      user: {
        ...updatedUser,
        status: 'active',
        created_at: updatedUser.created_at.toISOString(),
        updated_at: updatedUser.updated_at.toISOString(),
        last_login: updatedUser.updated_at.toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat memperbarui pengguna' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID diperlukan' },
        { status: 400 }
      );
    }

    // Check if user exists and get counts properly
    const existingUser = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        _count: {
          select: {
            videos: true,
            purchased_videos: true
          }
        }
      }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if user has content that prevents deletion
    if (existingUser._count.videos > 0) {
      return NextResponse.json(
        { 
          error: 'Tidak dapat menghapus pengguna yang memiliki video. Hapus video terlebih dahulu.' 
        },
        { status: 409 }
      );
    }

    if (existingUser._count.purchased_videos > 0) {
      return NextResponse.json(
        { 
          error: 'Tidak dapat menghapus pengguna yang memiliki riwayat pembelian.' 
        },
        { status: 409 }
      );
    }

    // Delete user and related data in transaction
    await prisma.$transaction(async (tx) => {
      // Delete related data first
      await tx.liked_videos.deleteMany({ where: { user_id: userId } });
      await tx.wishlists.deleteMany({ where: { user_id: userId } });
      await tx.video_ratings.deleteMany({ where: { user_id: userId } });
      await tx.video_views.deleteMany({ where: { user_id: userId } });
      await tx.tokens.deleteMany({ where: { user_id: userId } });
      await tx.token_transactions.deleteMany({ where: { user_id: userId } });
      await tx.subscriptions.deleteMany({ where: { user_id: userId } });
      await tx.badges.deleteMany({ where: { user_id: userId } });
      
      // Delete user
      await tx.users.delete({ where: { id: userId } });
    });

    return NextResponse.json({
      success: true,
      message: 'Pengguna berhasil dihapus'
    });

  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat menghapus pengguna' 
      },
      { status: 500 }
    );
  }
}