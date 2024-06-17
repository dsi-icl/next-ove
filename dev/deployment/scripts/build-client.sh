echo "Initialising"

# Default variable values
release=false

# Function to display script usage
usage() {
 echo "Usage: $0 [OPTIONS]"
 echo "Options:"
 echo " -p, --platform      Target platform"
 echo " -a, --arch          Target architecture"
 echo " -r, --release       Whether to release to GitHub"
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
          platform=$(extract_argument "$@")
        fi

        shift
        ;;
      -a | --arch)
        echo "checking arch"
        if has_argument "$@"; then
          arch=$(extract_argument "$@")
        fi

        shift
        ;;
      -r | --release)
        release=true

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
if [ "$platform" ]; then
 echo "Targeting platform: $platform"
fi

if [ "$arch" ]; then
 echo "Targeting architecture: $arch"
fi

if [ "$release" == "true" ]; then
  echo "Releasing to GitHub"
fi

echo "Linting"
npx nx run ove-client:lint
npx nx run ove-client-ui:lint

echo "Building"
npx nx run ove-client:build --configuration=production
npx nx run ove-client-ui:build --configuration=production

if [ "$release" == "true" ]; then
  echo "Making & Releasing"
  source dev/deployment/config/.env.release
  if [ "$platform" ]; then
    GH_TOKEN="$GH_TOKEN" npx nx run ove-client:release:mac --arch="$arch" --platform="$platform"
  else
    GH_TOKEN="$GH_TOKEN" npx nx run ove-client:release:mac --arch="$arch"
  fi
else
  echo "Making"
  if [ "$platform" ]; then
    GH_TOKEN="$GH_TOKEN" npx nx run ove-client:make:mac --arch="$arch" --platform="$platform"
  else
    npx nx run ove-client:make:mac --arch="$arch"
  fi
fi

echo "Cleaning Up"
rm -rf node_modules/bcrypt
npm install
./../../remove-optional-deps.sh