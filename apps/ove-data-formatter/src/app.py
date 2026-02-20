import multiprocessing
from contextlib import asynccontextmanager

from fastapi import FastAPI

from .workers import set_worker_pool, WorkerPool


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Manage application lifespan - start/stop background workers"""
    multiprocessing.freeze_support()

    worker_pool = WorkerPool(num_workers=3)
    set_worker_pool(worker_pool)
    worker_pool.start()
    yield


app = FastAPI(title="Document & Image Converter", lifespan=lifespan)
