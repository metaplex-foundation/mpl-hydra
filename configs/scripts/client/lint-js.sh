#!/bin/bash

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
# go to parent folder
cd $(dirname $(dirname $(dirname $SCRIPT_DIR)))
WORKING_DIR=$(pwd)

# js client folder
cd ${WORKING_DIR}/clients/js

pnpm install && pnpm format && pnpm lint
