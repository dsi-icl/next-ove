from pathlib import Path
from urllib.parse import unquote_plus

from fastapi import APIRouter, Depends, Form, HTTPException, status

from .. import converter
from ..auth import verify_api_key, verify_token
from ..config import settings
from ..minio import ensure_bucket_exists, download_from_minio
from ..workers import get_worker_pool

router = APIRouter(prefix="/convert")


def convert(bucket: str, source_object: str, version_id: str,
            conversion_type: str, options: dict | None = None,
            custom_template: str | None = None):
    content = download_from_minio(bucket, source_object)

    match conversion_type:
        case "markdown":
            converter.markdown(filename=source_object, bucket=bucket,
                               content=content, options=options,
                               custom_template=custom_template,
                               version_id=version_id)
        case "latex":
            converter.latex(filename=source_object, bucket=bucket,
                            content=content, options=options,
                            custom_template=custom_template,
                            version_id=version_id)
        case "dzi":
            converter.dzi(content=content, bucket=bucket,
                          filename=source_object, options=options,
                          version_id=version_id)


@router.post("/event")
async def minio_events(
        payload: dict,
        _: str = Depends(verify_token),
):
    allowed_extensions = {".jpg", ".jpeg", ".png", ".tiff", ".tif", ".webp"}

    for record in payload.get("Records", []):
        bucket = record["s3"]["bucket"]["name"]
        obj = unquote_plus(record["s3"]["object"]["key"])
        if obj.startswith("__formatted__/"):
            continue
        version_id = record["s3"]["object"].get("versionId", "latest")

        file_path = Path(obj)
        file_ext = file_path.suffix.lower()

        worker_pool = get_worker_pool()
        if worker_pool is None:
            raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR,
                                "Worker pool not initialised")
        if file_ext in [".md", ".markdown"]:
            task_type = "markdown"
            task_args = {"title": file_path.name}
        elif file_ext in [".tex", ".latex"]:
            task_type = "latex"
            task_args = {"title": file_path.name}
        elif file_ext in allowed_extensions:
            task_type = "dzi"
            task_args = {"tile_size": 254, "overlap": 1}
        else:
            continue
        worker_pool.enqueue(
            bucket, obj, version_id, task_type,
            task_args, task_type=task_type,
            filename=bucket + "/" + obj + f"?version_d={version_id}",
            task=convert)

    return {"status": "ok"}


@router.post("/markdown")
async def convert_markdown(
        bucket: str = Form(...),
        source_object: str = Form(...),
        version_id: str = Form(...),
        _api_key: str = Depends(verify_api_key),
):
    """Queue Markdown to HTML conversion job"""
    if not source_object.endswith((".md", ".markdown")):
        raise HTTPException(400,
                            "Object must be a Markdown file (.md, .markdown)")
    ensure_bucket_exists(bucket)

    worker_pool = get_worker_pool()
    if worker_pool is None:
        raise HTTPException(500, "Worker pool not initialised")
    worker_pool.enqueue(bucket, source_object, version_id, "markdown",
                        {"title": Path(source_object).name},
                        task_type="markdown",
                        filename=bucket + "/" + source_object + f"?version_id={version_id}",
                        task=convert,
                        )


@router.post("/latex")
async def convert_latex(
        bucket: str = Form(...),
        source_object: str = Form(...),
        version_id: str = Form(...),
        _api_key: str = Depends(verify_api_key),
):
    """Convert LaTeX to HTML and upload to MinIO"""
    if not source_object.endswith((".tex", ".latex")):
        raise HTTPException(400, "File must be a LaTeX file (.tex, .latex)")
    ensure_bucket_exists(bucket)

    worker_pool = get_worker_pool()
    if worker_pool is None:
        raise HTTPException(500, "Worker pool not initialised")
    worker_pool.enqueue(bucket,
                        source_object, version_id, "latex",
                        {"title": Path(source_object).name}, task_type="latex",
                        filename=bucket + "/" + source_object + f"version_id={version_id}",
                        task=convert)


@router.post("/dzi")
async def convert_image_to_dzi(
        bucket: str = Form(...),
        source_object: str = Form(...),
        version_id: str = Form(...),
        _api_key: str = Depends(verify_api_key),
):
    """Convert image to Deep Zoom Image (DZI) format and upload to MinIO"""
    allowed_extensions = {".jpg", ".jpeg", ".png", ".tiff", ".tif", ".webp"}
    file_ext = Path(source_object).suffix.lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(400, f"Unsupported image format: {file_ext}")
    ensure_bucket_exists(bucket)

    worker_pool = get_worker_pool()
    if worker_pool is None:
        raise HTTPException(500, "Worker pool not initialised")
    worker_pool.enqueue(bucket,
                        source_object, "dzi",
                        {"tile_size": settings.tile_size,
                         "overlap": settings.tile_overlap},
                        task_type="dzi",
                        filename=bucket + "/" + source_object + f"?version_id={version_id}",
                        task=convert)
