import io
import os
import ssl
import certifi
import urllib3

from minio import S3Error, Minio
from fastapi import HTTPException

from .config import settings


def ensure_bucket_exists(bucket_name: str):
    """Ensure the specified bucket exists, create if not"""
    try:
        if not minio_client.bucket_exists(bucket_name):
            minio_client.make_bucket(bucket_name)
    except S3Error as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to access/create bucket '{bucket_name}': {e}"
        )


def create_relaxed_ssl_context(
        purpose=ssl.Purpose.SERVER_AUTH,
        *,
        cafile=None,
        capath=None,
        cadata=None
):
    """
    Create an SSL context with relaxed Python 3.13+ verification flags.
    Removes VERIFY_X509_STRICT and VERIFY_X509_PARTIAL_CHAIN flags.
    """
    # Create the default context
    ctx = ssl.create_default_context(
        purpose=purpose,
        cafile=cafile,
        capath=capath,
        cadata=cadata
    )

    # Remove Python 3.13 strict flags if they exist
    # VERIFY_X509_STRICT = 0x00020000 (correct hex value)
    # VERIFY_X509_PARTIAL_CHAIN = 0x00080000 (correct hex value)

    if hasattr(ssl, "VERIFY_X509_STRICT"):
        try:
            ctx.verify_flags &= ~ssl.VERIFY_X509_STRICT
        except AttributeError:
            # If verify_flags is read-only, try alternative approach
            pass

    if hasattr(ssl, "VERIFY_X509_PARTIAL_CHAIN"):
        try:
            ctx.verify_flags &= ~ssl.VERIFY_X509_PARTIAL_CHAIN
        except AttributeError:
            pass

    # Additional relaxation: allow legacy certificates
    if hasattr(ctx, 'minimum_version'):
        # Don't enforce TLS 1.3 if it causes issues
        ctx.minimum_version = ssl.TLSVersion.TLSv1_2

    return ctx


def create_http_client():
    """Create HTTP client with custom SSL settings for MinIO"""
    if not settings.minio_secure:
        # HTTP (no SSL)
        return None

    # Completely disable SSL verification (not recommended for production)
    if not settings.minio_cert_check:
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        return urllib3.PoolManager(
            cert_reqs=ssl.CERT_NONE,
            assert_hostname=False,
        )

    # Use relaxed SSL context for legacy certificates
    if settings.minio_relaxed_ssl:
        # Determine CA file path
        ca_file = None
        if settings.minio_ca_certs and os.path.exists(settings.minio_ca_certs):
            ca_file = settings.minio_ca_certs
        else:
            ca_file = certifi.where()

        # Create relaxed SSL context
        ssl_context = create_relaxed_ssl_context(cafile=ca_file)

        # Optionally disable hostname checking for private CAs
        ssl_context.check_hostname = True  # Set to False if needed

        return urllib3.PoolManager(
            ssl_context=ssl_context,
            cert_reqs=ssl.CERT_REQUIRED,
        )

    # Use custom CA certificate with standard verification
    if settings.minio_ca_certs and os.path.exists(settings.minio_ca_certs):
        ssl_context = ssl.create_default_context(cafile=settings.minio_ca_certs)
        return urllib3.PoolManager(
            ssl_context=ssl_context,
            cert_reqs=ssl.CERT_REQUIRED,
        )

    # Use system certificates with standard verification
    return urllib3.PoolManager(
        cert_reqs=ssl.CERT_REQUIRED,
        ca_certs=certifi.where(),
    )


# Initialize MinIO client with custom HTTP client
http_client = create_http_client()
minio_client = Minio(
    settings.minio_endpoint,
    access_key=settings.minio_access_key,
    secret_key=settings.minio_secret_key,
    secure=settings.minio_secure,
    http_client=http_client,
)


def upload_to_minio(file_data: bytes, object_name: str, bucket_name: str, content_type: str):
    """Upload file to MinIO bucket"""
    try:
        minio_client.put_object(
            bucket_name,
            object_name,
            io.BytesIO(file_data),
            length=len(file_data),
            content_type=content_type,
        )
        return f"s3://{bucket_name}/{object_name}"
    except S3Error as e:
        raise HTTPException(status_code=500, detail=f"MinIO upload failed: {e}")


def download_from_minio(bucket: str, object_name: str) -> bytes:
    """Download file from MinIO"""
    response = None
    try:
        response = minio_client.get_object(bucket, object_name)
        return response.read()
    finally:
        if response is not None:
            response.close()
            response.release_conn()