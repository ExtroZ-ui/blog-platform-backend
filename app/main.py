from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.routers.articles import router as articles_router
from app.routers.auth import router as auth_router
from app.routers.categories import router as categories_router
from app.routers.comments import router as comments_router


app = FastAPI(
    title=settings.project_name,
    description="Backend API для платформы блогов",
    version="1.0.0",
)

app.include_router(auth_router)
app.include_router(categories_router)
app.include_router(articles_router)
app.include_router(comments_router)

app.mount(
    "/ui-kit",
    StaticFiles(directory="ui_kit", html=True),
    name="ui_kit",
)

@app.get(
    "/.well-known/appspecific/com.chrome.devtools.json",
    include_in_schema=False,
)
async def chrome_devtools_config():
    return JSONResponse(content={})

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
    
@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse(
        "ui_kit/favicon.svg",
        media_type="image/svg+xml",
    )