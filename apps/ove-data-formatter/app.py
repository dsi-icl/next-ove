from flask import Flask
import src.v1.controller as controllerV1
from src.auth import token_required

app = Flask(__name__)


@app.route("/v1/", methods=["GET"])
def status():
  return controllerV1.get_status()


@app.route("/v1/markdown", methods=["POST"])
@token_required
def markdown():
  return controllerV1.markdown()


@app.route("/v1/latex", methods=["POST"])
@token_required
def latex():
  return controllerV1.latex()


@app.route("/v1/dzi", methods=["POST"])
@token_required
def dzi():
  return controllerV1.dzi()


if __name__ == "__main__":
  app.run()
