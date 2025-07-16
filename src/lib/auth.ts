import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';

export function verifyToken(token: string): DecodedToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function generateToken(payload: { 
  userId: string; 
  email: string; 
  role: string 
}): string {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '7d' 
  });
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

export function isValidRole(role: string): boolean {
  return ['admin', 'teacher', 'student'].includes(role);
}

export function isAdmin(role: string): boolean {
  return role === 'admin';
}

export function isTeacher(role: string): boolean {
  return role === 'teacher';
}

export function canUploadVideo(userRole: string): boolean {
  return ['teacher', 'admin'].includes(userRole);
}

export function isStudent(role: string): boolean {
  return role === 'student';
}

export function hasPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    'admin': 3,
    'teacher': 2,
    'student': 1
  };
  
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
  
  return userLevel >= requiredLevel;
}

export function canAccessTeacherDashboard(userRole: string, userId: string, targetUserId: string): boolean {
  // Admin can access any teacher dashboard
  if (userRole === 'admin') return true;
  
  // Teacher can only access their own dashboard
  if (userRole === 'teacher' && userId === targetUserId) return true;
  
  return false;
}