#!/bin/bash
# Argo Business Lab - 교육 환경 설치 스크립트
# 비개발자를 위한 원클릭 설치

set -e

echo "=========================================="
echo "  Argo Business Lab 환경 설치"
echo "=========================================="
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success() { echo -e "${GREEN}✓ $1${NC}"; }
warn() { echo -e "${YELLOW}! $1${NC}"; }
error() { echo -e "${RED}✗ $1${NC}"; }

# 1. Homebrew 설치 확인
echo "1. Homebrew 확인 중..."
if ! command -v brew &> /dev/null; then
    echo "   Homebrew 설치 중... (비밀번호 입력이 필요할 수 있습니다)"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Apple Silicon Mac의 경우 PATH 추가
    if [[ $(uname -m) == "arm64" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    success "Homebrew 설치 완료"
else
    success "Homebrew 이미 설치됨"
fi

# 2. Node.js 설치 확인 (LTS)
echo ""
echo "2. Node.js 확인 중..."
if ! command -v node &> /dev/null; then
    echo "   Node.js 설치 중..."
    brew install node@22
    brew link node@22 --force --overwrite
    success "Node.js 설치 완료 ($(node -v))"
else
    NODE_VERSION=$(node -v)
    success "Node.js 이미 설치됨 ($NODE_VERSION)"
fi

# 3. pnpm 설치 확인
echo ""
echo "3. pnpm 확인 중..."
if ! command -v pnpm &> /dev/null; then
    echo "   pnpm 설치 중..."
    npm install -g pnpm
    success "pnpm 설치 완료"
else
    success "pnpm 이미 설치됨 ($(pnpm -v))"
fi

# 4. GitHub CLI 설치 확인
echo ""
echo "4. GitHub CLI 확인 중..."
if ! command -v gh &> /dev/null; then
    echo "   GitHub CLI 설치 중..."
    brew install gh
    success "GitHub CLI 설치 완료"
else
    success "GitHub CLI 이미 설치됨 ($(gh --version | head -1))"
fi

# 5. Supabase CLI 설치 확인
echo ""
echo "5. Supabase CLI 확인 중..."
if ! command -v supabase &> /dev/null; then
    echo "   Supabase CLI 설치 중..."
    brew install supabase/tap/supabase
    success "Supabase CLI 설치 완료"
else
    success "Supabase CLI 이미 설치됨 ($(supabase --version))"
fi

# 6. Git 설치 확인
echo ""
echo "6. Git 확인 중..."
if ! command -v git &> /dev/null; then
    echo "   Git 설치 중..."
    brew install git
    success "Git 설치 완료"
else
    success "Git 이미 설치됨 ($(git --version))"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}  모든 도구 설치 완료!${NC}"
echo "=========================================="
echo ""
echo "다음 단계:"
echo "  1. GitHub 계정이 없다면 https://github.com 에서 생성"
echo "  2. gh auth login 실행하여 GitHub 로그인"
echo "  3. 레포 클론: git clone https://github.com/techtaka-makkit/argo-business-lab.git"
echo "  4. cd argo-business-lab && pnpm install"
echo "  5. pnpm dev 로 개발 서버 시작"
echo ""
