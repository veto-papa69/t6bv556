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

async function fixProductionDatabase() {
  try {
    console.log('🔄 Fixing production database...');
    
    // Test connection
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connection successful');

    // Create tables if they don't exist
    console.log('🔄 Creating tables...');
    
    // Check if users table exists and has correct schema
    try {
      await db.execute(sql`SELECT uid FROM users LIMIT 1`);
      console.log('✅ Users table has correct schema');
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('🔄 Creating users table with correct schema...');
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS "users" (
            "id" serial PRIMARY KEY NOT NULL,
            "uid" varchar(20) NOT NULL,
            "instagram_username" text NOT NULL,
            "password" text NOT NULL,
            "wallet_balance" numeric(10, 2) DEFAULT '0' NOT NULL,
            "bonus_claimed" boolean DEFAULT false NOT NULL,
            "created_at" timestamp DEFAULT now() NOT NULL
          )
        `);
      } else if (error.message.includes('column "uid" does not exist')) {
        console.log('🔄 Adding missing uid column to users table...');
        await db.execute(sql`ALTER TABLE "users" ADD COLUMN "uid" varchar(20)`);
        console.log('🔄 Updating existing users with UIDs...');
        await db.execute(sql`
          UPDATE "users" 
          SET "uid" = 'UID' || UPPER(SUBSTRING(MD5(RANDOM()::text), 1, 9))
          WHERE "uid" IS NULL
        `);
        await db.execute(sql`ALTER TABLE "users" ALTER COLUMN "uid" SET NOT NULL`);
      }
    }
    console.log('✅ Users table ready');

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" serial PRIMARY KEY NOT NULL,
        "order_id" varchar(50) NOT NULL,
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

    // Add constraints safely
    console.log('🔄 Adding constraints...');
    
    try {
      await db.execute(sql`ALTER TABLE "users" ADD CONSTRAINT "users_uid_unique" UNIQUE("uid")`);
      console.log('✅ Added users UID constraint');
    } catch (e) {
      console.log('⚠️ Users UID constraint already exists');
    }

    try {
      await db.execute(sql`ALTER TABLE "orders" ADD CONSTRAINT "orders_order_id_unique" UNIQUE("order_id")`);
      console.log('✅ Added orders order_id constraint');
    } catch (e) {
      console.log('⚠️ Orders order_id constraint already exists');
    }

    // Add foreign keys safely
    console.log('🔄 Adding foreign keys...');
    
    try {
      await db.execute(sql`ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id")`);
      console.log('✅ Added orders foreign key');
    } catch (e) {
      console.log('⚠️ Orders foreign key already exists');
    }

    try {
      await db.execute(sql`ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id")`);
      console.log('✅ Added payments foreign key');
    } catch (e) {
      console.log('⚠️ Payments foreign key already exists');
    }

    try {
      await db.execute(sql`ALTER TABLE "login_logs" ADD CONSTRAINT "login_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id")`);
      console.log('✅ Added login_logs foreign key');
    } catch (e) {
      console.log('⚠️ Login_logs foreign key already exists');
    }

    // Initialize services
    console.log('🔄 Checking services...');
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
      console.log('✅ Services already exist');
    }

    console.log('🎉 Production database fixed successfully');
    
  } catch (error) {
    console.error('❌ Failed to fix production database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixProductionDatabase();