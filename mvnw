#!/bin/sh
# ----------------------------------------------------------------------------
# Maven Wrapper script for Linux / macOS / Unix (Root delegator)
# ----------------------------------------------------------------------------

set -e

if [ -f "./server/mvnw" ]; then
  exec ./server/mvnw -f ./server/pom.xml "$@"
elif command -v mvn >/dev/null 2>&1; then
  exec mvn -f ./server/pom.xml "$@"
else
  echo "Error: Maven not found." >&2
  exit 1
fi
