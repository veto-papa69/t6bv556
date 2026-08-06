import express from "express";
import cors from "cors";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { APP_CONFIG } from "./config.js";
import { registerRoutes } from "./routes.js";
import { MongoDBStorage } from "./mongodb-storage";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: APP_CONFIG.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize storage
const storage = new MongoDBStorage();

// Initialize database on startup
storage.initializeDatabase().then(() => {
  console.log('✅ Database initialized successfully');
}).catch(err => {
  console.error('❌ Database initialization failed:', err);
});

// Remove this duplicate function since we're importing registerRoutes from routes.js
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (APP_CONFIG.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '../dist');
  app.use(express.static(staticPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server with proper error handling
async function startServer(port: number) {
  try {
    // Initialize storage and routes before starting server
    await registerRoutes(app);

    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📱 Environment: ${APP_CONFIG.NODE_ENV}`);
      console.log(`🌐 Access at: http://0.0.0.0:${port}`);
      console.log(`✅ Server started successfully`);
    });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`❌ Port ${port} is already in use`);
      console.log('🔄 Trying to kill existing processes...');

      // Kill existing processes and retry
      setTimeout(() => {
        const alternativePorts = [5001, 5002, 3001, 3002, 8000, 8080, 4000];
        const nextPort = alternativePorts.find(p => p !== port) || 5001;

        console.log(`🔄 Trying port ${nextPort}...`);
        startServer(nextPort);
      }, 1000);
    } else {
      console.error('❌ Server error:', err);
      console.error('Stack trace:', err.stack);
      process.exit(1);
    }
  });

  return server;
} catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Add error handling for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
console.log('🔄 Starting server...');
startServer(APP_CONFIG.PORT);

export default app;
