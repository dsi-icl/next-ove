#!/usr/bin/env bash
set -euo pipefail

if ! command -v jq &>/dev/null; then
  echo "This script requires jq. Install it via your package manager."
  exit 1
fi

installed_json="$(pnpm list --depth=0 --json)"

version_map=$(
  pnpm list --depth=0 --json \
    | jq '
      [ .[]
        # for each project in the array, walk all 4 fields (or {} if missing)
        | ( .dependencies       // {}
          , .devDependencies    // {}
          , .optionalDependencies// {}
          , .peerDependencies   // {}
          )
        # turn each object into [ {key,name},{value,obj},… ]
        | to_entries[]
        # pick out { "pkgName": "x.y.z" }
        | { (.key): .value.version }
      ]
      # merge all those single‐key objects into one big map
      | add
    '
)

jq --argjson VERS "$version_map" '
  def sync(field):
    if has(field) then
      .[field] |= with_entries(.value = ($VERS[.key] // .value))
    else
      .
    end;

  # apply to all 4 common sections
  sync("dependencies")       |
  sync("devDependencies")    |
  sync("optionalDependencies") |
  sync("peerDependencies")
' ../../../package.json > ../../../package.json.tmp

mv ../../../package.json.tmp ../../../package.json
echo "✅ package.json synced to installed versions"