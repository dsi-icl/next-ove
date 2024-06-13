echo "Initialising"

# Default variable values
image_version="latest"
docker_platform="linux/amd64"
no_cache=false

# Function to display script usage
usage() {
  echo "Usage: $0 [OPTIONS]"
  echo "Options:"
  echo " -v, --version    Image version - default 'latest'"
  echo " -p, --platform   Target platform - default 'linux/amd64'"
  echo " -nc, --no-cache  Whether to build Docker image with caching enabled - default false"
}

has_argument() {
    [[ ("$1" == *=* && -n ${1#*=}) || ( -n "$2" && "$2" != -*)  ]];
}

extract_argument() {
  echo "${2:-${1#*=}}"
}

# Function to handle options and arguments
handle_options() {
  while [ $# -gt 0 ]; do
    case $1 in
      -h | --help)
        usage
        exit 0
        ;;
      -p | --platform)
        if has_argument "$@"; then
          docker_platform=$(extract_argument "$@")
        fi

        shift
        ;;
      -v | --version)
        if has_argument "$@"; then
          image_version=$(extract_argument "$@")
        fi

        shift
        ;;
      -nc | --no_cache)
        no_cache=true

        shift
        ;;
      *)
        echo "Invalid option: $1" >&2
        usage
        exit 1
        ;;
    esac
    shift
  done
}

# Main script execution
handle_options "$@"

# Perform the desired actions based on the provided flags and arguments
if [ "$docker_platform" ]; then
 echo "Targeting platform: $docker_platform"
fi

if [ "$image_version" ]; then
 echo "Tagging version: $image_version"
fi

echo "Linting"
npx nx run ove-core:lint
npx nx run ove-core-ui:lint

echo "Building"

if [ "$no_cache" == "true" ]; then
  docker build --no-cache --progress=plain -t "next-ove-core:$image_version" --platform "$docker_platform" -f apps/ove-core/Dockerfile .
else
  docker build --progress=plain -t "next-ove-core:$image_version" --platform "$docker_platform" -f apps/ove-core/Dockerfile .
fi

echo "Saving Image"
if ! [ -d "dist" ]; then
  mkdir "dist"
fi

if ! [ -d "dist/images" ]; then
  mkdir "dist/images"
fi

docker save -o "dist/images/core-$image_version.tar.gz" "next-ove-core:$image_version"
