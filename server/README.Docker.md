# 🐳 iCoach Server - Docker Quick Guide

Quick reference for running the server in Docker with database UI access, migrations, and seeding.

---

## 🚀 Quick Start

### 1. Set Environment to Production
```bash
# Edit .env file and change:
NODE_ENV=production
```

### 2. Build and Run
```bash
docker-compose up -d --build
```

### 3. Run Migrations & Seeds
```bash
# Migrate database schema
docker-compose exec -T server npx sequelize-cli db:migrate

# (Optional) Seed initial data
docker-compose exec -T server npx sequelize-cli db:seed:all
```

### 4. Access Application
- **API**: http://localhost:5000
- **Swagger UI**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health

---

## 🗄️ Database UI Access

### PostgreSQL (Port: 5433)
**Credentials:** `postgres` / `123` / `icoach_db`

**Recommended UI Tools:**
- **pgAdmin** - https://www.pgadmin.org/download/
  - Connection: `localhost:5433`
- **DBeaver** - https://dbeaver.io/download/
- **TablePlus** - https://tableplus.com/

```bash
# CLI access
docker-compose exec postgres psql -U postgres -d icoach_db
```

---

### MongoDB (Port: 27018)
**Connection String:**
```
mongodb://admin:admin@localhost:27018/icoach_nosql?authSource=admin
```

**Recommended UI Tools:**
- **MongoDB Compass** - https://www.mongodb.com/products/compass
  - Just paste the connection string above
- **Studio 3T** - https://studio3t.com/

```bash
# CLI access
docker-compose exec mongodb mongosh -u admin -p admin --authenticationDatabase admin
```

---

### Redis (Port: 6380)
**Connection:** `localhost:6380` (no password)

**Recommended UI Tools:**
- **RedisInsight** - https://redis.com/redis-enterprise/redis-insight/
  - Connection: `localhost:6380`
- **Another Redis Desktop Manager** - https://github.com/qishibo/AnotherRedisDesktopManager

```bash
# CLI access
docker-compose exec redis redis-cli
```

---

## 🎮 Essential Docker Commands

```bash
# Start all containers
docker-compose up -d

# Stop all containers
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# View server logs
docker-compose logs -f server

# Check container status
docker-compose ps

# Restart specific service
docker-compose restart server
```

---

## 💾 Database Commands

### Migrations
```bash
# Run migrations
docker-compose exec -T server npx sequelize-cli db:migrate

# Undo last migration
docker-compose exec -T server npx sequelize-cli db:migrate:undo

# Check migration status
docker-compose exec server npx sequelize-cli db:migrate:status
```

### Seeds
```bash
# Run all seeds
docker-compose exec -T server npx sequelize-cli db:seed:all

# Undo all seeds
docker-compose exec -T server npx sequelize-cli db:seed:undo:all
```

### Database Backup
```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U postgres icoach_db > backup_$(date +%Y%m%d).sql

# Restore PostgreSQL
docker-compose exec -T postgres psql -U postgres icoach_db < backup_20251102.sql
```

---

## 🔧 Common Issues

### Port Already in Use
Edit `.env` and change the ports:
```env
PORT=5001
POSTGRES_PORT=5434
MONGO_PORT=27019
REDIS_PORT=6381
```

### Container Keeps Restarting
```bash
# Check logs
docker-compose logs server

# Restart databases first
docker-compose restart postgres mongodb redis
sleep 5
docker-compose restart server
```

### Clean Restart (Keep Data)
```bash
docker-compose down
docker-compose up -d --build
```

### Nuclear Option (⚠️ Deletes ALL Data!)
```bash
docker-compose down -v
docker-compose up -d --build
docker-compose exec -T server npx sequelize-cli db:migrate
docker-compose exec -T server npx sequelize-cli db:seed:all
```

---

## 📊 Service Ports

| Service | Port | Credentials |
|---------|------|-------------|
| **Server** | 5000 | - |
| **PostgreSQL** | 5433 | postgres / 123 |
| **MongoDB** | 27018 | admin / admin |
| **Redis** | 6380 | (no password) |

---

**🎉 That's it! For more details, see the full [README.md](./README.md)**

---

**Last Updated:** November 2, 2025
