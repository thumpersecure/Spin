#!/usr/bin/env bash
#
# Spin OSINT Browser - Interactive Installer
# v12.0.3 "Jessica Jones"
#
# Usage: curl -fsSL https://raw.githubusercontent.com/thumpersecure/Spin/main/install.sh | bash
#    or: bash install.sh
#
# Zero NPM — Pure Rust (iced 0.13 + wry 0.44)
# Only requires: git, rust/cargo, system GUI libraries
#

set -euo pipefail

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# --- Config ---
REPO_URL="https://github.com/thumpersecure/Spin.git"
REPO_API="https://api.github.com/repos/thumpersecure/Spin"
INSTALL_DIR="$HOME/Spin"
APP_DIR="$INSTALL_DIR/app"
CARGO_DIR="$APP_DIR/src-tauri"
BIN_PATH="$CARGO_DIR/target/release/spin"
MIN_RUST_VERSION="1.75"
CURRENT_VERSION="12.0.3"

# --- Helpers ---
print_banner() {
    echo -e "${PURPLE}"
    echo "  ╔══════════════════════════════════════════════════╗"
    echo "  ║                                                  ║"
    echo "  ║       S P I N   v12.0.3 - Jessica Jones           ║"
    echo "  ║       OSINT Investigation Browser                ║"
    echo "  ║                                                  ║"
    echo "  ║  \"Every case starts with a question.\"            ║"
    echo "  ║                                                  ║"
    echo "  ║  Zero NPM · Pure Rust · iced 0.13 · wry          ║"
    echo "  ║                                                  ║"
    echo "  ╚══════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; }

ask_yes_no() {
    local prompt="$1"
    local default="${2:-y}"
    local choice
    if [ "$default" = "y" ]; then
        read -rp "$(echo -e "${CYAN}$prompt [Y/n]:${NC} ")" choice
        choice="${choice:-y}"
    else
        read -rp "$(echo -e "${CYAN}$prompt [y/N]:${NC} ")" choice
        choice="${choice:-n}"
    fi
    [[ "$choice" =~ ^[Yy] ]]
}

version_ge() {
    # Returns 0 if $1 >= $2 (version comparison)
    printf '%s\n%s' "$2" "$1" | sort -V -C
}

detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    else
        echo "unknown"
    fi
}

detect_linux_distro() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        echo "$ID"
    else
        echo "unknown"
    fi
}

# --- Dependency Checks ---

check_git() {
    if command -v git &>/dev/null; then
        local ver
        ver=$(git --version | grep -oP '\d+\.\d+\.\d+' | head -1)
        success "Git found: v$ver"
        return 0
    else
        warn "Git not found"
        return 1
    fi
}

check_rust() {
    if command -v rustc &>/dev/null && command -v cargo &>/dev/null; then
        local ver
        ver=$(rustc --version | grep -oP '\d+\.\d+\.\d+' | head -1)
        if version_ge "$ver" "$MIN_RUST_VERSION"; then
            success "Rust found: v$ver (>= $MIN_RUST_VERSION required)"
            return 0
        else
            warn "Rust v$ver found, but v$MIN_RUST_VERSION+ required"
            return 1
        fi
    else
        warn "Rust not found"
        return 1
    fi
}

# --- Install Functions ---

install_rust() {
    info "Installing Rust via rustup..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env" 2>/dev/null || true
}

install_linux_deps() {
    local distro
    distro=$(detect_linux_distro)
    info "Installing system libraries for $distro..."
    case "$distro" in
        ubuntu|debian|parrot|kali|linuxmint|pop)
            sudo apt-get update
            sudo apt-get install -y \
                libgtk-3-dev \
                libwebkit2gtk-4.1-dev \
                libayatana-appindicator3-dev \
                librsvg2-dev \
                patchelf \
                build-essential \
                curl \
                wget \
                file \
                libssl-dev \
                libxdo-dev
            ;;
        fedora|rhel|centos|rocky|alma)
            sudo dnf install -y \
                gtk3-devel \
                webkit2gtk4.1-devel \
                libappindicator-gtk3-devel \
                librsvg2-devel \
                patchelf \
                openssl-devel
            ;;
        arch|manjaro|endeavouros)
            sudo pacman -S --noconfirm \
                gtk3 \
                webkit2gtk-4.1 \
                libappindicator-gtk3 \
                librsvg \
                patchelf \
                openssl
            ;;
        *)
            warn "Unsupported distro: $distro. You may need to install GTK3 and WebKit2GTK manually."
            ;;
    esac
}

install_macos_deps() {
    if ! command -v brew &>/dev/null; then
        info "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
}

# --- Uninstall ---

uninstall_spin() {
    echo ""
    info "Uninstalling Spin..."

    if [ -d "$INSTALL_DIR" ]; then
        if ask_yes_no "Remove $INSTALL_DIR?"; then
            rm -rf "$INSTALL_DIR"
            success "Removed $INSTALL_DIR"
        fi
    else
        info "No installation found at $INSTALL_DIR"
    fi

    # Remove desktop shortcut
    local desktop_file
    if [ "$(detect_os)" = "linux" ]; then
        desktop_file="$HOME/.local/share/applications/spin-browser.desktop"
        if [ -f "$desktop_file" ]; then
            rm -f "$desktop_file"
            success "Removed desktop shortcut"
        fi
        if [ -f "$HOME/Desktop/spin-browser.desktop" ]; then
            rm -f "$HOME/Desktop/spin-browser.desktop"
            success "Removed Desktop shortcut"
        fi
    elif [ "$(detect_os)" = "macos" ]; then
        if [ -L "/Applications/Spin.app" ]; then
            rm -f "/Applications/Spin.app"
            success "Removed /Applications/Spin.app symlink"
        fi
    fi

    success "Uninstall complete."
    echo ""
}

# --- Desktop Shortcut ---

create_desktop_shortcut() {
    local os
    os=$(detect_os)

    if [ "$os" = "linux" ]; then
        local icon_path="$INSTALL_DIR/assets/icon.png"
        local desktop_entry="[Desktop Entry]
Name=Spin Browser
Comment=OSINT Investigation Browser - Jessica Jones v12.0.3
Exec=$BIN_PATH
Icon=$icon_path
Terminal=false
Type=Application
Categories=Network;WebBrowser;Security;
StartupNotify=true"

        # App menu entry
        mkdir -p "$HOME/.local/share/applications"
        echo "$desktop_entry" > "$HOME/.local/share/applications/spin-browser.desktop"
        chmod +x "$HOME/.local/share/applications/spin-browser.desktop"
        success "Created app menu entry"

        # Desktop shortcut
        if [ -d "$HOME/Desktop" ]; then
            echo "$desktop_entry" > "$HOME/Desktop/spin-browser.desktop"
            chmod +x "$HOME/Desktop/spin-browser.desktop"
            success "Created Desktop shortcut"
        fi

    elif [ "$os" = "macos" ]; then
        info "On macOS, copy the built binary to your PATH:"
        echo "  sudo cp $BIN_PATH /usr/local/bin/spin"
        echo "  spin"
    fi
}

# --- Main Install ---

do_install() {
    echo ""
    info "Starting installation..."
    echo ""

    # Step 1: Check/install dependencies
    echo -e "${BOLD}Step 1: Checking dependencies...${NC}"
    echo ""

    local need_rust=false

    check_git || { error "Git is required. Please install it first."; exit 1; }

    if ! check_rust; then
        need_rust=true
    fi

    echo ""

    # Install missing deps
    local os
    os=$(detect_os)

    if [ "$need_rust" = true ]; then
        if ask_yes_no "Install Rust?"; then
            install_rust
            check_rust || { error "Rust installation failed."; exit 1; }
        else
            error "Rust $MIN_RUST_VERSION+ is required. Aborting."
            exit 1
        fi
    fi

    # System libraries
    echo ""
    echo -e "${BOLD}Step 2: System libraries...${NC}"
    echo ""
    if [ "$os" = "linux" ]; then
        if ask_yes_no "Install system libraries (GTK3, WebKit2GTK, etc.)?"; then
            install_linux_deps
        fi
    elif [ "$os" = "macos" ]; then
        install_macos_deps
    fi

    # Step 3: Clone or update repo
    echo ""
    echo -e "${BOLD}Step 3: Getting Spin source code...${NC}"
    echo ""

    if [ -d "$INSTALL_DIR/.git" ]; then
        info "Existing installation found at $INSTALL_DIR"
        if ask_yes_no "Update to latest version?"; then
            cd "$INSTALL_DIR"
            git pull origin main
            success "Updated to latest"
        fi
    else
        if [ -d "$INSTALL_DIR" ]; then
            warn "$INSTALL_DIR exists but is not a git repo"
            if ask_yes_no "Remove and re-clone?"; then
                rm -rf "$INSTALL_DIR"
            else
                error "Cannot continue. Please remove $INSTALL_DIR manually."
                exit 1
            fi
        fi
        info "Cloning Spin..."
        git clone "$REPO_URL" "$INSTALL_DIR"
        success "Cloned to $INSTALL_DIR"
    fi

    # Step 4: Fetch Rust dependencies
    echo ""
    echo -e "${BOLD}Step 4: Fetching Rust dependencies...${NC}"
    echo ""

    cd "$CARGO_DIR"
    cargo fetch
    success "Rust dependencies fetched"

    # Step 5: Build verification
    echo ""
    echo -e "${BOLD}Step 5: Verifying build...${NC}"
    echo ""

    info "Running cargo check..."
    if cargo check 2>&1; then
        success "Rust build check: OK"
    else
        warn "cargo check had issues — see above. The build may still succeed."
    fi

    # Step 6: Desktop shortcut
    echo ""
    if ask_yes_no "Create a desktop shortcut?"; then
        info "Building release binary first (required for shortcut)..."
        cargo build --release
        success "Built: $BIN_PATH"
        create_desktop_shortcut
    fi

    # Done!
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                  ║${NC}"
    echo -e "${GREEN}║   Installation complete!                         ║${NC}"
    echo -e "${GREEN}║                                                  ║${NC}"
    echo -e "${GREEN}║   To run Spin (dev):                             ║${NC}"
    echo -e "${GREEN}║     cd ~/Spin/app/src-tauri && cargo run         ║${NC}"
    echo -e "${GREEN}║                                                  ║${NC}"
    echo -e "${GREEN}║   To build for production:                       ║${NC}"
    echo -e "${GREEN}║     cd ~/Spin/app/src-tauri                      ║${NC}"
    echo -e "${GREEN}║     cargo build --release                        ║${NC}"
    echo -e "${GREEN}║                                                  ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
    echo ""

    # Verification
    verify_install
}

# --- Verification ---

verify_install() {
    echo -e "${BOLD}Verification:${NC}"
    local all_ok=true

    if [ -d "$APP_DIR" ]; then
        success "App directory exists: $APP_DIR"
    else
        error "App directory missing: $APP_DIR"
        all_ok=false
    fi

    if [ -f "$CARGO_DIR/Cargo.toml" ]; then
        local ver
        ver=$(grep -m1 '^version' "$CARGO_DIR/Cargo.toml" | cut -d'"' -f2)
        success "Rust crate found: v$ver"
    else
        error "Cargo.toml missing at $CARGO_DIR"
        all_ok=false
    fi

    if [ -f "$CARGO_DIR/Cargo.lock" ]; then
        success "Cargo.lock present (dependencies resolved)"
    else
        warn "Cargo.lock missing — run: cd $CARGO_DIR && cargo fetch"
    fi

    if [ -f "$BIN_PATH" ]; then
        success "Release binary built: $BIN_PATH"
    else
        warn "Release binary not built yet"
        info "Build it with: cd $CARGO_DIR && cargo build --release"
    fi

    echo ""
    if [ "$all_ok" = true ]; then
        success "All checks passed. Spin is ready."
    else
        error "Some checks failed. See above for details."
    fi
    echo ""
}

# --- Check for Updates ---

check_for_updates() {
    echo ""
    info "Checking for updates..."
    echo ""

    # Read local version from Cargo.toml
    local local_version="(not installed)"
    if [ -f "$CARGO_DIR/Cargo.toml" ]; then
        local_version=$(grep -m1 '^version' "$CARGO_DIR/Cargo.toml" | cut -d'"' -f2)
    fi

    info "Installed version: ${BOLD}$local_version${NC}"
    info "Installer version: ${BOLD}$CURRENT_VERSION${NC}"

    # Try to get latest release from GitHub API
    if command -v curl &>/dev/null; then
        local latest_tag
        latest_tag=$(curl -sf "${REPO_API}/releases/latest" 2>/dev/null | grep -o '"tag_name": "[^"]*"' | cut -d'"' -f4)

        if [ -n "$latest_tag" ]; then
            local latest_version="${latest_tag#v}"
            info "Latest release:    ${BOLD}$latest_version${NC}"

            if [ "$local_version" = "(not installed)" ]; then
                warn "Spin is not installed. Use option 1 to install."
            elif [ "$local_version" = "$latest_version" ]; then
                success "You're running the latest release!"
            elif version_ge "$latest_version" "$local_version"; then
                warn "A newer version is available: v$latest_version"
                echo ""
                if ask_yes_no "Would you like to update now?"; then
                    cd "$INSTALL_DIR"
                    git fetch origin main
                    git pull origin main
                    cd "$CARGO_DIR"
                    cargo fetch
                    success "Updated to latest version."
                    echo ""
                    info "Rebuild with: cd $CARGO_DIR && cargo build --release"
                fi
            else
                success "Your version ($local_version) is ahead of the latest release ($latest_version)."
            fi
        else
            warn "Could not fetch latest release info from GitHub."
            info "Check manually: https://github.com/thumpersecure/Spin/releases"
        fi
    else
        warn "curl not available. Cannot check remote version."
    fi

    # Also check if the local git repo has upstream changes
    if [ -d "$INSTALL_DIR/.git" ]; then
        echo ""
        info "Checking git repository for upstream changes..."
        cd "$INSTALL_DIR"
        git fetch origin main 2>/dev/null
        local behind
        behind=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "0")
        if [ "$behind" -gt 0 ]; then
            warn "Your installation is $behind commit(s) behind origin/main."
            if ask_yes_no "Pull latest changes?"; then
                git pull origin main
                cd "$CARGO_DIR"
                cargo fetch
                success "Repository updated."
                info "Rebuild with: cd $CARGO_DIR && cargo build --release"
            fi
        else
            success "Repository is up to date with origin/main."
        fi
    fi

    echo ""
}

# --- Main Menu ---

main() {
    print_banner

    echo -e "${BOLD}What would you like to do?${NC}"
    echo ""
    echo "  1) Install Spin (full installation)"
    echo "  2) Update existing installation"
    echo "  3) Check for updates"
    echo "  4) Uninstall Spin"
    echo "  5) Verify installation"
    echo "  6) Build release binary"
    echo "  7) Exit"
    echo ""
    read -rp "$(echo -e "${CYAN}Choose [1-7]:${NC} ")" choice

    case "$choice" in
        1)
            # Check for old version
            if [ -d "$INSTALL_DIR" ]; then
                warn "Existing Spin installation found at $INSTALL_DIR"
                if ask_yes_no "Would you like to uninstall the old version first? (recommended for stability)"; then
                    uninstall_spin
                fi
            fi
            do_install
            ;;
        2)
            if [ ! -d "$INSTALL_DIR/.git" ]; then
                error "No Spin installation found. Use option 1 to install."
                exit 1
            fi
            cd "$INSTALL_DIR"
            git pull origin main
            cd "$CARGO_DIR"
            cargo fetch
            success "Updated successfully."
            info "Rebuild with: cd $CARGO_DIR && cargo build --release"
            verify_install
            ;;
        3)
            check_for_updates
            ;;
        4)
            uninstall_spin
            ;;
        5)
            verify_install
            ;;
        6)
            if [ ! -f "$CARGO_DIR/Cargo.toml" ]; then
                error "Spin is not installed. Use option 1 to install first."
                exit 1
            fi
            cd "$CARGO_DIR"
            info "Building release binary..."
            cargo build --release
            success "Built: $BIN_PATH"
            info "Run with: $BIN_PATH"
            ;;
        7)
            info "Goodbye."
            exit 0
            ;;
        *)
            error "Invalid choice."
            exit 1
            ;;
    esac
}

main "$@"
