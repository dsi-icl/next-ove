cd tools/aqua-nautilus || exit
cp ../../package.json ./
docker build -t aqua-nautilus:latest .
rm -rf package.json
img_id=$(docker create aqua-nautilus:latest)
docker cp "$img_id":/usr/src/app/Dependency-Deprecated-Checker/analysis.txt ./
docker rm -v "$img_id"