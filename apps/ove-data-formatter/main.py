import uvicorn

from src.app import app
from src.endpoints import router

app.include_router(router)


@app.get("/")
async def health_check():
    """Health check endpoint - no authentication required"""
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
