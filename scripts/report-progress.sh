#!/bin/bash
# Agent 진행상황 보고 스크립트
# Codex/Claude가 실행하여 교육 진행상황을 화면에 반영

API_URL="${API_URL:-http://localhost:3000/api/training}"

usage() {
  echo "사용법: ./report-progress.sh <participant_id> <event_type> <message>"
  echo ""
  echo "Event Types:"
  echo "  env_ready    - 개발환경 세팅 완료"
  echo "  first_build  - 첫 빌드 성공"
  echo "  custom       - 커스텀 이벤트"
  echo ""
  echo "예시:"
  echo "  ./report-progress.sh abc123 env_ready '개발환경 세팅 완료!'"
  echo "  ./report-progress.sh abc123 first_build 'CRM 페이지에 새 컬럼 추가 성공'"
}

if [ "$#" -lt 3 ]; then
  usage
  exit 1
fi

PARTICIPANT_ID="$1"
EVENT_TYPE="$2"
MESSAGE="$3"

echo "진행상황 보고 중..."
echo "  참가자 ID: $PARTICIPANT_ID"
echo "  이벤트: $EVENT_TYPE"
echo "  메시지: $MESSAGE"

RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"action\": \"event\",
    \"participant_id\": \"$PARTICIPANT_ID\",
    \"event_type\": \"$EVENT_TYPE\",
    \"message\": \"$MESSAGE\"
  }")

if echo "$RESPONSE" | grep -q '"error"'; then
  echo "오류 발생: $RESPONSE"
  exit 1
else
  echo "성공! 교육 현황 페이지에 반영됨"
fi
