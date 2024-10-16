cd tools/deprecation || exit
cp ../../package.json ./
docker build -t ove-deprecation:latest .
rm -rf package.json
img_id=$(docker create ove-deprecation:latest)
docker cp "$img_id":/usr/src/app/Dependency-Deprecated-Checker/analysis.txt ./
docker rm -v "$img_id"