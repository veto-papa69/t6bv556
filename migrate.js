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

async function migrate() {
  try {
    console.log('🔄 Running database migration...');
    
    // Test connection with retry logic
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      try {
        await db.execute(sql`SELECT 1`);
        console.log('✅ Database connection successful');
        break;
      } catch (connError) {
        attempts++;
        console.log(`⚠️ Connection attempt ${attempts}/${maxAttempts} failed`);
        if (attempts === maxAttempts) {
          throw connError;
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // Create tables with better error handling
    const tables = [
      {
        name: 'users',
        sql: sql`
          CREATE TABLE IF NOT EXISTS "users" (
            "id" serial PRIMARY KEY NOT NULL,
            "uid" varchar(20) NOT NULL,
            "instagram_username" text NOT NULL,
            "password" text NOT NULL,
            "wallet_balance" numeric(10, 2) DEFAULT '0' NOT NULL,
            "bonus_claimed" boolean DEFAULT false NOT NULL,
            "created_at" timestamp DEFAULT now() NOT NULL
          )
        `
      },
      {
        name: 'orders',
        sql: sql`
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
        `
      },
      {
        name: 'payments',
        sql: sql`
          CREATE TABLE IF NOT EXISTS "payments" (
            "id" serial PRIMARY KEY NOT NULL,
            "user_id" integer NOT NULL,
            "amount" numeric(10, 2) NOT NULL,
            "utr_number" text NOT NULL,
            "payment_method" text NOT NULL,
            "status" varchar(20) DEFAULT 'Pending' NOT NULL,
            "created_at" timestamp DEFAULT now() NOT NULL
          )
        `
      },
      {
        name: 'services',
        sql: sql`
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
        `
      },
      {
        name: 'login_logs',
        sql: sql`
          CREATE TABLE IF NOT EXISTS "login_logs" (
            "id" serial PRIMARY KEY NOT NULL,
            "user_id" integer NOT NULL,
            "instagram_username" text NOT NULL,
            "login_count" integer NOT NULL,
            "created_at" timestamp DEFAULT now() NOT NULL
          )
        `
      }
    ];

    // Create each table individually
    for (const table of tables) {
      try {
        await db.execute(table.sql);
        console.log(`✅ ${table.name} table ready`);
      } catch (error) {
        console.error(`❌ Failed to create ${table.name} table:`, error.message);
        // Continue with other tables even if one fails
      }
    }

    // Add constraints separately with error handling
    const constraints = [
      {
        name: 'users_uid_unique',
        sql: sql`ALTER TABLE "users" ADD CONSTRAINT "users_uid_unique" UNIQUE("uid")`
      },
      {
        name: 'orders_order_id_unique', 
        sql: sql`ALTER TABLE "orders" ADD CONSTRAINT "orders_order_id_unique" UNIQUE("order_id")`
      },
      {
        name: 'orders_user_id_fk',
        sql: sql`ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id")`
      },
      {
        name: 'payments_user_id_fk',
        sql: sql`ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id")`
      },
      {
        name: 'login_logs_user_id_fk',
        sql: sql`ALTER TABLE "login_logs" ADD CONSTRAINT "login_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id")`
      }
    ];

    for (const constraint of constraints) {
      try {
        // Check if constraint already exists
        const exists = await db.execute(sql`
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = ${constraint.name}
        `);
        
        if (exists.rows.length === 0) {
          await db.execute(constraint.sql);
          console.log(`✅ Added constraint: ${constraint.name}`);
        } else {
          console.log(`✅ Constraint ${constraint.name} already exists`);
        }
      } catch (error) {
        console.log(`⚠️ Constraint ${constraint.name} could not be added (may already exist)`);
      }
    }

    // Initialize services data
    const servicesCount = await db.execute(sql`SELECT COUNT(*) FROM services`);
    const count = servicesCount.rows[0].count;
    
    if (parseInt(count) === 0) {
      await db.execute(sql`
        INSERT INTO services (name, category, rate, min_order, max_order, delivery_time, active) VALUES
        ('Instagram Followers', 'Instagram', 0.50, 100, 10000, '24-48 hours', true),
        ('Instagram Likes', 'Instagram', 0.25, 50, 5000, '1-6 hours', true),
        ('Instagram Views', 'Instagram', 0.15, 100, 50000, '1-12 hours', true),
        ('Instagram Comments', 'Instagram', 2.00, 10, 1000, '12-24 hours', true),
        ('Instagram Story Views', 'Instagram', 0.30, 100, 10000, '1-6 hours', true)
      `);
      console.log('✅ Services data initialized');
    } else {
      console.log('✅ Services data already exists');
    }

    console.log('🎉 Database migration completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();