#!/bin/bash

# Nebula Art Backend 自动部署脚本
# 使用方法: ./deploy.sh

set -e

echo "🚀 开始 Nebula Art 后端自动部署..."

# 检查必要工具
command -v git >/dev/null 2>&1 || { echo "❌ 需要安装 Git"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ 需要安装 Node.js"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ 需要安装 npm"; exit 1; }

# 1. 构建项目
echo "📦 构建项目..."
npm ci
npm run build

# 2. 检查 Git 状态
echo "🔍 检查 Git 状态..."
if [ ! -d ".git" ]; then
    echo "📁 初始化 Git 仓库..."
    git init
    git add .
    git commit -m "Initial commit: Nebula Art Backend"
fi

# 3. 推送到 GitHub（需要用户手动配置）
echo "📤 准备推送到 GitHub..."
echo "请确保您已经："
echo "1. 在 GitHub 创建了仓库: nebula-art-backend"
echo "2. 设置了 Git remote origin"
echo ""
read -p "是否已完成 GitHub 仓库设置？(y/n): " github_ready

if [ "$github_ready" = "y" ]; then
    echo "🔄 推送代码到 GitHub..."
    git add .
    git commit -m "Deploy: $(date)" || echo "没有新的更改"
    git push origin main || git push origin master
    echo "✅ 代码已推送到 GitHub"
else
    echo "⚠️  请先完成 GitHub 仓库设置，然后运行:"
    echo "   git remote add origin https://github.com/yourusername/nebula-art-backend.git"
    echo "   git push -u origin main"
fi

# 4. Render 部署说明
echo ""
echo "🌐 下一步：Render.com 部署"
echo "========================================="
echo "1. 访问 https://render.com 并登录"
echo "2. 点击 'New +' → 'Web Service'"
echo "3. 连接您的 GitHub 仓库"
echo "4. 配置设置："
echo "   - Name: nebulaart-api"
echo "   - Build Command: npm ci && npm run build"
echo "   - Start Command: npm run start:prod"
echo "5. 添加环境变量："
echo "   - NODE_ENV=production"
echo "   - PORT=3000"
echo "   - JWT_SECRET=your-super-secret-jwt-key"
echo "   - DATABASE_URL=postgresql://..."
echo ""
echo "📖 详细指南请查看: render-deploy-guide.md"
echo ""
echo "🎉 部署脚本执行完成！"
