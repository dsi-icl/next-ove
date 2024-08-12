import os
import glob
import pyvips
import requests

from stat import S_IFREG
from flask import request
from datetime import datetime
from dotenv import load_dotenv
from markdown import markdown as md
from stream_zip import ZIP_64, stream_zip
from src.locks import LATEX_LOCK, MARKDOWN_LOCK
from IPython.lib.latextools import latex_to_html
from tempfile import NamedTemporaryFile, TemporaryDirectory

load_dotenv()


def get_status():
  return {"status": "running"}


def markdown():
  data = request.get_data().decode("utf-8")
  if data is None:
    raise ValueError("Missing data")
  with MARKDOWN_LOCK:
    return md(data)


def latex():
  data = request.get_data().decode("utf-8")
  if data is None:
    raise ValueError("Missing data")
  with LATEX_LOCK:
    data = data.replace("\\displaystyle ", "").replace("\\\\", "\\")
    if "$$" not in data:
      data = data.replace("$", "$$")
    return latex_to_html(data)


def dzi():
  data = request.get_json()

  response = requests.get(data["get_url"])
  if response.status_code != 200:
    raise ConnectionError("Unable to get file")

  files = []
  with TemporaryDirectory() as folder:
    with NamedTemporaryFile() as image_file:
      image_file.write(response.content)
      pyvips.Image.new_from_file(image_file.name).dzsave(os.path.join(folder, "image"), suffix=".png")

    for filename in glob.glob("**/*", root_dir=folder, recursive=True):
      if os.path.isdir(os.path.join(folder, filename)):
        continue

      with open(os.path.join(folder, filename), mode="rb") as f:
        files.append((filename, datetime.now(), S_IFREG | 0o600, ZIP_64, (f.read(),)))

    return stream_zip(files)
