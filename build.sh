#!/usr/bin/env bash

set -euo pipefail

pushd "$(dirname "$0")" > /dev/null

if [ $# -lt 1 ]; then
    echo "Usage: $0 <presentation_directory>" >&2
    exit 1
fi

dir="$1"

presentation_name=$(basename "$dir")
echo "Presentation name: $presentation_name"

mkdir -p build/${presentation_name}

cp -r presentations/${presentation_name}/* build/${presentation_name}/

npx slidev build --out dist --base "./" build/${presentation_name}/slides.md

# Remove all except 'dist' folder
mv build/${presentation_name}/dist dist/${presentation_name}
rm -rf build/${presentation_name}

popd > /dev/null
