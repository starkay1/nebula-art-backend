#!/usr/bin/env node

/**
 * Nebula Art Backend - 最终自动部署脚本
 * 使用真实的GitHub仓库URL创建Web Service
 */

const https = require('https');

const CONFIG = {
  renderApiKey: 'rnd_sWJ2OcPiqaTXY3Ao1O1Z5owaBRrf',
  githubRepo: 'https://github.com/starkay1/nebula-art-backend',
  serviceName: 'nebulaart-api',
  region: 'singapore',
  databaseUrl: 'postgresql://nebula_art_db_user:dskTlnEcQ33phVA5hSqetmWPSdVaTbbP@dpg-d35m0r6mcj7s73a1fbk0-a.singapore-postgres.render.com:5432/nebula_art_db',
  envVars: {
    NODE_ENV: 'production',
    PORT: '3000',
    JWT_SECRET: 'nebula-art-super-secret-jwt-key-2024-production'
  }
};

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function getUserInfo() {
  const options = {
    hostname: 'api.render.com',
    port: 443,
    path: '/v1/owners',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${CONFIG.renderApiKey}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options);
    if (response.status === 200 && response.data.length > 0) {
      return response.data[0].owner.id;
    }
    return null;
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error.message);
    return null;
  }
}

async function createWebService(ownerId) {
  console.log('🚀 创建 Render Web Service...');
  
  const options = {
    hostname: 'api.render.com',
    port: 443,
    path: '/v1/services',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.renderApiKey}`,
      'Content-Type': 'application/json'
    }
  };

  // 添加数据库URL到环境变量
  CONFIG.envVars.DATABASE_URL = CONFIG.databaseUrl;

  const serviceData = {
    type: 'web_service',
    name: CONFIG.serviceName,
    ownerId: ownerId,
    repo: CONFIG.githubRepo,
    branch: 'main',
    region: CONFIG.region,
    serviceDetails: {
      runtime: 'node',
      buildCommand: 'npm ci && npm run build',
      startCommand: 'npm run start:prod',
      envVars: Object.entries(CONFIG.envVars).map(([key, value]) => ({
        key,
        value
      })),
      envSpecificDetails: {
        nodeVersion: '18'
      }
    }
  };

  try {
    const response = await makeRequest(options, serviceData);
    
    if (response.status === 201) {
      console.log('✅ Web Service 创建成功!');
      console.log(`📍 Service ID: ${response.data.id}`);
      console.log(`🌐 URL: ${response.data.serviceDetails.url}`);
      return response.data;
    } else {
      console.error('❌ 创建失败:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ 请求错误:', error.message);
    return null;
  }
}

async function main() {
  console.log('🎨 Nebula Art Backend 最终部署\n');

  try {
    // 1. 获取用户信息
    console.log('👤 获取用户信息...');
    const ownerId = await getUserInfo();
    if (!ownerId) {
      console.error('❌ 无法获取用户信息');
      process.exit(1);
    }
    console.log(`✅ 用户ID: ${ownerId}`);

    // 2. 创建 Web Service
    const service = await createWebService(ownerId);
    if (!service) {
      console.error('❌ Web Service 创建失败');
      process.exit(1);
    }

    // 3. 输出成功信息
    console.log('\n🎉 自动部署完成!');
    console.log('========================================');
    console.log(`🌐 API URL: ${service.serviceDetails.url}`);
    console.log(`📊 状态监控: https://dashboard.render.com/web/${service.id}`);
    console.log(`📱 GitHub 仓库: ${CONFIG.githubRepo}`);
    console.log(`🗄️ 数据库: nebula-art-db (已连接)`);
    console.log('\n📝 下一步:');
    console.log('1. 等待部署完成（约 3-5 分钟）');
    console.log(`2. 测试健康检查: ${service.serviceDetails.url}/health`);
    console.log('3. 在前端代码中更新 API 基础 URL');
    console.log('\n🔗 完整的部署信息:');
    console.log(`   前端: https://nebulaart.pages.dev`);
    console.log(`   后端: ${service.serviceDetails.url}`);
    console.log(`   数据库: PostgreSQL (Render)`);

  } catch (error) {
    console.error('❌ 部署过程中出现错误:', error.message);
    process.exit(1);
  }
}

main();
