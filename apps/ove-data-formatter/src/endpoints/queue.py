from fastapi import APIRouter, Depends, HTTPException

from ..auth import verify_api_key
from ..workers import get_worker_pool

router = APIRouter(prefix="/queue")


@router.get("/{task_id}/status")
async def get_task_status(
        task_id: str,
        _api_key: str = Depends(verify_api_key),
):
    """Get the status of a conversion task"""
    worker_pool = get_worker_pool()
    if worker_pool is None:
        raise HTTPException(500, "Worker pool not initialised")

    status = worker_pool.get_status(task_id)
    if status is None:
        raise HTTPException(404, "Task not found")

    return status


@router.get("/")
async def get_queue_status(_api_key: str = Depends(verify_api_key)):
    """Get current queue status and all tasks"""
    worker_pool = get_worker_pool()
    if worker_pool is None:
        raise HTTPException(500, "Worker pool not initialised")

    return worker_pool.get_all_statuses()
