#!/bin/bash
# Validation script for Parrot OS runner migration
# This script checks that all Linux runners use parrot-os instead of ubuntu-latest

set -e

echo "========================================="
echo "Parrot OS Runner Migration Validator"
echo "========================================="
echo ""

WORKFLOW_DIR=".github/workflows"
FAILED=0

# Check for any remaining ubuntu-latest references in workflow files
echo "[1/4] Checking for ubuntu-latest references..."
if grep -r "ubuntu-latest" "$WORKFLOW_DIR" >/dev/null 2>&1; then
    echo "❌ FAIL: Found ubuntu-latest references in workflow files:"
    grep -rn "ubuntu-latest" "$WORKFLOW_DIR"
    FAILED=1
else
    echo "✅ PASS: No ubuntu-latest references found"
fi
echo ""

# Verify parrot-os is used in expected places
echo "[2/4] Verifying parrot-os runner usage..."
PARROT_COUNT=$(grep -r "parrot-os" "$WORKFLOW_DIR" | wc -l)
if [ "$PARROT_COUNT" -lt 6 ]; then
    echo "❌ FAIL: Expected at least 6 parrot-os references, found $PARROT_COUNT"
    FAILED=1
else
    echo "✅ PASS: Found $PARROT_COUNT parrot-os references"
fi
echo ""

# Validate YAML syntax
echo "[3/4] Validating YAML syntax..."
for file in "$WORKFLOW_DIR"/*.yml "$WORKFLOW_DIR"/*.yaml; do
    if [ -f "$file" ]; then
        if python3 -c "import yaml; yaml.safe_load(open('$file'))" 2>/dev/null; then
            echo "✅ Valid: $(basename $file)"
        else
            echo "❌ Invalid: $(basename $file)"
            FAILED=1
        fi
    fi
done
echo ""

# Check documentation
echo "[4/4] Checking documentation..."
if [ -f ".github/PARROT_OS_RUNNERS.md" ]; then
    echo "✅ PASS: PARROT_OS_RUNNERS.md exists"
else
    echo "❌ FAIL: PARROT_OS_RUNNERS.md not found"
    FAILED=1
fi

if grep -q "Parrot OS" "CLAUDE.md" 2>/dev/null; then
    echo "✅ PASS: CLAUDE.md updated with Parrot OS info"
else
    echo "❌ FAIL: CLAUDE.md not updated"
    FAILED=1
fi
echo ""

# Final result
echo "========================================="
if [ $FAILED -eq 0 ]; then
    echo "✅ All validation checks passed!"
    echo "========================================="
    exit 0
else
    echo "❌ Some validation checks failed"
    echo "========================================="
    exit 1
fi
