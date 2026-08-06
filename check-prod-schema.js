#!/usr/bin/env node
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const db = drizzle({ client: pool });

async function checkProductionSchema() {
  try {
    console.log('🔍 Checking production database schema...');
    
    // Test connection
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connection successful');

    // Check tables exist
    const tables = ['users', 'orders', 'payments', 'services', 'login_logs'];
    
    for (const table of tables) {
      try {
        const result = await db.execute(sql`SELECT COUNT(*) FROM ${sql.identifier(table)}`);
        console.log(`✅ Table ${table}: ${result.rows[0].count} records`);
      } catch (error) {
        console.error(`❌ Table ${table} missing or inaccessible:`, error.message);
      }
    }

    // Check constraints
    const constraints = await db.execute(sql`
      SELECT constraint_name, table_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_schema = 'public'
      ORDER BY table_name, constraint_type
    `);
    
    console.log('\n📋 Database constraints:');
    constraints.rows.forEach(row => {
      console.log(`  ${row.table_name}: ${row.constraint_name} (${row.constraint_type})`);
    });

    // Test basic operations
    console.log('\n🧪 Testing basic operations...');
    
    // Test user creation
    try {
      const testUser = await db.execute(sql`
        INSERT INTO users (uid, instagram_username, password, wallet_balance, bonus_claimed) 
        VALUES ('TEST123', 'test_user', 'test_pass', 0, false) 
        ON CONFLICT (uid) DO NOTHING
        RETURNING id
      `);
      console.log('✅ User creation test passed');
    } catch (error) {
      console.log('⚠️ User creation test failed:', error.message);
    }

    // Test service query
    try {
      const services = await db.execute(sql`SELECT COUNT(*) FROM services WHERE active = true`);
      console.log(`✅ Services query test passed: ${services.rows[0].count} active services`);
    } catch (error) {
      console.log('⚠️ Services query test failed:', error.message);
    }

    console.log('\n🎉 Database schema check completed');
    
  } catch (error) {
    console.error('❌ Schema check failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkProductionSchema();