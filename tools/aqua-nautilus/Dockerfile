FROM python:3.9
LABEL authors="bc2918"

WORKDIR /usr/src/app

RUN git clone https://github.com/Aqua-Nautilus/Dependency-Deprecated-Checker.git
WORKDIR ./Dependency-Deprecated-Checker
RUN pip install -r requirements.txt

RUN rm -rf package.json
COPY package.json ./package.json
COPY .env ./.env

RUN . ./.env && python3 scan_dependencies.py -gh "$GITHUB_TOKEN" ./package.json > analysis.txt

CMD ["python3", "-m", "http.server"]
