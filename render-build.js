import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function buildForRender() {
  try {
    console.log('🔄 Building application for Render deployment...');
    
    // Run the build command
    console.log('📦 Running vite build...');
    execSync('vite build', { stdio: 'inherit' });
    
    // Check if dist directory exists
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      console.log('✅ Build directory created successfully');
      
      // Create public directory if it doesn't exist
      const publicPath = path.resolve(process.cwd(), 'server', 'public');
      if (!fs.existsSync(path.dirname(publicPath))) {
        fs.mkdirSync(path.dirname(publicPath), { recursive: true });
      }
      
      // Copy dist contents to server/public for proper serving
      console.log('📁 Copying build files to server/public...');
      execSync(`cp -r ${distPath}/* ${publicPath}/`, { stdio: 'inherit' });
      console.log('✅ Build files copied successfully');
    }
    
    console.log('🎉 Render build completed successfully!');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildForRender();