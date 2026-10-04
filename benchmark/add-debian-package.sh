#!/usr/bin/env bash


# ========== Docker ==========

# Docker official GPG key
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

sudo mkdir -p /etc/apt/sources.list.d

# Add sources
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/debian
Suites: $(. /etc/os-release && echo "$VERSION_CODENAME")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

# remove existing lists & update
sudo rm -rf /var/lib/apt/lists/*
sudo apt update

# install packages
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin


# ========== Debian Packages ==========
sudo mkdir -p /etc/apt/sources.list.d

# Add sources
sudo tee /etc/apt/sources.list.d/debian.sources > /dev/null <<'EOF'
Types: deb
URIs: https://deb.debian.org/debian
Suites: trixie trixie-updates
Components: main
Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg

Types: deb
URIs: https://deb.debian.org/debian-security
Suites: trixie-security
Components: main
Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg
EOF

# Remove existing lists and update
sudo rm -rf /var/lib/apt/lists/*
sudo apt update


# ========== List sources ==========
ls /etc/apt/sources.list.d



# ========== Add GUI ==========
sudo apt update
sudo apt install -y xfce4 xfce4-goodies xrdp

echo "startxfce4" > ~/.xsession
sudo systemctl enable --now xrdp
sudo systemctl status xrdp
