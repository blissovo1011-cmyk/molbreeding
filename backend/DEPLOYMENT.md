# MolBreeding 后端部署指南

## 环境要求

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm 或 yarn

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填写数据库配置
```

### 3. 创建数据库

```sql
CREATE DATABASE molbreeding;
```

### 4. 初始化数据库

```bash
# 运行数据库迁移
npm run migration:run

# 或者直接使用 schema.sql
psql -U postgres -d molbreeding -f database/schema.sql
```

### 5. 导入初始数据

```bash
npm run seed
```

### 6. 启动服务

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

## Docker 部署

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY .env.example .env

EXPOSE 3000

CMD ["node", "dist/main"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=postgres
      - DB_PASSWORD=your_password
      - DB_DATABASE=molbreeding
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_PASSWORD=your_password
      - POSTGRES_DB=molbreeding
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### 启动

```bash
docker-compose up -d
```

## 阿里云/腾讯云部署

### 1. 服务器准备

- 选择 ECS 实例（推荐 2核4G）
- 安装 Docker
- 配置安全组（开放 3000 端口）

### 2. 安装 PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 3. 配置数据库

```bash
sudo -u postgres psql

CREATE DATABASE molbreeding;
CREATE USER molbreeding_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE molbreeding TO molbreeding_user;
\q
```

### 4. 部署应用

```bash
# 克隆代码
git clone <repository>
cd molbreeding/backend

# 安装依赖
npm install

# 构建
npm run build

# 配置环境变量
cp .env.example .env
# 编辑 .env

# 使用 PM2 运行
npm install -g pm2
pm2 start dist/main.js --name molbreeding
pm2 save
pm2 startup
```

### 5. 配置 Nginx（可选）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 验证部署

```bash
curl http://localhost:3000/api/docs
```

访问 Swagger UI 文档页面确认服务正常运行。

## 默认账户

- 用户名: `admin`
- 密码: `admin123`
- 角色: `admin`

---

如有问题，请查看日志:
```bash
pm2 logs molbreeding
```
