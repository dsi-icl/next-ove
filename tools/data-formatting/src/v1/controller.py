from flask import request
from markdown import markdown as md
from src.locks import LATEX_LOCK, MARKDOWN_LOCK
from IPython.lib.latextools import latex_to_html


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
  with TemporaryDirectory() as folder:
    with NamedTemporaryFile() as image_file:
      image_file.write(response.content)
      pyvips.Image.new_from_file(image_file.name).dzsave(folder + "/image", suffix=".png")
      # TODO: return assets as zip file
