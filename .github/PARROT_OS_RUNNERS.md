# Parrot OS Runner Configuration

This document describes the migration from Ubuntu to Parrot OS runners for GitHub Actions workflows.

## Overview

All Linux-based CI/CD jobs in this repository now run on self-hosted Parrot OS runners instead of GitHub-hosted Ubuntu runners. This change aligns with the project's OSINT investigation focus and ensures compatibility with Parrot OS, a security-focused Debian-based distribution.

## Workflow Changes

### Affected Workflows

1. **`.github/workflows/ci.yml`**
   - Test job: `runs-on: parrot-os`
   - Security audit job: `runs-on: parrot-os`
   - Build job (Linux matrix): `parrot-os` instead of `ubuntu-latest`

2. **`.github/workflows/codeql.yml`**
   - CodeQL analysis job: `runs-on: parrot-os`

3. **`.github/workflows/release.yml`**
   - Linux build job: `runs-on: parrot-os`
   - Release creation job: `runs-on: parrot-os`

### Runner Label

All Linux jobs use the `parrot-os` runner label, which should be configured as a self-hosted runner.

## Self-Hosted Runner Setup

To set up a self-hosted Parrot OS runner:

### Prerequisites

- Parrot OS system (Security Edition or Home Edition)
- Sudo/root access
- Network connectivity to GitHub

### Installation Steps

1. **Navigate to Repository Settings**
   - Go to: https://github.com/thumpersecure/Spin/settings/actions/runners
   - Click "New self-hosted runner"
   - Select "Linux" as the operating system

2. **Install Runner on Parrot OS**
   ```bash
   # Create a runner directory
   mkdir actions-runner && cd actions-runner
   
   # Download the latest runner package
   curl -o actions-runner-linux-x64-2.311.0.tar.gz -L \
     https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
   
   # Extract the installer
   tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
   ```

3. **Configure the Runner**
   ```bash
   # Configure with the token from GitHub
   ./config.sh --url https://github.com/thumpersecure/Spin --token <YOUR_TOKEN>
   
   # When prompted for labels, add: parrot-os
   ```

4. **Install as a Service**
   ```bash
   # Install dependencies
   sudo apt-get update
   sudo apt-get install -y libarchive-tools build-essential
   
   # Install the runner service
   sudo ./svc.sh install
   sudo ./svc.sh start
   ```

### Required System Dependencies

The Parrot OS runner must have the following installed:

- **Node.js** (20.x or 22.x via actions/setup-node)
- **Git** (for repository checkout)
- **Build tools**: `build-essential`
- **Electron dependencies**: `libarchive-tools`
- **Standard Debian packages**: `curl`, `tar`, `gzip`

Most of these are pre-installed on Parrot OS or will be installed automatically by GitHub Actions.

## Compatibility Notes

### Why Parrot OS?

1. **Target Audience Alignment**: Parrot OS is widely used by security professionals and OSINT investigators
2. **Debian-Based**: Full compatibility with `apt-get` and Debian package ecosystem
3. **Security Focus**: Enhanced privacy and security tools pre-installed
4. **Testing Parity**: Ensures builds work correctly on the target platform

### Package Management

Parrot OS uses `apt-get` (APT package manager) just like Ubuntu and Debian:
- All `apt-get` commands in workflows remain unchanged
- Package repositories are Debian-compatible
- No changes needed for Node.js/npm tooling

### Known Compatible Actions

All GitHub Actions used in the workflows are compatible with Parrot OS:
- ✅ `actions/checkout@v4`
- ✅ `actions/setup-node@v4`
- ✅ `actions/upload-artifact@v4`
- ✅ `actions/download-artifact@v4`
- ✅ `codecov/codecov-action@v5`
- ✅ `github/codeql-action/*`
- ✅ `softprops/action-gh-release@v2`

### Electron Builder

The Electron builds for Linux generate:
- **AppImage** - Universal Linux binary
- **DEB Package** - Debian/Ubuntu/Parrot OS package
- **TAR.GZ** - Portable archive

All formats work natively on Parrot OS.

## Testing

### Workflow Validation

To test the Parrot OS runner setup:

1. **Trigger a Test Run**
   ```bash
   # Push to develop branch to trigger CI
   git checkout -b test-parrot-runner
   git commit --allow-empty -m "Test Parrot OS runner"
   git push origin test-parrot-runner
   ```

2. **Verify Jobs**
   - Check that all jobs show `parrot-os` as the runner
   - Verify builds complete successfully
   - Check artifacts are uploaded correctly

3. **Common Issues**
   - **Runner offline**: Check `sudo ./svc.sh status`
   - **Permission errors**: Ensure runner user has sudo access
   - **Build failures**: Check system dependencies are installed

## Migration Checklist

- [x] Update ci.yml test job to use parrot-os
- [x] Update ci.yml security job to use parrot-os
- [x] Update ci.yml build matrix to use parrot-os
- [x] Update codeql.yml to use parrot-os
- [x] Update release.yml build-linux job to use parrot-os
- [x] Update release.yml release job to use parrot-os
- [x] Update CLAUDE.md documentation
- [x] Create PARROT_OS_RUNNERS.md documentation

## Rollback Procedure

If needed, revert to Ubuntu runners by:

1. Replace `parrot-os` with `ubuntu-latest` in workflow files
2. Update matrix.os conditionals from `parrot-os` back to `ubuntu-latest`
3. Commit and push changes

```bash
# Quick rollback command
find .github/workflows -name "*.yml" -exec sed -i 's/parrot-os/ubuntu-latest/g' {} \;
```

## Support

For issues with:
- **Runner setup**: See [GitHub Actions self-hosted runner docs](https://docs.github.com/en/actions/hosting-your-own-runners)
- **Parrot OS**: See [Parrot OS documentation](https://parrotsec.org/docs/)
- **Workflow failures**: Check workflow logs in the Actions tab

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Self-hosted Runners](https://docs.github.com/en/actions/hosting-your-own-runners)
- [Parrot Security OS](https://parrotsec.org/)
- [Electron Builder](https://www.electron.build/)
