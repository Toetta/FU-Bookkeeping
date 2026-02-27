#!/bin/bash
set -euo pipefail

echo "[Xcode Cloud] ci_pre_xcodebuild.sh starting"

# If CI_BUILD_NUMBER is set, use it as the build number via agvtool
if [ -n "${CI_BUILD_NUMBER:-}" ]; then
  echo "Setting build number to ${CI_BUILD_NUMBER} via agvtool"
  agvtool new-version -all "${CI_BUILD_NUMBER}" || echo "agvtool failed; ensure Apple Generic Versioning is enabled"
fi

# Derive APP_VERSION from CI_TAG if present (e.g., v1.2.3 or 1.2.3)
if [ -z "${APP_VERSION:-}" ] && [ -n "${CI_TAG:-}" ]; then
  if [[ "$CI_TAG" =~ ^v?([0-9]+\.[0-9]+\.[0-9]+)$ ]]; then
    APP_VERSION="${BASH_REMATCH[1]}"
    export APP_VERSION
    echo "Derived APP_VERSION=${APP_VERSION} from CI_TAG=${CI_TAG}"
  else
    echo "CI_TAG '${CI_TAG}' does not look like a semantic version; skipping APP_VERSION derivation"
  fi
fi

# Optionally set a marketing version from an environment variable
if [ -n "${APP_VERSION:-}" ]; then
  echo "Setting marketing version to ${APP_VERSION} via agvtool"
  agvtool new-marketing-version "${APP_VERSION}" || echo "agvtool failed to set marketing version"
fi

echo "[Xcode Cloud] ci_pre_xcodebuild.sh finished"
