#!/bin/bash

set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
OUTPUT="./programs/.bin"
# go to parent folder; quoted so a checkout path containing spaces cannot make
# `cd` fail silently and delete the wrong `programs/.bin`
cd "$(dirname "$(dirname "$(dirname "${SCRIPT_DIR}")")")"

rm -rf -- "${OUTPUT:?}"

if [ -z ${PROGRAMS+x} ]; then
    PROGRAMS="$(cat .github/.env | grep "PROGRAMS" | cut -d '=' -f 2)"
fi

PROGRAMS=$(echo ${PROGRAMS} | jq -c '.[]' | sed 's/"//g')
WORKING_DIR=$(pwd)

for p in ${PROGRAMS[@]}; do
    # The programs are members of the root cargo workspace, so their build
    # artifacts live in the workspace `target` directory rather than in
    # `programs/${p}/target`; `cargo clean` removes the right one either way.
    cargo clean --manifest-path ./programs/${p}/Cargo.toml
    rm -rf ${WORKING_DIR}/programs/${p}/target
done
