const bcrypt = require('bcrypt');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://kelasinaja:12345678@localhost:5432/kelasinaja'
});

async function createAdminUser() {
  const client = await pool.connect();
  
  try {
    console.log('🔐 Creating admin user...');
    
    // Admin data
    const adminData = {
      email: '',
      password: '',
      full_name: 'Super Administrator',
      role: 'admin'
    };
    
    // Hash password
    console.log('🔒 Hashing password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
    
    // Check if admin already exists
    const existingAdmin = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      [adminData.email]
    );
    
    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  Admin user already exists. Updating password...');
      
      // Update existing admin
      const updateResult = await client.query(`
        UPDATE users 
        SET hash_password = $1, 
            full_name = $2, 
            role = $3,
            updated_at = now()
        WHERE email = $4
        RETURNING id, email, full_name, role
      `, [hashedPassword, adminData.full_name, adminData.role, adminData.email]);
      
      console.log('✅ Admin user updated successfully!');
      console.log('📧 Email:', updateResult.rows[0].email);
      console.log('👤 Name:', updateResult.rows[0].full_name);
      console.log('🔑 Role:', updateResult.rows[0].role);
      
    } else {
      console.log('➕ Creating new admin user...');
      
      // Insert new admin
      const insertResult = await client.query(`
        INSERT INTO users (email, hash_password, full_name, grade, role, avatar_url)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, full_name, role, created_at
      `, [
        adminData.email, 
        hashedPassword, 
        adminData.full_name, 
        null, 
        adminData.role,
        '/images/admin-avatar.png'
      ]);
      
      const newAdmin = insertResult.rows[0];
      
      // Create token record for admin
      await client.query(`
        INSERT INTO tokens (user_id, amount)
        VALUES ($1, $2)
        ON CONFLICT (user_id) DO NOTHING
      `, [newAdmin.id, 0]);
      
      console.log('✅ Admin user created successfully!');
      console.log('🆔 ID:', newAdmin.id);
      console.log('📧 Email:', newAdmin.email);
      console.log('👤 Name:', newAdmin.full_name);
      console.log('🔑 Role:', newAdmin.role);
      console.log('📅 Created:', newAdmin.created_at);
    }
    
    console.log('\n🎉 Admin setup completed!');
    console.log('🔐 Login credentials:');
    console.log('   Email: admin@kelasinaja.id');
    console.log('   Password: adminjenius');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  createAdminUser().catch(console.error);
}

module.exports = { createAdminUser };