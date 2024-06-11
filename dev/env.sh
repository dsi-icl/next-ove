#!/bin/sh
for i in $(cat "$2" | xargs | grep NEXT_OVE_)
do
    key=$(echo "$i" | cut -d '=' -f 1)
    value=$(echo "$i" | cut -d '=' -f 2-)
    echo "$key"="$value"
    find "$1" -type f \( -name '*.js' -o -name '*.css' -o -name "*.html" \) -exec sed -i "" "s|${key}|${value}|g" '{}' +
done