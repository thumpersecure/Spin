#!/usr/bin/env bash
#
# Spin OSINT Browser - Interactive Installer
# v12.0.0 "Jessica Jones"
#
# Usage: curl -fsSL https://raw.githubusercontent.com/thumpersecure/Spin/main/install.sh | bash
#    or: bash install.sh
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
INSTALL_DIR="$HOME/Spin"
APP_DIR="$INSTALL_DIR/app"
MIN_NODE_VERSION=20
MIN_RUST_VERSION="1.75"

# --- Helpers ---
print_banner() {
    echo -e "${PURPLE}"
    echo "  ╔══════════════════════════════════════════════════╗"
    echo "  ║                                                  ║"
    echo "  ║       S P I N   v12 - Jessica Jones              ║"
    echo "  ║       OSINT Investigation Browser                ║"
    echo "  ║                                                  ║"
    echo "  ║  \"Every case starts with a question.\"            ║"
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

check_node() {
    if command -v node &>/dev/null; then
        local ver
        ver=$(node --version | sed 's/v//')
        local major
        major=$(echo "$ver" | cut -d. -f1)
        if [ "$major" -ge "$MIN_NODE_VERSION" ]; then
            success "Node.js found: v$ver (>= $MIN_NODE_VERSION required)"
            return 0
        else
            warn "Node.js v$ver found, but v$MIN_NODE_VERSION+ required"
            return 1
        fi
    else
        warn "Node.js not found"
        return 1
    fi
}

check_rust() {
    if command -v rustc &>/dev/null; then
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

check_tauri_cli() {
    if command -v cargo-tauri &>/dev/null || cargo tauri --version &>/dev/null 2>&1; then
        success "Tauri CLI found"
        return 0
    else
        warn "Tauri CLI not found"
        return 1
    fi
}

# --- Install Functions ---

install_node_macos() {
    if command -v brew &>/dev/null; then
        info "Installing Node.js via Homebrew..."
        brew install node
    else
        info "Installing Homebrew first..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        brew install node
    fi
}

install_node_linux() {
    local distro
    distro=$(detect_linux_distro)
    info "Installing Node.js 20.x for $distro..."
    case "$distro" in
        ubuntu|debian|parrot|kali|linuxmint|pop)
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
        fedora|rhel|centos|rocky|alma)
            curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
            sudo dnf install -y nodejs
            ;;
        arch|manjaro|endeavouros)
            sudo pacman -S --noconfirm nodejs npm
            ;;
        *)
            error "Unsupported distro: $distro. Install Node.js 20+ manually."
            return 1
            ;;
    esac
}

install_rust() {
    info "Installing Rust via rustup..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env" 2>/dev/null || true
}

install_tauri_cli() {
    info "Installing Tauri CLI..."
    cargo install tauri-cli
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
        local desktop_entry="[Desktop Entry]
Name=Spin Browser
Comment=OSINT Investigation Browser - Jessica Jones v12
Exec=bash -c 'cd $APP_DIR && npm run tauri:dev'
Icon=$APP_DIR/public/spin.svg
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
        info "On macOS, you can drag the built app to /Applications after running 'npm run tauri:build'"
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

    local need_node=false
    local need_rust=false
    local need_tauri=false

    check_git || { error "Git is required. Please install it first."; exit 1; }

    if ! check_node; then
        need_node=true
    fi

    if ! check_rust; then
        need_rust=true
    fi

    if ! check_tauri_cli; then
        need_tauri=true
    fi

    echo ""

    # Install missing deps
    local os
    os=$(detect_os)

    if [ "$need_node" = true ]; then
        if ask_yes_no "Install Node.js 20+?"; then
            if [ "$os" = "macos" ]; then
                install_node_macos
            else
                install_node_linux
            fi
            check_node || { error "Node.js installation failed."; exit 1; }
        else
            error "Node.js 20+ is required. Aborting."
            exit 1
        fi
    fi

    if [ "$need_rust" = true ]; then
        if ask_yes_no "Install Rust?"; then
            install_rust
            check_rust || { error "Rust installation failed."; exit 1; }
        else
            error "Rust 1.75+ is required. Aborting."
            exit 1
        fi
    fi

    # System libraries
    echo ""
    echo -e "${BOLD}Step 2: System libraries...${NC}"
    echo ""
    if [ "$os" = "linux" ]; then
        if ask_yes_no "Install system libraries (GTK, WebKit2GTK, etc.)?"; then
            install_linux_deps
        fi
    elif [ "$os" = "macos" ]; then
        install_macos_deps
    fi

    if [ "$need_tauri" = true ]; then
        if ask_yes_no "Install Tauri CLI?"; then
            install_tauri_cli
        fi
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

    # Step 4: Install npm dependencies
    echo ""
    echo -e "${BOLD}Step 4: Installing app dependencies...${NC}"
    echo ""

    cd "$APP_DIR"
    npm install
    success "npm dependencies installed"

    # Step 5: Build verification
    echo ""
    echo -e "${BOLD}Step 5: Verifying build...${NC}"
    echo ""

    info "Running TypeScript check..."
    if npx tsc --noEmit 2>/dev/null; then
        success "TypeScript compilation: OK"
    else
        warn "TypeScript check had issues (may still work)"
    fi

    info "Building frontend..."
    if npm run build 2>/dev/null; then
        success "Frontend build: OK"
    else
        warn "Frontend build had issues"
    fi

    # Step 6: Desktop shortcut
    echo ""
    if ask_yes_no "Create a desktop shortcut?"; then
        create_desktop_shortcut
    fi

    # Done!
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                  ║${NC}"
    echo -e "${GREEN}║   Installation complete!                         ║${NC}"
    echo -e "${GREEN}║                                                  ║${NC}"
    echo -e "${GREEN}║   To start Spin:                                 ║${NC}"
    echo -e "${GREEN}║     cd ~/Spin/app && npm run tauri:dev           ║${NC}"
    echo -e "${GREEN}║                                                  ║${NC}"
    echo -e "${GREEN}║   To build for production:                       ║${NC}"
    echo -e "${GREEN}║     cd ~/Spin/app && npm run tauri:build         ║${NC}"
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

    if [ -f "$APP_DIR/package.json" ]; then
        success "package.json found"
    else
        error "package.json missing"
        all_ok=false
    fi

    if [ -d "$APP_DIR/node_modules" ]; then
        success "node_modules installed"
    else
        error "node_modules missing - run: cd $APP_DIR && npm install"
        all_ok=false
    fi

    if [ -d "$APP_DIR/dist" ]; then
        success "Frontend built successfully"
    else
        warn "Frontend not built yet - will build on first run"
    fi

    if [ -f "$APP_DIR/src-tauri/Cargo.toml" ]; then
        success "Rust backend found"
    else
        error "Rust backend missing"
        all_ok=false
    fi

    echo ""
    if [ "$all_ok" = true ]; then
        success "All checks passed. Spin is ready."
    else
        error "Some checks failed. See above for details."
    fi
    echo ""
}

# --- Fallback (minimal install) ---

do_fallback() {
    echo ""
    echo -e "${YELLOW}Fallback: Minimal frontend-only install${NC}"
    echo ""
    info "This installs just the React frontend (no Rust/Tauri needed)."
    info "You won't get the native desktop app, but you can preview the UI."
    echo ""

    if ! check_node; then
        error "Node.js 20+ is still required for the fallback. Install it and retry."
        exit 1
    fi

    if [ ! -d "$INSTALL_DIR/.git" ]; then
        git clone "$REPO_URL" "$INSTALL_DIR"
    fi

    cd "$APP_DIR"
    npm install
    echo ""
    success "Fallback install complete."
    echo ""
    info "To preview the UI (browser only, no native features):"
    echo "  cd ~/Spin/app && npm run dev"
    echo ""
    info "Open http://localhost:5173 in your browser."
    echo ""
}

# --- Main Menu ---

main() {
    print_banner

    echo -e "${BOLD}What would you like to do?${NC}"
    echo ""
    echo "  1) Install Spin (full installation)"
    echo "  2) Update existing installation"
    echo "  3) Uninstall Spin"
    echo "  4) Verify installation"
    echo "  5) Fallback: frontend-only (no Rust needed)"
    echo "  6) Exit"
    echo ""
    read -rp "$(echo -e "${CYAN}Choose [1-6]:${NC} ")" choice

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
            cd "$APP_DIR"
            npm install
            success "Updated successfully."
            verify_install
            ;;
        3)
            uninstall_spin
            ;;
        4)
            verify_install
            ;;
        5)
            do_fallback
            ;;
        6)
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
