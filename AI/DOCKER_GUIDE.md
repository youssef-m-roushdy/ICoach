# Docker Setup Guide for iCoach AI API

This guide explains how to build and run the iCoach AI API using Docker.

## 📦 What's Included

The Docker image includes:
- **Food Recognition API** - AI-powered food detection with nutritional data
- All required dependencies (TensorFlow, FastAPI, etc.)
- Pre-trained ML model for food recognition

## 🚀 Quick Start

### Build the Docker Image

```bash
cd /home/youssef/Desktop/Icoach-app/AI
docker build -t icoach-ai-api:latest .
```

### Run with Docker Compose (Recommended)

```bash
docker-compose up -d
```

This will:
- Build the image if not already built
- Start the API on port 8000
- Connect to your host PostgreSQL database
- Run in the background

### Run with Docker Command

```bash
docker run -d \
  --name icoach-ai-api \
  -p 8000:8000 \
  --add-host host.docker.internal:host-gateway \
  -e POSTGRES_HOST=host.docker.internal \
  -e POSTGRES_PORT=5433 \
  -e POSTGRES_DB=icoach_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=123 \
  icoach-ai-api:latest
```

## 🔧 Configuration

### Environment Variables

You can override these in `docker-compose.yml` or pass them with `-e` flag:

```env
# Database Configuration
POSTGRES_HOST=host.docker.internal    # Host machine's PostgreSQL
POSTGRES_PORT=5433                    # PostgreSQL port
POSTGRES_DB=icoach_db                 # Database name
POSTGRES_USER=postgres                # Database user
POSTGRES_PASSWORD=123                 # Database password

# API Configuration
HOST=0.0.0.0                          # Bind to all interfaces
PORT=8000                             # API port
DEBUG=False                           # Set to True for development

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:8081

# Model Paths (usually don't need to change)
MODEL_PATH=/app/food_predict_feature/best_model_food100.keras
CLASS_NAMES_PATH=/app/food_predict_feature/class_names.json
```

## 📡 API Endpoints

Once running, access the API at:

- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

### Food Recognition Endpoints

- `POST /api/food/predict` - Predict food from image
- `POST /api/food/predict-top` - Get top K predictions

## 🐳 Docker Commands Cheat Sheet

### View Logs

```bash
# Follow logs in real-time
docker-compose logs -f

# View specific container logs
docker logs icoach-ai-api
```

### Stop the API

```bash
# With docker-compose
docker-compose down

# Direct docker command
docker stop icoach-ai-api
```

### Restart the API

```bash
# With docker-compose
docker-compose restart

# Direct docker command
docker restart icoach-ai-api
```

### Rebuild After Code Changes

```bash
# Rebuild and restart
docker-compose up -d --build

# Or rebuild manually
docker build -t icoach-ai-api:latest .
docker-compose up -d
```

### Remove Everything

```bash
# Stop and remove containers
docker-compose down

# Remove image
docker rmi icoach-ai-api:latest
```

## 🔍 Troubleshooting

### Container Won't Start

Check logs for errors:
```bash
docker-compose logs api
```

### Can't Connect to Database

1. Ensure PostgreSQL is running on host:
   ```bash
   sudo systemctl status postgresql
   ```

2. Check PostgreSQL is listening on correct port:
   ```bash
   sudo netstat -tlnp | grep postgres
   ```

3. Verify `pg_hba.conf` allows connections from Docker

### Port 8000 Already in Use

Change the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"  # Use port 8001 on host instead
```

### Model Not Loading

Ensure these files exist:
- `food_predict_feature/best_model_food100.keras`
- `food_predict_feature/class_names.json`

### Permission Issues

Run with appropriate permissions:
```bash
sudo docker-compose up -d
```

## 📊 Resource Usage

The container uses approximately:
- **Memory**: 2-3 GB (TensorFlow models)
- **Disk**: ~4 GB for image
- **CPU**: Varies with load (no GPU required)

## 🔒 Security Notes

For production deployment:

1. **Change default passwords** in environment variables
2. **Set `DEBUG=False`** in production
3. **Configure specific CORS origins** instead of wildcard
4. **Use secrets management** for sensitive data
5. **Run behind a reverse proxy** (nginx/traefik)
6. **Enable HTTPS**
7. **Implement rate limiting**
8. **Add authentication** for sensitive endpoints

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🆘 Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Review this guide
3. Check API docs: http://localhost:8000/docs

---

**Happy Deploying! 🚀**
