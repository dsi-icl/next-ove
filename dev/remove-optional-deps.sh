# Temporary script to remove tree-sitter dependencies as they are optional and
# fail to find the necessary prebuilt binaries.

rm -rf node_modules/tree-sitter
rm -rf node_modules/tree-sitter-json
rm -rf node_modules/tree-sitter-yaml