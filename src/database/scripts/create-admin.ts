import bcrypt from 'bcrypt';
import prisma from '@/lib/db';

interface AdminData {
  email: string;
  password: string;
  full_name: string;
  role: 'admin';
}

async function createAdminUser(): Promise<void> {
  try {
    console.log('🔐 Creating admin user...');
    
    // Admin data
    const adminData: AdminData = {
      email: 'your@emailhere',
      password: 'yourpassword',
      full_name: 'Super Administrator',
      role: 'admin'
    };
    
    // Hash password
    console.log('🔒 Hashing password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
    
    // Check if admin already exists
    const existingAdmin = await prisma.users.findUnique({
      where: { email: adminData.email },
      select: { id: true, email: true, full_name: true, role: true }
    });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists. Updating password...');
      
      // Update existing admin
      const updatedAdmin = await prisma.users.update({
        where: { email: adminData.email },
        data: {
          hash_password: hashedPassword,
          full_name: adminData.full_name,
          role: adminData.role,
          updated_at: new Date()
        },
        select: {
          id: true,
          email: true,
          full_name: true,
          role: true,
          updated_at: true
        }
      });
      
      console.log('✅ Admin user updated successfully!');
      console.log('📧 Email:', updatedAdmin.email);
      console.log('👤 Name:', updatedAdmin.full_name);
      console.log('🔑 Role:', updatedAdmin.role);
      
    } else {
      console.log('➕ Creating new admin user...');
      
      // Create new admin using transaction
      const result = await prisma.$transaction(async (tx) => {
        // Insert new admin
        const newAdmin = await tx.users.create({
          data: {
            email: adminData.email,
            hash_password: hashedPassword,
            full_name: adminData.full_name,
            grade: null,
            role: adminData.role,
            avatar_url: '/images/admin-avatar.png'
          },
          select: {
            id: true,
            email: true,
            full_name: true,
            role: true,
            created_at: true
          }
        });
        
        // Create token record for admin
        await tx.tokens.create({
          data: {
            user_id: newAdmin.id,
            amount: 0
          }
        });
        
        return newAdmin;
      });
      
      console.log('✅ Admin user created successfully!');
      console.log('🆔 ID:', result.id);
      console.log('📧 Email:', result.email);
      console.log('👤 Name:', result.full_name);
      console.log('🔑 Role:', result.role);
      console.log('📅 Created:', result.created_at);
    }
    
    console.log('\n🎉 Admin setup completed!');
    console.log('🔐 Login credentials:');
    console.log('   Email: admin@kelasinaja.id');
    console.log('   Password: adminjenius');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  createAdminUser().catch(console.error);
}

export { createAdminUser };