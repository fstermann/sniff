#!/bin/sh
set -eu

REPOSITORY="fstermann/sniff"
VERSION="${SNIFF_VERSION:-latest}"
INSTALL_DIR="${SNIFF_INSTALL_DIR:-$HOME/.local/bin}"

usage() {
  cat <<'EOF'
Install sniff and its bundled Vale runtime.

Usage: install.sh [--version VERSION] [--to DIRECTORY]

Environment variables:
  SNIFF_VERSION       Release version (default: latest)
  SNIFF_INSTALL_DIR   Binary directory (default: ~/.local/bin)
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --version) VERSION="${2:?--version requires a value}"; shift 2 ;;
    --to) INSTALL_DIR="${2:?--to requires a value}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "error: unknown argument: $1" >&2; usage >&2; exit 2 ;;
  esac
done

case "$(uname -s)" in
  Darwin) OS=macos ;;
  Linux) OS=linux ;;
  *) echo "error: unsupported operating system: $(uname -s)" >&2; exit 1 ;;
esac

case "$(uname -m)" in
  x86_64|amd64) ARCH=x86_64 ;;
  arm64|aarch64) ARCH=aarch64 ;;
  *) echo "error: unsupported architecture: $(uname -m)" >&2; exit 1 ;;
esac

if [ "$OS-$ARCH" = "linux-aarch64" ]; then
  echo "error: Linux ARM64 release archives are not available yet" >&2
  exit 1
fi

command -v curl >/dev/null 2>&1 || { echo "error: curl is required" >&2; exit 1; }
command -v tar >/dev/null 2>&1 || { echo "error: tar is required" >&2; exit 1; }

PLATFORM="$OS-$ARCH"
if [ "$VERSION" = latest ]; then
  BASE="https://github.com/$REPOSITORY/releases/latest/download"
else
  VERSION=${VERSION#v}
  BASE="https://github.com/$REPOSITORY/releases/download/v$VERSION"
fi
ARCHIVE="sniff-${VERSION}-${PLATFORM}.tar.gz"

# GitHub's latest redirect cannot substitute the version into an asset name, so
# discover the release tag without requiring jq.
if [ "$VERSION" = latest ]; then
  TAG=$(curl --fail --location --silent --show-error \
    -o /dev/null -w '%{url_effective}' "https://github.com/$REPOSITORY/releases/latest")
  VERSION=${TAG##*/}
  VERSION=${VERSION#v}
  ARCHIVE="sniff-${VERSION}-${PLATFORM}.tar.gz"
fi

TMPDIR_SNIFF=$(mktemp -d)
trap 'rm -rf "$TMPDIR_SNIFF"' EXIT HUP INT TERM

curl --fail --location --silent --show-error "$BASE/$ARCHIVE" -o "$TMPDIR_SNIFF/$ARCHIVE"
curl --fail --location --silent --show-error "$BASE/$ARCHIVE.sha256" -o "$TMPDIR_SNIFF/$ARCHIVE.sha256"

EXPECTED=$(awk '{print $1; exit}' "$TMPDIR_SNIFF/$ARCHIVE.sha256")
if command -v sha256sum >/dev/null 2>&1; then
  ACTUAL=$(sha256sum "$TMPDIR_SNIFF/$ARCHIVE" | awk '{print $1}')
else
  ACTUAL=$(shasum -a 256 "$TMPDIR_SNIFF/$ARCHIVE" | awk '{print $1}')
fi
[ "$EXPECTED" = "$ACTUAL" ] || { echo "error: archive checksum mismatch" >&2; exit 1; }

tar -xzf "$TMPDIR_SNIFF/$ARCHIVE" -C "$TMPDIR_SNIFF"
PACKAGE="$TMPDIR_SNIFF/sniff-${VERSION}-${PLATFORM}"
mkdir -p "$INSTALL_DIR" "$INSTALL_DIR/libexec/sniff"
install -m 755 "$PACKAGE/sniff" "$INSTALL_DIR/sniff"
install -m 755 "$PACKAGE/vale" "$INSTALL_DIR/libexec/sniff/vale"
install -m 644 "$PACKAGE/LICENSE-sniff" "$INSTALL_DIR/libexec/sniff/LICENSE-sniff"
install -m 644 "$PACKAGE/LICENSE-vale" "$INSTALL_DIR/libexec/sniff/LICENSE-vale"

echo "Installed sniff to $INSTALL_DIR/sniff"
case ":${PATH:-}:" in
  *:"$INSTALL_DIR":*) ;;
  *) echo "Add $INSTALL_DIR to PATH to run: sniff" ;;
esac
