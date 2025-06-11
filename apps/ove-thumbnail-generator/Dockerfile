FROM python:3.12.6-slim-bookworm
LABEL "org.opencontainers.image.authors"="Brython Caley-Davies <ove@imperial.ac.uk>"

WORKDIR /usr/src/app
EXPOSE 8080

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY static/ ./
COPY app.py .
COPY .flaskenv.production .

CMD ["python3", "-m", "flask", "run"]