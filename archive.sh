set -e
snapshot_root="$(mktemp -d "${TMPDIR:-/tmp}/sdd-archive.XXXXXX")"
trap 'rm -rf -- "$snapshot_root"' EXIT
cp -R "openspec/changes/frontend-cursos-feature" "$snapshot_root/source"

mkdir -p openspec/changes/archive

# Try git mv first, if it fails because it's not tracked or outside git tree, fallback to mv
if git mv openspec/changes/frontend-cursos-feature openspec/changes/archive/2026-08-23-frontend-cursos-feature 2>/dev/null; then
  :
else
  mv openspec/changes/frontend-cursos-feature openspec/changes/archive/2026-08-23-frontend-cursos-feature
fi

if [ -e "openspec/changes/frontend-cursos-feature" ] || [ -L "openspec/changes/frontend-cursos-feature" ]; then
  printf 'archive move left the source directory in place\n' >&2
  exit 1
fi

diff -r "$snapshot_root/source" "openspec/changes/archive/2026-08-23-frontend-cursos-feature"
