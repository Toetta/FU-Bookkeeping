#!/bin/bash
set -euo pipefail

echo "[Xcode Cloud] ci_post_clone.sh starting"
echo "Workflow: ${CI_WORKFLOW:-unknown}"
echo "Branch: ${CI_BRANCH:-unknown}"
echo "Build number: ${CI_BUILD_NUMBER:-unknown}"

echo "-- Detecting Capacitor config and web project --"
CONFIG_PATH=$(git ls-files | grep -E "capacitor\.config\.(ts|json)$" | head -n 1 || true)
if [ -n "${CONFIG_PATH}" ]; then
  WEB_DIR=$(dirname "$CONFIG_PATH")
else
  WEB_DIR="."
fi

echo "Capacitor config path: ${CONFIG_PATH:-not found}"
echo "Web directory: ${WEB_DIR}"

pushd "$WEB_DIR" >/dev/null || true

# If Node/npm is available, install and build web assets
if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
  if [ -f "package.json" ]; then
    echo "-- Installing npm dependencies (npm ci) --"
    if npm ci; then
      echo "npm ci completed"
    else
      echo "npm ci failed; attempting npm install"
      npm install
    fi

    echo "-- Building web assets (npm run build) --"
    if npm run build; then
      echo "Web build completed"
    else
      echo "npm run build failed; attempting 'npx ionic build' as fallback"
      if command -v npx >/dev/null 2>&1; then
        npx ionic build || echo "ionic build failed; continuing without web build"
      else
        echo "npx not available; skipping ionic build"
      fi
    fi
  else
    echo "package.json not found in ${WEB_DIR}; skipping npm steps"
  fi
else
  echo "Node/npm not found; skipping web build. If your app requires fresh web assets, ensure they are committed or install Node in CI."
fi

# Sync Capacitor iOS platform if npx is available and we found a Capacitor config
if [ -n "${CONFIG_PATH}" ] && command -v npx >/dev/null 2>&1; then
  echo "-- Running 'npx cap sync ios' --"
  npx cap sync ios || echo "cap sync ios failed; continuing"
else
  echo "Skipping 'cap sync ios' (no config found or npx missing)"
fi

popd >/dev/null || true

# Install SwiftLint via SwiftPM if not present
SWIFTLINT_BIN="$CI_WORKSPACE/.build/artifacts/swiftlint/swiftlint"
if [ ! -x "$SWIFTLINT_BIN" ]; then
  echo "-- Installing SwiftLint via SwiftPM --"
  git clone --depth 1 https://github.com/realm/SwiftLint.git /tmp/SwiftLint
  pushd /tmp/SwiftLint >/dev/null
  swift build -c release --product swiftlint
  mkdir -p "$(dirname "$SWIFTLINT_BIN")"
  cp .build/release/swiftlint "$SWIFTLINT_BIN"
  popd >/dev/null
else
  echo "SwiftLint already available at $SWIFTLINT_BIN"
fi

# CocoaPods (optional): if a Podfile exists, run pod install in its directory
PODFILE_PATH=$(git ls-files | grep -E "(^|/)Podfile$" | head -n 1 || true)
if [ -n "$PODFILE_PATH" ]; then
  POD_DIR=$(dirname "$PODFILE_PATH")
  echo "-- Running 'pod install' in ${POD_DIR} --"
  pushd "$POD_DIR" >/dev/null || true
  if command -v pod >/dev/null 2>&1; then
    pod install || echo "pod install failed; continuing"
  else
    echo "CocoaPods not installed on runner; skipping pod install"
  fi
  popd >/dev/null || true
else
  echo "No Podfile found; skipping CocoaPods"
fi

echo "[Xcode Cloud] ci_post_clone.sh finished"
