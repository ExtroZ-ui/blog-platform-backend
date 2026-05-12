from fastapi import FastAPI

from app.core.config import settings
from app.routers.articles import router as articles_router
from app.routers.auth import router as auth_router
from app.routers.categories import router as categories_router


app = FastAPI(
    title=settings.project_name,
    description="Backend API для платформы блогов",
    version="1.0.0",
)

app.include_router(auth_router)
app.include_router(categories_router)
app.include_router(articles_router)


@app.get("/")
async def root():
    return {
        "message": "Blog Platform API is running",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
    }