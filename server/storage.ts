import { 
  users, 
  orders, 
  payments, 
  services,
  loginLogs,
  type User, 
  type InsertUser,
  type Order,
  type InsertOrder,
  type Payment,
  type InsertPayment,
  type Service,
  type InsertService,
  type LoginLog,
  type InsertLoginLog
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // Database initialization
  initializeDatabase(): Promise<void>;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByInstagramUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUserBalance(userId: number, newBalance: number): Promise<void>;
  markBonusClaimed(userId: number): Promise<void>;
  
  // Order operations
  createOrder(insertOrder: InsertOrder): Promise<Order>;
  getUserOrders(userId: number): Promise<Order[]>;
  
  // Payment operations
  createPayment(insertPayment: InsertPayment): Promise<Payment>;
  getUserPayments(userId: number): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  updatePaymentStatus(id: number, status: string): Promise<void>;
  
  // Service operations
  getServices(): Promise<Service[]>;
  initializeServices(): Promise<void>;
  
  // Login tracking operations
  logUserLogin(userId: number, instagramUsername: string): Promise<number>;
  getUserLoginCount(userId: number): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async initializeDatabase(): Promise<void> {
    try {
      console.log('🔄 Initializing database tables...');
      
      // Test database connection first with retry logic
      let connectionAttempts = 0;
      const maxAttempts = 5;
      
      while (connectionAttempts < maxAttempts) {
        try {
          await db.execute(sql`SELECT 1`);
          console.log('✅ Database connection successful');
          break;
        } catch (connError) {
          connectionAttempts++;
          console.log(`⚠️ Connection attempt ${connectionAttempts}/${maxAttempts} failed`);
          if (connectionAttempts === maxAttempts) {
            console.log('❌ Could not establish database connection, but continuing...');
            return; // Don't crash the server
          }
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      // Check if tables already exist to avoid permission errors
      try {
        await db.execute(sql`SELECT 1 FROM users LIMIT 1`);
        console.log('✅ Tables already exist, skipping creation');
        console.log('✅ Database initialization completed');
        return;
      } catch (tableError) {
        console.log('🔄 Tables do not exist, attempting to create...');
      }

      // Create tables with simplified approach for production
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

      // Create each table individually with error handling
      for (const table of tables) {
        try {
          await db.execute(table.sql);
          console.log(`✅ ${table.name} table ready`);
        } catch (error) {
          console.log(`⚠️ ${table.name} table creation skipped (may already exist)`);
        }
      }

      // Add constraints separately (optional - don't fail if they can't be added)
      const constraints = [
        {
          name: 'users_uid_unique',
          sql: sql`ALTER TABLE "users" ADD CONSTRAINT "users_uid_unique" UNIQUE("uid")`
        },
        {
          name: 'orders_order_id_unique', 
          sql: sql`ALTER TABLE "orders" ADD CONSTRAINT "orders_order_id_unique" UNIQUE("order_id")`
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

      // Add foreign keys (optional)
      const foreignKeys = [
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

      for (const fk of foreignKeys) {
        try {
          // Check if constraint already exists
          const exists = await db.execute(sql`
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = ${fk.name}
          `);
          
          if (exists.rows.length === 0) {
            await db.execute(fk.sql);
            console.log(`✅ Added foreign key: ${fk.name}`);
          } else {
            console.log(`✅ Foreign key ${fk.name} already exists`);
          }
        } catch (error) {
          console.log(`⚠️ Foreign key ${fk.name} could not be added (may already exist)`);
        }
      }

      console.log('🎉 Database initialization completed successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      console.log('⚠️ Continuing without database initialization - manual setup may be required');
      // Don't throw - let the server start anyway
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.instagramUsername, username));
    return user || undefined;
  }

  async getUserByInstagramUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.instagramUsername, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserBalance(userId: number, newBalance: number): Promise<void> {
    await db
      .update(users)
      .set({ walletBalance: newBalance.toString() })
      .where(eq(users.id, userId));
  }

  async markBonusClaimed(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ bonusClaimed: true })
      .where(eq(users.id, userId));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    return order;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(orders.createdAt);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async getUserPayments(userId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(payments.createdAt);
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async updatePaymentStatus(id: number, status: string): Promise<void> {
    await db
      .update(payments)
      .set({ status })
      .where(eq(payments.id, id));
  }

  async getServices(): Promise<Service[]> {
    return await db
      .select()
      .from(services)
      .where(eq(services.active, true))
      .orderBy(services.category, services.name);
  }

  async initializeServices(): Promise<void> {
    try {
      // First check if services table exists
      try {
        const existingServices = await db.select().from(services).limit(1);
        if (existingServices.length > 0) {
          console.log('✅ Services already initialized, skipping...');
          return;
        }
      } catch (tableError) {
        console.log('⚠️ Services table may not exist yet, skipping service initialization');
        return;
      }

      console.log('🔄 Initializing default services...');
      
      // Initialize default services with better error handling
      const defaultServices: InsertService[] = [
        // Followers
        {
          name: "Instagram Followers - Indian",
          category: "Followers",
          rate: "4.00",
          minOrder: 100,
          maxOrder: 100000,
          deliveryTime: "0-2 hours",
          active: true,
        },
        {
          name: "Instagram Followers - USA",
          category: "Followers",
          rate: "5.00",
          minOrder: 100,
          maxOrder: 50000,
          deliveryTime: "0-4 hours",
          active: true,
        },
        {
          name: "Instagram Followers - Global",
          category: "Followers",
          rate: "3.50",
          minOrder: 100,
          maxOrder: 200000,
          deliveryTime: "0-6 hours",
          active: true,
        },
        // Likes
        {
          name: "Instagram Likes - Indian",
          category: "Likes",
          rate: "2.00",
          minOrder: 50,
          maxOrder: 50000,
          deliveryTime: "0-1 hour",
          active: true,
        },
        {
          name: "Instagram Likes - Global",
          category: "Likes",
          rate: "1.50",
          minOrder: 50,
          maxOrder: 100000,
          deliveryTime: "0-2 hours",
          active: true,
        },
        // Views
        {
          name: "Instagram Video Views",
          category: "Views",
          rate: "1.00",
          minOrder: 100,
          maxOrder: 1000000,
          deliveryTime: "0-30 minutes",
          active: true,
        },
        {
          name: "Instagram Story Views",
          category: "Views",
          rate: "2.50",
          minOrder: 100,
          maxOrder: 50000,
          deliveryTime: "0-1 hour",
          active: true,
        },
        // Comments
        {
          name: "Instagram Comments - Random",
          category: "Comments",
          rate: "8.00",
          minOrder: 10,
          maxOrder: 1000,
          deliveryTime: "1-6 hours",
          active: true,
        },
        {
          name: "Instagram Comments - Custom",
          category: "Comments",
          rate: "12.00",
          minOrder: 10,
          maxOrder: 500,
          deliveryTime: "2-12 hours",
          active: true,
        },
      ];

      await db.insert(services).values(defaultServices);
      console.log('✅ Default services created successfully');
    } catch (error) {
      console.error('❌ Services initialization failed:', error);
      console.log('⚠️ Continuing without default services');
      // Don't throw error to prevent server crash
    }
  }

  async logUserLogin(userId: number, instagramUsername: string): Promise<number> {
    const currentCount = await this.getUserLoginCount(userId);
    const newCount = currentCount + 1;
    
    await db.insert(loginLogs).values({
      userId,
      instagramUsername,
      loginCount: newCount,
    });
    
    return newCount;
  }

  async getUserLoginCount(userId: number): Promise<number> {
    const logs = await db.select().from(loginLogs).where(eq(loginLogs.userId, userId));
    return logs.length;
  }
}

export const storage = new DatabaseStorage();