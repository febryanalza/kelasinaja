import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, isAdmin } from '@/lib/auth';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

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

    // Get backup directory
    const backupDir = path.join(process.cwd(), 'backups');
    
    try {
      // Check if backup directory exists
      await fs.access(backupDir);
      
      // Read backup files
      const files = await fs.readdir(backupDir);
      const sqlFiles = files.filter(file => file.endsWith('.sql'));
      
      const backups = await Promise.all(
        sqlFiles.map(async (file, index) => {
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          
          return {
            id: index + 1,
            filename: file,
            size: `${Math.round(stats.size / (1024 * 1024))} MB`,
            created_at: stats.birthtime.toLocaleString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            status: 'completed' as const
          };
        })
      );
      
      return NextResponse.json({
        success: true,
        backups: backups.sort((a, b) => b.id - a.id)
      });
      
    } catch (error) {
      // Backup directory doesn't exist or is empty
      return NextResponse.json({
        success: true,
        backups: []
      });
    }

  } catch (error: any) {
    console.error('Error fetching backups:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat mengambil data backup' 
      },
      { status: 500 }
    );
  }
}

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

    const { filename, description } = await request.json();

    if (!filename) {
      return NextResponse.json(
        { error: 'Nama file backup diperlukan' },
        { status: 400 }
      );
    }

    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'backups');
    try {
      await fs.mkdir(backupDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    const backupPath = path.join(backupDir, filename);
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://kelasinaja:12345678@localhost:5432/kelasinaja';

    try {
      // Execute pg_dump command
      const command = `pg_dump "${databaseUrl}" > "${backupPath}"`;
      await execAsync(command);

      // Get file stats
      const stats = await fs.stat(backupPath);
      
      const newBackup = {
        id: Date.now(),
        filename,
        size: `${Math.round(stats.size / (1024 * 1024))} MB`,
        created_at: new Date().toLocaleString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        status: 'completed' as const,
        description
      };

      return NextResponse.json({
        success: true,
        message: 'Backup berhasil dibuat',
        backup: newBackup
      });

    } catch (error: any) {
      console.error('Backup creation failed:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Gagal membuat backup: ' + error.message 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error creating backup:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat membuat backup' 
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
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: 'Nama file backup diperlukan' },
        { status: 400 }
      );
    }

    const backupDir = path.join(process.cwd(), 'backups');
    const backupPath = path.join(backupDir, filename);

    try {
      await fs.unlink(backupPath);
      
      return NextResponse.json({
        success: true,
        message: 'Backup berhasil dihapus'
      });

    } catch (error: any) {
      return NextResponse.json(
        { 
          success: false,
          error: 'File backup tidak ditemukan atau gagal dihapus' 
        },
        { status: 404 }
      );
    }

  } catch (error: any) {
    console.error('Error deleting backup:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan saat menghapus backup' 
      },
      { status: 500 }
    );
  }
}