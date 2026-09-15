#!/usr/bin/env bash
set -euo pipefail

VALE_VERSION="${VALE_VERSION:-3.21.0}"
TARGET="$1"
PLATFORM="$2"
VALE_ASSET="vale_${VALE_VERSION}_$3"
REF_NAME="${RELEASE_VERSION:-${GITHUB_REF_NAME:-}}"
SNIFF_VERSION="${REF_NAME#v}"
SNIFF_VERSION="${SNIFF_VERSION:-$(cargo metadata --no-deps --format-version 1 | sed -n 's/.*"version":"\([^"]*\)".*/\1/p')}"
STAGING="$(mktemp -d)"
PACKAGE="sniff-${SNIFF_VERSION}-${PLATFORM}"
trap 'rm -rf "$STAGING"' EXIT

cargo build --release --locked --target "$TARGET"
curl --fail --location --silent --show-error \
  "https://github.com/vale-cli/vale/releases/download/v${VALE_VERSION}/${VALE_ASSET}" \
  --output "$STAGING/$VALE_ASSET"
curl --fail --location --silent --show-error \
  "https://github.com/vale-cli/vale/releases/download/v${VALE_VERSION}/vale_${VALE_VERSION}_checksums.txt" \
  --output "$STAGING/checksums.txt"
(cd "$STAGING" && grep " ${VALE_ASSET}$" checksums.txt | shasum -a 256 --check)
tar -xzf "$STAGING/$VALE_ASSET" -C "$STAGING"

mkdir -p "$STAGING/$PACKAGE"
cp "target/$TARGET/release/sniff" "$STAGING/$PACKAGE/sniff"
cp "$(find "$STAGING" -type f -name vale -perm -u+x | head -n 1)" "$STAGING/$PACKAGE/vale"
cp LICENSE "$STAGING/$PACKAGE/LICENSE-sniff"
curl --fail --location --silent --show-error \
  "https://raw.githubusercontent.com/vale-cli/vale/v${VALE_VERSION}/LICENSE" \
  --output "$STAGING/$PACKAGE/LICENSE-vale"
tar -czf "$PACKAGE.tar.gz" -C "$STAGING" "$PACKAGE"
shasum -a 256 "$PACKAGE.tar.gz" > "$PACKAGE.tar.gz.sha256"
