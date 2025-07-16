const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://kelasinaja:12345678@localhost:5432/kelasinaja'
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database migrations...');
    
    // Migration files in order
    const migrationFiles = [
      '001_create_extensions.sql',
      '002_create_base_tables.sql',
      '003_create_relationship_tables.sql',
      '004_create_foreign_keys.sql',
      '005_create_indexes.sql'
    ];
    
    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, '..', 'migrations', file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Migration file not found: ${file}, skipping...`);
        continue;
      }
      
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`📝 Running migration: ${file}`);
      
      try {
        await client.query(sql);
        console.log(`✅ Completed: ${file}`);
      } catch (error) {
        // Skip if constraint already exists or table already exists
        if (error.code === '42710' || // constraint already exists
            error.code === '42P07' || // table already exists
            error.code === '42P06') {  // schema already exists
          console.log(`⚠️  Skipped ${file}: Already exists`);
          continue;
        }
        throw error;
      }
    }
    
    console.log('🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function runSeeds() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting database seeding...');
    
    // Seed files
    const seedFiles = [
      'subjects.sql',
      'sample_users.sql'
    ];
    
    for (const file of seedFiles) {
      const filePath = path.join(__dirname, '..', 'seeds', file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Seed file not found: ${file}, skipping...`);
        continue;
      }
      
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`📝 Running seed: ${file}`);
      
      try {
        await client.query(sql);
        console.log(`✅ Completed: ${file}`);
      } catch (error) {
        // Skip if data already exists (unique constraint violation)
        if (error.code === '23505') {
          console.log(`⚠️  Skipped ${file}: Data already exists`);
          continue;
        }
        throw error;
      }
    }
    
    console.log('🎉 All seeds completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Function to check database connection
async function checkConnection() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT NOW()');
    console.log(`🔗 Database connected successfully at ${result.rows[0].now}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  } finally {
    client.release();
  }
}

// Main function
async function main() {
  try {
    console.log('🏁 Starting database setup...\n');
    
    // Check connection first
    const isConnected = await checkConnection();
    if (!isConnected) {
      process.exit(1);
    }
    
    await runMigrations();
    await runSeeds();
    console.log('\n🏆 Database setup completed successfully!');
  } catch (error) {
    console.error('\n💥 Setup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runMigrations, runSeeds, checkConnection };