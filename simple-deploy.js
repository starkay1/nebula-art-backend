#!/usr/bin/env node

/**
 * Nebula Art Backend - 简化部署脚本
 * 创建数据库并提供部署指导
 */

const https = require('https');

const CONFIG = {
  renderApiKey: process.env.RENDER_API_KEY || 'rnd_sWJ2OcPiqaTXY3Ao1O1Z5owaBRrf',
  region: 'singapore'
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
    return null;
  }
}

async function main() {
  console.log('🎨 Nebula Art Backend 部署助手\n');

  try {
    // 1. 获取用户信息
    console.log('👤 获取用户信息...');
    const ownerId = await getUserInfo();
    if (!ownerId) {
      console.error('❌ 无法获取用户信息');
      process.exit(1);
    }
    console.log(`✅ 用户ID: ${ownerId}`);

    // 2. 检查现有数据库
    console.log('\n🗄️ 检查数据库状态...');
    const databaseId = 'dpg-d35m0r6mcj7s73a1fbk0-a'; // 之前创建的数据库ID
    
    console.log('⏳ 获取数据库连接信息...');
    const connectionString = await getDatabaseConnectionString(databaseId);
    
    if (connectionString) {
      console.log('✅ 数据库连接获取成功!');
      console.log(`🔗 DATABASE_URL: ${connectionString}`);
    } else {
      console.log('⚠️  数据库可能还在创建中，请稍后手动获取连接字符串');
    }

    // 3. 输出部署指导
    console.log('\n🚀 下一步：手动部署到 Render');
    console.log('========================================');
    console.log('1. 将代码推送到 GitHub:');
    console.log('   git remote add origin https://github.com/yourusername/nebula-art-backend.git');
    console.log('   git push -u origin main');
    console.log('');
    console.log('2. 访问 https://render.com 并登录');
    console.log('3. 点击 "New +" → "Web Service"');
    console.log('4. 连接您的 GitHub 仓库');
    console.log('5. 配置设置:');
    console.log('   - Name: nebulaart-api');
    console.log('   - Build Command: npm ci && npm run build');
    console.log('   - Start Command: npm run start:prod');
    console.log('6. 添加环境变量:');
    console.log('   - NODE_ENV=production');
    console.log('   - PORT=3000');
    console.log('   - JWT_SECRET=your-super-secret-jwt-key');
    if (connectionString) {
      console.log(`   - DATABASE_URL=${connectionString}`);
    } else {
      console.log('   - DATABASE_URL=(从 Render 数据库页面获取)');
    }
    console.log('');
    console.log('🎉 部署完成后，您的 API 将可在以下地址访问:');
    console.log('https://nebulaart-api.onrender.com');

  } catch (error) {
    console.error('❌ 部署过程中出现错误:', error.message);
    process.exit(1);
  }
}

main();
