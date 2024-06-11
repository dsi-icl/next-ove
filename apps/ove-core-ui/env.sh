#!/bin/sh
for i in $(env | grep NEXT_OVE_)
do
    key=$(echo "$i" | cut -d '=' -f 1)
    value=$(echo "$i" | cut -d '=' -f 2-)
    echo "$key"="$value"
    find /usr/src/app/ui -type f -exec sed -i "s|${key}|${value}|g" '{}' +
done