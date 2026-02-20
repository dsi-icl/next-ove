import tempfile
from pathlib import Path

import pypandoc
import pyvips
from markdown import markdown as convert_markdown

from .minio import upload_to_minio
from .templates import wrap_html


def markdown(content: bytes, bucket: str, options: dict[str, str],
                   custom_template: str | None, filename: str, version_id: str):
    markdown_text = content.decode("utf-8")

    # Convert markdown to HTML
    html_content = convert_markdown(
        markdown_text,
        extensions=["fenced_code", "tables", "nl2br", "sane_lists"],
    )

    # Use custom template if provided, otherwise use default
    if custom_template:
        html_content = custom_template.format(title=options["title"],
                                              content=html_content)
    else:
        html_content = wrap_html(html_content, options["title"])

    # Upload to destination bucket
    output_filename = f"__formatted__/{filename}/{version_id}.html"
    upload_to_minio(
        bucket_name=bucket,
        object_name=output_filename,
        file_data=html_content.encode("utf-8"),
        content_type="text/html"
    )


def latex(filename: str, content: bytes, options: dict[str, str],
                custom_template: str | None, bucket: str, version_id: str):
    # Use temporary file for pandoc conversion
    with tempfile.NamedTemporaryFile(
            mode="wb", suffix=".tex", delete=False
    ) as temp_tex:
        temp_tex.write(content)
        temp_tex_path = temp_tex.name

    # Convert LaTeX to HTML using pandoc
    html_content = pypandoc.convert_file(
        temp_tex_path,
        "html",
        format="latex",
        extra_args=["--mathjax", "--standalone"],
    )

    # Extract body content if standalone
    if "<body>" in html_content:
        start = html_content.find("<body>") + 6
        end = html_content.find("</body>")
        html_content = html_content[start:end].strip()

    # Wrap in template
    if custom_template:
        html_content = custom_template.format(
            title=options["title"], content=html_content
        )
    else:
        html_content = wrap_html(html_content, options["title"])

    # Upload to destination bucket
    output_filename = f"__formatted__/{filename}/{version_id}.html"
    upload_to_minio(
        bucket_name=bucket,
        object_name=output_filename,
        file_data=html_content.encode("utf-8"),
        content_type="text/html"
    )


def dzi(filename: str, bucket: str, content: bytes,
              options: dict[str, int], version_id: str):
    filename = filename.split("/")[-1]
    with tempfile.TemporaryDirectory() as temp_dir:
        # Save uploaded file
        input_path = Path(temp_dir) / filename
        with open(input_path, "wb") as f:
            f.write(content)

        # Output path for DZI
        output_dzi = Path(temp_dir) / f"{version_id}.dzi"

        # Load and convert image to DZI using pyvips
        image = pyvips.Image.new_from_file(str(input_path))
        image.dzsave(
            str(output_dzi)[:-4],  # pyvips adds .dzi automatically
            tile_size=options["tile_size"],
            overlap=options["overlap"],
        )

        # Upload DZI descriptor file
        with open(output_dzi, "rb") as f:
            dzi_content = f.read()
        dzi_filename = f"__formatted__/{filename}/{version_id}.dzi"
        upload_to_minio(
            file_data=dzi_content, object_name=dzi_filename,
            bucket_name=bucket, content_type="application/xml"
        )

        tiles_dir = Path(temp_dir) / f"{version_id}_files"

        for tile_file in tiles_dir.rglob("*"):
            if tile_file.is_file():
                relative_path = tile_file.relative_to(temp_dir)
                with open(tile_file, "rb") as f:
                    tile_content = f.read()

                upload_to_minio(
                    file_data=tile_content,
                    object_name=f"__formatted__/{filename}/{str(relative_path).replace("\\", "/")}",
                    bucket_name=bucket,
                    content_type="image/jpeg",
                )
