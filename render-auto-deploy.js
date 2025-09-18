#!/usr/bin/env node

/**
 * Nebula Art Backend - Render.com 自动部署脚本
 * 使用 Render API 自动创建和部署服务
 */

const https = require('https');
const fs = require('fs');

// 配置信息
const CONFIG = {
  renderApiKey: process.env.RENDER_API_KEY || '',
  githubRepo: process.env.GITHUB_REPO || '',
  serviceName: 'nebulaart-api',
  region: 'singapore', // 或 'oregon', 'frankfurt'
  envVars: {
    NODE_ENV: 'production',
    PORT: '3000',
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here'
  }
};

/**
 * 发送 HTTP 请求到 Render API
 */
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

/**
 * 创建 Web Service
 */
async function createWebService() {
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

  const serviceData = {
    type: 'web_service',
    name: CONFIG.serviceName,
    repo: CONFIG.githubRepo,
    branch: 'main',
    region: CONFIG.region,
    buildCommand: 'npm ci && npm run build',
    startCommand: 'npm run start:prod',
    envVars: Object.entries(CONFIG.envVars).map(([key, value]) => ({
      key,
      value
    }))
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

/**
 * 获取用户信息
 */
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
    console.error('❌ 用户信息格式错误:', response.data);
    return null;
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error.message);
    return null;
  }
}

/**
 * 获取数据库连接字符串
 */
async function getDatabaseConnectionString(databaseId) {
  const options = {
    hostname: 'api.render.com',
    port: 443,
    path: `/v1/postgres/${databaseId}/connection-info`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${CONFIG.renderApiKey}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options);
    if (response.status === 200) {
      return response.data.externalConnectionString;
    }
    return null;
  } catch (error) {
    console.error('❌ 获取连接字符串失败:', error.message);
    return null;
  }
}

/**
 * 创建 PostgreSQL 数据库
 */
async function createDatabase(ownerId) {
  console.log('🗄️ 创建 PostgreSQL 数据库...');
  
  const options = {
    hostname: 'api.render.com',
    port: 443,
    path: '/v1/postgres',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.renderApiKey}`,
      'Content-Type': 'application/json'
    }
  };

  const dbData = {
    name: 'nebula-art-db',
    ownerId: ownerId,
    region: CONFIG.region,
    plan: 'free',
    version: '15'
  };

  try {
    const response = await makeRequest(options, dbData);
    
    if (response.status === 201) {
      console.log('✅ PostgreSQL 数据库创建成功!');
      console.log(`📍 Database ID: ${response.data.id}`);
      
      // 等待数据库准备就绪并获取连接字符串
      console.log('⏳ 等待数据库准备就绪...');
      await new Promise(resolve => setTimeout(resolve, 5000)); // 等待5秒
      
      const connectionString = await getDatabaseConnectionString(response.data.id);
      if (connectionString) {
        response.data.connectionString = connectionString;
        console.log(`🔗 Connection URL: ${connectionString}`);
      }
      
      return response.data;
    } else {
      console.error('❌ 数据库创建失败:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ 请求错误:', error.message);
    return null;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🎨 Nebula Art Backend 自动部署开始...\n');

  // 检查 API Key
  if (!CONFIG.renderApiKey) {
    console.error('❌ 请设置 RENDER_API_KEY 环境变量');
    console.log('💡 获取方式:');
    console.log('   1. 访问 https://dashboard.render.com/account/api-keys');
    console.log('   2. 创建新的 API Key');
    console.log('   3. 运行: export RENDER_API_KEY=your_api_key');
    process.exit(1);
  }

  try {
    // 1. 获取用户信息
    console.log('👤 获取用户信息...');
    const ownerId = await getUserInfo();
    if (!ownerId) {
      console.error('❌ 无法获取用户信息，停止部署');
      process.exit(1);
    }
    console.log(`✅ 用户ID: ${ownerId}`);

    // 2. 创建数据库
    const database = await createDatabase(ownerId);
    if (!database) {
      console.error('❌ 数据库创建失败，停止部署');
      process.exit(1);
    }

    // 3. 更新环境变量包含数据库连接
    CONFIG.envVars.DATABASE_URL = database.connectionString || 'postgresql://user:pass@localhost:5432/nebula_art';

    // 4. 创建 Web Service
    const service = await createWebService();
    if (!service) {
      console.error('❌ Web Service 创建失败');
      process.exit(1);
    }

    // 5. 输出成功信息
    console.log('\n🎉 部署完成!');
    console.log('========================================');
    console.log(`🌐 API URL: ${service.serviceDetails.url}`);
    console.log(`🗄️ 数据库: ${database.name}`);
    console.log(`📊 状态监控: https://dashboard.render.com/web/${service.id}`);
    console.log('\n📝 下一步:');
    console.log('1. 等待部署完成（约 2-5 分钟）');
    console.log(`2. 测试健康检查: ${service.serviceDetails.url}/health`);
    console.log('3. 在前端代码中更新 API 基础 URL');

  } catch (error) {
    console.error('❌ 部署过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { createWebService, createDatabase };
