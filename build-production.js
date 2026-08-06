import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

async function buildForProduction() {
  try {
    console.log('🔨 Building frontend...');
    await execAsync('npm run build');
    
    console.log('📦 Creating production structure...');
    
    // Ensure the public directory exists in the server folder
    const publicDir = path.join(process.cwd(), 'server', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Copy dist files to server/public
    const distDir = path.join(process.cwd(), 'dist', 'public');
    if (fs.existsSync(distDir)) {
      await execAsync(`cp -r ${distDir}/* ${publicDir}/`);
      console.log('✅ Static files copied to server/public');
    }
    
    console.log('🎉 Production build completed');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildForProduction();