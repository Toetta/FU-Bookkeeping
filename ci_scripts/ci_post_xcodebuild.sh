#!/bin/bash
set -euo pipefail

echo "[Xcode Cloud] ci_post_xcodebuild.sh starting"

# Example: run SwiftLint if present in repo or built during post-clone
SWIFTLINT_BIN="$CI_WORKSPACE/.build/artifacts/swiftlint/swiftlint"
if [ -x "$SWIFTLINT_BIN" ]; then
  echo "Running SwiftLint"
  "$SWIFTLINT_BIN" --strict || echo "SwiftLint reported issues"
else
  echo "SwiftLint not found; skipping"
fi

# Example: symbol upload hooks (Firebase Crashlytics, Sentry, etc.) can be added here
# Use Xcode Cloud environment variables/secrets for tokens.

echo "[Xcode Cloud] ci_post_xcodebuild.sh finished"
