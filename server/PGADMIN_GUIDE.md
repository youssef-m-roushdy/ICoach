# pgAdmin - PostgreSQL UI Access Guide

## 🚀 Quick Access

**pgAdmin is now running!** Access it at: **http://localhost:5050**

## 🔐 Login Credentials

- **Email:** `admin@icoach.com`
- **Password:** `admin123`

## 📊 Connect to PostgreSQL Database

After logging into pgAdmin:

### Step 1: Add New Server
1. Right-click on "Servers" in the left panel
2. Click **"Register" > "Server..."**

### Step 2: General Tab
- **Name:** `iCoach Database` (or any name you prefer)

### Step 3: Connection Tab
Fill in these details:

| Field | Value |
|-------|-------|
| **Host name/address** | `postgres` |
| **Port** | `5432` |
| **Maintenance database** | `icoach_db` |
| **Username** | `postgres` |
| **Password** | `123` |

**Important Notes:**
- ✅ Use `postgres` as the host (Docker service name), NOT `localhost`
- ✅ Use port `5432` (internal Docker port), NOT `5433`
- ✅ Check "Save password" if you want to avoid re-entering it

### Step 4: Save
Click **"Save"** and you're connected! 🎉

## 📁 Browsing Your Database

Once connected, expand the tree:
```
iCoach Database
  └─ Databases
      └─ icoach_db
          ├─ Schemas
          │   └─ public
          │       ├─ Tables
          │       │   ├─ Users
          │       │   ├─ Foods
          │       │   └─ SequelizeMeta (migration history)
          │       ├─ Views
          │       └─ Functions
          └─ Extensions
```

## 🔍 Viewing Data

To see data in a table:
1. Navigate to: **Databases > icoach_db > Schemas > public > Tables**
2. Right-click on a table (e.g., `Users`)
3. Select **"View/Edit Data" > "All Rows"**

## 📝 Running SQL Queries

1. Right-click on `icoach_db` database
2. Select **"Query Tool"**
3. Write your SQL query:
   ```sql
   SELECT * FROM "Users";
   SELECT * FROM "Foods" LIMIT 10;
   ```
4. Click the **▶️ Execute** button or press **F5**

## 🛠️ Common Tasks

### Check if Migrations Ran
```sql
SELECT * FROM "SequelizeMeta";
```

### View All Users
```sql
SELECT id, email, username, "firstName", "lastName", role, "isActive" 
FROM "Users";
```

### View All Foods
```sql
SELECT * FROM "Foods" LIMIT 20;
```

### Count Records
```sql
SELECT COUNT(*) FROM "Users";
SELECT COUNT(*) FROM "Foods";
```

## 🐳 Docker Commands

### Stop pgAdmin
```bash
docker-compose stop pgadmin
```

### Restart pgAdmin
```bash
docker-compose restart pgadmin
```

### View pgAdmin Logs
```bash
docker-compose logs -f pgadmin
```

### Remove pgAdmin (keeps data)
```bash
docker-compose stop pgadmin
docker-compose rm pgadmin
```

### Remove pgAdmin and Data
```bash
docker-compose down -v pgadmin
# Or to remove all volumes:
# docker volume rm server_pgadmin_data
```

## 🌐 Accessing from Host Machine

If you want to connect using a desktop PostgreSQL client (DBeaver, TablePlus, etc.):

| Field | Value |
|-------|-------|
| **Host** | `localhost` |
| **Port** | `5433` (external Docker port) |
| **Database** | `icoach_db` |
| **Username** | `postgres` |
| **Password** | `123` |

## 🔧 Troubleshooting

### Can't Access pgAdmin
- Check if container is running: `docker-compose ps`
- Check logs: `docker-compose logs pgadmin`
- Verify port 5050 is not in use: `sudo lsof -i :5050`

### Can't Connect to PostgreSQL
- Make sure you use `postgres` as host (not `localhost`)
- Use port `5432` inside Docker network
- Verify PostgreSQL is running: `docker-compose ps postgres`

### Reset pgAdmin Configuration
```bash
docker-compose down
docker volume rm server_pgadmin_data
docker-compose up -d pgadmin
```

## 📚 Additional Resources

- pgAdmin Documentation: https://www.pgadmin.org/docs/
- PostgreSQL Documentation: https://www.postgresql.org/docs/

---

**Need Help?** Check the logs or restart the containers:
```bash
docker-compose logs pgadmin
docker-compose restart pgadmin postgres
```
