FROM python:3.9-slim-buster
LABEL authors="Brython Caley-Davies <bc2918@ic.ac.uk>"

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

CMD ["python3", "-m", "flask", "run"]
