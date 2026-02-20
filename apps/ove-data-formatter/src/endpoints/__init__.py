from fastapi import APIRouter

from . import converter, queue

router = APIRouter(prefix="/api")

router.include_router(converter.router)
router.include_router(queue.router)
