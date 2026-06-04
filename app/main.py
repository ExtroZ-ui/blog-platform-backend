from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.routers.articles import router as articles_router
from app.routers.auth import router as auth_router
from app.routers.categories import router as categories_router
from app.routers.comments import router as comments_router


BASE_DIR = Path(__file__).resolve().parent.parent
UI_KIT_DIR = BASE_DIR / "ui_kit"
FAVICON_PATH = UI_KIT_DIR / "favicon.svg"


app = FastAPI(
    title=settings.project_name,
    description="Backend API для платформы блогов",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(categories_router)
app.include_router(articles_router)
app.include_router(comments_router)

app.mount(
    "/ui-kit",
    StaticFiles(directory=UI_KIT_DIR, html=True),
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
    if FAVICON_PATH.exists():
        return FileResponse(
            FAVICON_PATH,
            media_type="image/svg+xml",
        )

    return JSONResponse(
        content={},
        status_code=204,
    )