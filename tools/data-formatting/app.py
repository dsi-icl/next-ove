from flask import Flask
import src.v1.controller as controllerV1

app = Flask(__name__)


@app.route("/v1/", methods=["GET"])
def status():
  return controllerV1.get_status()


@app.route("/v1/markdown", methods=["POST"])
def markdown():
  return controllerV1.markdown()


@app.route("/v1/latex", methods=["POST"])
def latex():
  return controllerV1.latex()


if __name__ == "__main__":
  app.run()
