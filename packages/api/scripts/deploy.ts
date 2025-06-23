import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';
import archiver from 'archiver';
import { build } from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const SHARED_DIR = path.join(ROOT_DIR, '..', 'shared');

class LambdaDeployer {
  private async exec(command: string, cwd: string = ROOT_DIR): Promise<string> {
    console.log(`📍 Running: ${command}`);
    return execSync(command, { 
      cwd, 
      encoding: 'utf8',
      stdio: ['inherit', 'pipe', 'inherit']
    }).toString();
  }

  private async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  private async cleanDirectory(dir: string): Promise<void> {
    if (await this.exists(dir)) {
      await fs.rm(dir, { recursive: true, force: true });
    }
    await fs.mkdir(dir, { recursive: true });
  }

  private async createZipArchive(sourceDir: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = createWriteStream(outputPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', resolve);
      archive.on('error', reject);

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  async checkPrerequisites(): Promise<void> {
    console.log('🔍 Checking prerequisites...');
    
    // Check Terraform
    try {
      await this.exec('terraform version');
    } catch {
      throw new Error('❌ Terraform is not installed. Please install it from https://www.terraform.io/downloads');
    }

    // Check AWS credentials
    try {
      await this.exec('aws sts get-caller-identity');
    } catch {
      throw new Error('❌ AWS credentials not configured. Run "aws configure" first.');
    }
  }

  async buildProject(): Promise<void> {
    console.log('🔨 Building project...');
    await this.exec('pnpm install');
    
    // Build shared package first
    console.log('  🔨 Building shared package...');
    await this.exec('pnpm build', SHARED_DIR);
  }

  async bundleWithEsbuild(): Promise<void> {
    console.log('📦 Bundling with esbuild...');
    
    const deployDir = path.join(ROOT_DIR, 'lambda-deploy');
    await this.cleanDirectory(deployDir);

    // Define external dependencies that can't be bundled
    const externalDependencies = [
      '@aws-sdk/*',
      '@aws-sdk/client-dynamodb',
      '@aws-sdk/lib-dynamodb',
      'aws-lambda',
      'electrodb'
    ];

    // Bundle the Lambda handler
    console.log('  📦 Bundling aws-lambda.ts...');
    await build({
      entryPoints: [path.join(ROOT_DIR, 'src', 'aws-lambda.ts')],
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'esm',
      outfile: path.join(deployDir, 'aws-lambda.js'),
      external: externalDependencies,
      minify: true,
      sourcemap: true,
      metafile: true,
      logLevel: 'info',
    });

    // Bundle the cleanup handler
    console.log('  📦 Bundling cleanup.ts...');
    await build({
      entryPoints: [path.join(ROOT_DIR, 'src', 'cleanup.ts')],
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'esm',
      outfile: path.join(deployDir, 'cleanup.js'),
      external: externalDependencies,
      minify: true,
      sourcemap: true,
      logLevel: 'info',
    });

    // Create minimal package.json for Lambda
    console.log('  📄 Creating package.json...');
    const packageJson = {
      name: '@split-fool/api',
      type: 'module',
      dependencies: {
        '@aws-sdk/client-dynamodb': '3.830.0',
        '@aws-sdk/lib-dynamodb': '3.830.0',
        'electrodb': '3.4.3'
      }
    };
    
    await fs.writeFile(
      path.join(deployDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Install only the external dependencies
    console.log('  📦 Installing external dependencies...');
    await this.exec('npm install --production', deployDir);

    // Create zip file
    console.log('  🗜️  Creating zip archive...');
    const zipPath = path.join(ROOT_DIR, 'dist.zip');
    await this.createZipArchive(deployDir, zipPath);

    // Get zip size
    const stats = await fs.stat(zipPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`  ✅ Created dist.zip (${sizeMB} MB)`);

    // Clean up
    await fs.rm(deployDir, { recursive: true, force: true });
  }

  async deployWithTerraform(): Promise<void> {
    console.log('🚀 Deploying with Terraform...');
    
    // Initialize Terraform
    console.log('  🔧 Initializing Terraform...');
    await this.exec('terraform init');

    // Plan deployment
    console.log('  📋 Planning deployment...');
    await this.exec('terraform plan -out=tfplan');

    // Apply deployment
    console.log('  🚀 Applying changes...');
    await this.exec('terraform apply tfplan');

    // Get outputs
    console.log('\n✅ Deployment complete!');
    console.log('================================');
    const outputs = await this.exec('terraform output -json');
    const parsed = JSON.parse(outputs);
    
    for (const [key, value] of Object.entries(parsed)) {
      console.log(`${key}: ${(value as any).value}`);
    }

    // Clean up plan file
    await fs.unlink(path.join(ROOT_DIR, 'tfplan')).catch(() => {});
  }

  async deploy(): Promise<void> {
    try {
      console.log('🚀 SplitFool Deployment');
      console.log('=================================\n');

      await this.checkPrerequisites();
      await this.buildProject();
      await this.bundleWithEsbuild();
      await this.deployWithTerraform();

      console.log('\n📝 Next steps:');
      console.log('1. Copy the function_url above');
      console.log('2. Add it to Cloudflare Pages as VITE_API_URL environment variable');
      
    } catch (error) {
      console.error('\n❌ Deployment failed:', error);
      process.exit(1);
    }
  }
}

// Run deployment
const deployer = new LambdaDeployer();
await deployer.deploy();