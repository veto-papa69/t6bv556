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

async function emergencyDatabaseFix() {
  try {
    console.log('🚨 Emergency database schema fix...');
    
    // Test connection
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connection successful');

    // Check and fix users table schema
    console.log('🔍 Checking users table schema...');
    
    // First, check if table exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('🔄 Creating users table from scratch...');
      await db.execute(sql`
        CREATE TABLE "users" (
          "id" serial PRIMARY KEY NOT NULL,
          "uid" varchar(20) NOT NULL UNIQUE,
          "instagram_username" text NOT NULL UNIQUE,
          "password" text NOT NULL,
          "wallet_balance" numeric(10, 2) DEFAULT '0' NOT NULL,
          "bonus_claimed" boolean DEFAULT false NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL
        )
      `);
      console.log('✅ Users table created successfully');
    } else {
      console.log('✅ Users table exists, checking columns...');
      
      // Check if uid column exists
      const uidColumnExists = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'users' 
          AND column_name = 'uid'
        )
      `);
      
      if (!uidColumnExists.rows[0].exists) {
        console.log('🔄 Adding missing uid column...');
        await db.execute(sql`ALTER TABLE "users" ADD COLUMN "uid" varchar(20)`);
        
        // Generate UIDs for existing users
        console.log('🔄 Generating UIDs for existing users...');
        await db.execute(sql`
          UPDATE "users" 
          SET "uid" = 'UID' || UPPER(SUBSTRING(MD5(RANDOM()::text), 1, 9))
          WHERE "uid" IS NULL OR "uid" = ''
        `);
        
        // Make uid NOT NULL and UNIQUE
        await db.execute(sql`ALTER TABLE "users" ALTER COLUMN "uid" SET NOT NULL`);
        
        try {
          await db.execute(sql`ALTER TABLE "users" ADD CONSTRAINT "users_uid_unique" UNIQUE("uid")`);
        } catch (e) {
          console.log('⚠️ UID unique constraint already exists or could not be added');
        }
        
        console.log('✅ UID column added and configured');
      } else {
        console.log('✅ UID column already exists');
      }
      
      // Check other required columns
      const requiredColumns = [
        { name: 'instagram_username', type: 'text' },
        { name: 'password', type: 'text' },
        { name: 'wallet_balance', type: 'numeric' },
        { name: 'bonus_claimed', type: 'boolean' },
        { name: 'created_at', type: 'timestamp' }
      ];
      
      for (const column of requiredColumns) {
        const columnExists = await db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'users' 
            AND column_name = ${column.name}
          )
        `);
        
        if (!columnExists.rows[0].exists) {
          console.log(`🔄 Adding missing column: ${column.name}`);
          let defaultValue = '';
          
          switch (column.name) {
            case 'wallet_balance':
              defaultValue = ' DEFAULT 0';
              break;
            case 'bonus_claimed':
              defaultValue = ' DEFAULT false';
              break;
            case 'created_at':
              defaultValue = ' DEFAULT now()';
              break;
          }
          
          await db.execute(sql`ALTER TABLE "users" ADD COLUMN ${sql.identifier(column.name)} ${sql.raw(column.type + defaultValue)}`);
          console.log(`✅ Added column: ${column.name}`);
        }
      }
    }

    // Create other required tables
    console.log('🔄 Ensuring other tables exist...');
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" serial PRIMARY KEY NOT NULL,
        "order_id" varchar(50) NOT NULL UNIQUE,
        "user_id" integer NOT NULL,
        "service_name" text NOT NULL,
        "instagram_username" text NOT NULL,
        "quantity" integer NOT NULL,
        "price" numeric(10, 2) NOT NULL,
        "status" varchar(20) DEFAULT 'Processing' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `);
    console.log('✅ Orders table ready');

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL,
        "amount" numeric(10, 2) NOT NULL,
        "utr_number" text NOT NULL,
        "payment_method" text NOT NULL,
        "status" varchar(20) DEFAULT 'Pending' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `);
    console.log('✅ Payments table ready');

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "services" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "category" text NOT NULL,
        "rate" numeric(10, 2) NOT NULL,
        "min_order" integer NOT NULL,
        "max_order" integer NOT NULL,
        "delivery_time" text NOT NULL,
        "active" boolean DEFAULT true NOT NULL
      )
    `);
    console.log('✅ Services table ready');

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "login_logs" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL,
        "instagram_username" text NOT NULL,
        "login_count" integer NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `);
    console.log('✅ Login logs table ready');

    // Add foreign key constraints safely
    console.log('🔄 Adding foreign key constraints...');
    
    const foreignKeys = [
      {
        table: 'orders',
        constraint: 'orders_user_id_users_id_fk',
        sql: sql`ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id")`
      },
      {
        table: 'payments',
        constraint: 'payments_user_id_users_id_fk',
        sql: sql`ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id")`
      },
      {
        table: 'login_logs',
        constraint: 'login_logs_user_id_users_id_fk',
        sql: sql`ALTER TABLE "login_logs" ADD CONSTRAINT "login_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id")`
      }
    ];

    for (const fk of foreignKeys) {
      try {
        // Check if constraint exists
        const constraintExists = await db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.table_constraints 
            WHERE table_schema = 'public' 
            AND constraint_name = ${fk.constraint}
          )
        `);
        
        if (!constraintExists.rows[0].exists) {
          await db.execute(fk.sql);
          console.log(`✅ Added foreign key: ${fk.constraint}`);
        } else {
          console.log(`✅ Foreign key already exists: ${fk.constraint}`);
        }
      } catch (error) {
        console.log(`⚠️ Could not add foreign key ${fk.constraint}: ${error.message}`);
      }
    }

    // Initialize services if empty
    console.log('🔄 Checking services data...');
    const servicesCount = await db.execute(sql`SELECT COUNT(*) FROM services`);
    const count = parseInt(servicesCount.rows[0].count);
    
    if (count === 0) {
      console.log('🔄 Adding default services...');
      await db.execute(sql`
        INSERT INTO services (name, category, rate, min_order, max_order, delivery_time, active) VALUES
        ('Instagram Followers - Indian', 'Followers', 4.00, 100, 100000, '0-2 hours', true),
        ('Instagram Followers - USA', 'Followers', 5.00, 100, 50000, '0-4 hours', true),
        ('Instagram Followers - Global', 'Followers', 3.50, 100, 200000, '0-6 hours', true),
        ('Instagram Likes - Indian', 'Likes', 2.00, 50, 50000, '0-1 hour', true),
        ('Instagram Likes - Global', 'Likes', 1.50, 50, 100000, '0-2 hours', true),
        ('Instagram Video Views', 'Views', 1.00, 100, 1000000, '0-30 minutes', true),
        ('Instagram Story Views', 'Views', 2.50, 100, 50000, '0-1 hour', true),
        ('Instagram Comments - Random', 'Comments', 8.00, 10, 1000, '1-6 hours', true),
        ('Instagram Comments - Custom', 'Comments', 12.00, 10, 500, '2-12 hours', true)
      `);
      console.log('✅ Default services added');
    } else {
      console.log(`✅ Services already exist (${count} services)`);
    }

    // Verify the fix worked
    console.log('🔍 Verifying database schema...');
    await db.execute(sql`SELECT id, uid, instagram_username FROM users LIMIT 1`);
    console.log('✅ Schema verification successful');

    console.log('🎉 Emergency database fix completed successfully!');
    console.log('✅ All tables and columns are now properly configured');
    console.log('✅ Your application should now work correctly on Render');
    
  } catch (error) {
    console.error('❌ Emergency fix failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

emergencyDatabaseFix();