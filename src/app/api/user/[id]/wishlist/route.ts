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

    // Ambil wishlist dengan detail video dan subject
    const wishlistData = await prisma.wishlists.findMany({
      where: { user_id: params.id },
      include: {
        videos: {
          include: {
            subject_videos_subjectTosubject: {
              select: { title: true }
            },
            users: {
              select: { full_name: true }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Format data sesuai interface Video
    const formattedVideos = wishlistData.map(wishlist => ({
      id: wishlist.videos.id,
      title: wishlist.videos.title,
      description: wishlist.videos.description,
      subject: wishlist.videos.subject_videos_subjectTosubject.title,
      grade: wishlist.videos.grade,
      thumbnail: wishlist.videos.thumbnail || '/images/integral.jpg',
      video_url: wishlist.videos.video_url,
      price: Number(wishlist.videos.price) || 0,
      views: wishlist.videos.views || 0,
      rating: Number(wishlist.videos.rating) || 0,
      teacher_id: wishlist.videos.teacher_id,
      teacher_name: wishlist.videos.users.full_name,
      created_at: wishlist.videos.created_at.toISOString(),
      updated_at: wishlist.videos.updated_at.toISOString(),
      isWishlisted: true
    }));

    return NextResponse.json({
      success: true,
      videos: formattedVideos
    });

  } catch (error: any) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengambil data wishlist' 
      },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const { video_id } = await request.json();

    if (!video_id) {
      return NextResponse.json(
        { error: 'video_id diperlukan' },
        { status: 400 }
      );
    }

    // Cek apakah video sudah ada di wishlist
    const existingWishlist = await prisma.wishlists.findFirst({
      where: {
        user_id: params.id,
        video_id: video_id
      }
    });

    if (existingWishlist) {
      return NextResponse.json(
        { error: 'Video sudah ada di wishlist' },
        { status: 409 }
      );
    }

    // Tambah ke wishlist
    const newWishlist = await prisma.wishlists.create({
      data: {
        user_id: params.id,
        video_id: video_id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Video berhasil ditambahkan ke wishlist',
      wishlist: newWishlist
    });

  } catch (error: any) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat menambah ke wishlist' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { searchParams } = new URL(request.url);
    const video_id = searchParams.get('video_id');

    if (!video_id) {
      return NextResponse.json(
        { error: 'video_id diperlukan' },
        { status: 400 }
      );
    }

    // Hapus dari wishlist
    await prisma.wishlists.deleteMany({
      where: {
        user_id: params.id,
        video_id: video_id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Video berhasil dihapus dari wishlist'
    });

  } catch (error: any) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat menghapus dari wishlist' 
      },
      { status: 500 }
    );
  }
}