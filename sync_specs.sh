set -e
# course-enrollment
target_dir="openspec/specs/course-enrollment"
target_path="$target_dir/spec.md"
mkdir -p "$target_dir"
temp_path="$(mktemp "$target_dir/.spec.md.XXXXXX")"
cp "openspec/changes/frontend-cursos-feature/specs/course-enrollment/spec.md" "$temp_path"
diff -r "openspec/changes/frontend-cursos-feature/specs/course-enrollment/spec.md" "$temp_path"
mv "$temp_path" "$target_path"

# course-management
target_dir2="openspec/specs/course-management"
target_path2="$target_dir2/spec.md"
mkdir -p "$target_dir2"
temp_path2="$(mktemp "$target_dir2/.spec.md.XXXXXX")"
cp "openspec/changes/frontend-cursos-feature/specs/course-management/spec.md" "$temp_path2"
diff -r "openspec/changes/frontend-cursos-feature/specs/course-management/spec.md" "$temp_path2"
mv "$temp_path2" "$target_path2"
