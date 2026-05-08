#!/bin/bash
# Argo Business Lab - 완전 자동 세팅 스크립트
# AI Agent (Codex/Claude)가 실행하는 원클릭 설정
#
# 사용법:
#   ./setup.sh "NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=..."
#
# 또는 .env.local 내용을 stdin으로:
#   echo "NEXT_PUBLIC_SUPABASE_URL=..." | ./setup.sh

set -e

echo "=========================================="
echo "  Argo Business Lab 자동 세팅"
echo "=========================================="
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

success() { echo -e "${GREEN}✓ $1${NC}"; }
info() { echo -e "${BLUE}→ $1${NC}"; }
warn() { echo -e "${YELLOW}! $1${NC}"; }
error() { echo -e "${RED}✗ $1${NC}"; exit 1; }

# ============================================
# 1. 도구 설치 (bootstrap)
# ============================================
echo "1. 필수 도구 설치 중..."

# Homebrew
if ! command -v brew &> /dev/null; then
    info "Homebrew 설치 중..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Apple Silicon Mac PATH 설정
    if [[ $(uname -m) == "arm64" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    success "Homebrew 설치 완료"
else
    success "Homebrew OK"
fi

# Node.js
if ! command -v node &> /dev/null; then
    info "Node.js 설치 중..."
    brew install node@22
    brew link node@22 --force --overwrite 2>/dev/null || true
    success "Node.js 설치 완료"
else
    success "Node.js OK ($(node -v))"
fi

# pnpm
if ! command -v pnpm &> /dev/null; then
    info "pnpm 설치 중..."
    npm install -g pnpm
    success "pnpm 설치 완료"
else
    success "pnpm OK"
fi

# Git
if ! command -v git &> /dev/null; then
    info "Git 설치 중..."
    brew install git
    success "Git 설치 완료"
else
    success "Git OK"
fi

# GitHub CLI
if ! command -v gh &> /dev/null; then
    info "GitHub CLI 설치 중..."
    brew install gh
    success "GitHub CLI 설치 완료"
else
    success "GitHub CLI OK"
fi

echo ""

# ============================================
# 2. GitHub 인증 확인
# ============================================
echo "2. GitHub 인증 확인..."

if ! gh auth status &> /dev/null; then
    warn "GitHub 로그인이 필요합니다"
    gh auth login -h github.com -p https -w
    success "GitHub 로그인 완료"
else
    success "GitHub 인증 OK ($(gh api user -q .login 2>/dev/null || echo 'authenticated'))"
fi

echo ""

# ============================================
# 3. 프로젝트 클론 (필요시)
# ============================================
echo "3. 프로젝트 확인..."

REPO_URL="https://github.com/chance980119-arch/argo-business-lab.git"
PROJECT_DIR="$HOME/Desktop/argo-business-lab"

# 이미 프로젝트 폴더 안에 있는지 확인
if [[ -f "package.json" ]] && grep -q "argo-business-lab" package.json 2>/dev/null; then
    PROJECT_DIR=$(pwd)
    success "이미 프로젝트 폴더에 있음"
elif [[ -d "$PROJECT_DIR" ]]; then
    success "프로젝트 폴더 존재: $PROJECT_DIR"
    cd "$PROJECT_DIR"
else
    info "프로젝트 클론 중..."
    git clone "$REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    success "클론 완료: $PROJECT_DIR"
fi

cd "$PROJECT_DIR"
echo ""

# ============================================
# 4. 의존성 설치
# ============================================
echo "4. 의존성 설치..."

if [[ ! -d "node_modules" ]]; then
    info "pnpm install 실행 중..."
    pnpm install
    success "의존성 설치 완료"
else
    success "node_modules 존재 (skip)"
fi

echo ""

# ============================================
# 5. .env.local 생성
# ============================================
echo "5. 환경 변수 설정..."

ENV_CONTENT=""

# 인자로 받은 경우
if [[ -n "$1" ]]; then
    ENV_CONTENT="$1"
# stdin으로 받은 경우
elif [[ ! -t 0 ]]; then
    ENV_CONTENT=$(cat)
fi

if [[ -n "$ENV_CONTENT" ]]; then
    echo "$ENV_CONTENT" > .env.local
    success ".env.local 생성 완료"
elif [[ -f ".env.local" ]]; then
    success ".env.local 이미 존재"
else
    warn ".env.local 없음 - 수동으로 생성 필요"
    echo ""
    echo "다음 내용으로 .env.local 파일을 생성하세요:"
    echo "----------------------------------------"
    echo "NEXT_PUBLIC_SUPABASE_URL=<URL>"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=<KEY>"
    echo "----------------------------------------"
fi

echo ""

# ============================================
# 6. 개발 서버 실행
# ============================================
echo "6. 개발 서버 시작..."

if [[ -f ".env.local" ]]; then
    success "설정 완료! 서버 시작합니다..."
    echo ""
    echo "=========================================="
    echo -e "${GREEN}  브라우저에서 http://localhost:3000 열기${NC}"
    echo "=========================================="
    echo ""
    pnpm dev
else
    error ".env.local 파일이 없어서 서버를 시작할 수 없습니다"
fi
