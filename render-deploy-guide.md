# Nebula Art 后端部署指南（Render.com）

## 🚀 准备工作
- 已有 GitHub 仓库：https://github.com/yourusername/nebula-art-backend
- 已包含：
  - `package.json`
  - `src/main.ts`
  - `Dockerfile` （可选）
  - `.env.example`
  - `ormconfig.json`

## 🔧 部署步骤
1. 访问 [https://render.com](https://render.com) 并登录。
2. 点击左上角 "+" → "Web Service"。
3. 选择 GitHub 仓库：`yourusername/nebula-art-backend`。
4. 在配置页面：
   - **Name**: `nebulaart-api`
   - **Region**: Asia Pacific (Tokyo)
   - **Environment**: Node.js
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Root Directory**: `/`
5. 在 "Environment Variables" 中添加：
   - `NODE_ENV=production`
   - `PORT=3000`
   - `JWT_SECRET=your-super-secret-jwt-key-here` （建议更换为随机字符串）
6. 点击 "Create Web Service"。
7. 等待部署完成（约 2–5 分钟）。
8. 成功后，记下生成的 URL：`https://nebulaart-api.onrender.com`

## 🗃️ 配置 PostgreSQL 数据库
1. 在 Render 控制台左侧菜单，点击 "Databases" → "Add Database"。
2. 选择 "PostgreSQL" → "Free Plan"。
3. 命名：`nebula-art-db`
4. 创建后，返回 Web Service 页面 → "Environment Variables" → "Add Variable"：
   - Key: `DATABASE_URL`
   - Value: 粘贴 Render 提供的 `postgresql://...` 连接字符串
5. 点击保存，Render 会自动重启服务。

## 🖼️ 配置对象存储（可选但推荐）
1. 注册 [阿里云 OSS](https://www.aliyun.com/product/oss)
2. 创建 Bucket，设置为公共读
3. 获取 AccessKey ID 和 Secret
4. 在 Render 的环境变量中添加：
   - `AWS_ACCESS_KEY_ID=your-access-key`
   - `AWS_SECRET_ACCESS_KEY=your-secret-key`
   - `AWS_BUCKET_NAME=nebula-art-uploads`
   - `AWS_REGION=ap-southeast-1`

## ✅ 最终验证
在浏览器打开：`https://nebulaart-api.onrender.com/api/health`  
应返回：`{"status":"ok"}`

## 🔗 前端连接
在前端代码中，将所有 API 请求从 `http://localhost:3000` 替换为：
`https://nebulaart-api.onrender.com`

恭喜！您的艺术平台已正式上线！
