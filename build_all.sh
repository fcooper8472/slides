#!/usr/bin/env bash
set -euo pipefail

pushd "$(dirname "$0")" > /dev/null

rm -rf build dist
mkdir -p build dist

for dir in presentations/*/; do
    ./build.sh "$dir"
done

node ./scripts/build-index.mjs

popd > /dev/null
