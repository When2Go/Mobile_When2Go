#!/usr/bin/env bash
# scripts/sync-wiki.sh
#
# 하네스 구조(.claude/agents/, .claude/skills/, .claude/commands/, .claude/settings.json,
# CLAUDE.md)가 커밋에서 변경되면 Claude headless 모드를 백그라운드로 spawn해
# GitHub Wiki(Mobile_When2Go.wiki)를 자동 동기화한다.
#
# 호출 위치: .git/hooks/post-commit (scripts/install-git-hooks.sh 로 설치)
# 비활성화:  WIKI_SYNC_DISABLED=1 git commit ...

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
WIKI_DIR="${WIKI_CACHE_DIR:-$HOME/.cache/when2go-wiki}"
WIKI_URL="${WIKI_REMOTE_URL:-https://github.com/When2Go/Mobile_When2Go.wiki.git}"
LOG_FILE="$REPO_ROOT/.wiki-sync.log"
PROMPT_FILE="$REPO_ROOT/scripts/wiki-sync-prompt.md"

if [[ "${WIKI_SYNC_DISABLED:-0}" == "1" ]]; then
  exit 0
fi

CHANGED="$(git diff-tree --no-commit-id --name-only -r HEAD)"
TRIGGER_PATTERN='^(\.claude/(agents|skills|commands)/|\.claude/settings\.json$|CLAUDE\.md$)'

if ! echo "$CHANGED" | grep -qE "$TRIGGER_PATTERN"; then
  exit 0
fi

if ! command -v claude >/dev/null 2>&1; then
  echo "[wiki-sync] claude CLI를 찾지 못해 wiki 동기화를 건너뜁니다." >&2
  exit 0
fi

if [[ ! -f "$PROMPT_FILE" ]]; then
  echo "[wiki-sync] 프롬프트 파일이 없습니다: $PROMPT_FILE" >&2
  exit 1
fi

mkdir -p "$(dirname "$WIKI_DIR")"
if [[ ! -d "$WIKI_DIR/.git" ]]; then
  if ! git clone --quiet "$WIKI_URL" "$WIKI_DIR" 2>>"$LOG_FILE"; then
    echo "[wiki-sync] wiki clone 실패. 첫 위키 페이지가 만들어졌는지 확인하세요. ($LOG_FILE 참고)" >&2
    exit 1
  fi
else
  (cd "$WIKI_DIR" && git pull --rebase --quiet) >>"$LOG_FILE" 2>&1 || true
fi

COMMIT_SHA="$(git rev-parse HEAD)"
COMMIT_LINE="$(git log -1 --oneline HEAD)"
HARNESS_FILES="$(echo "$CHANGED" | grep -E "$TRIGGER_PATTERN" || true)"

PROMPT_BODY="$(cat "$PROMPT_FILE")
$(printf '\n')

## 트리거 컨텍스트
- 레포: $REPO_ROOT
- Wiki repo (로컬 clone): $WIKI_DIR
- 직전 commit: $COMMIT_LINE
- 변경된 하네스 파일:
$(echo "$HARNESS_FILES" | sed 's/^/  - /')
"

if [[ -t 1 ]]; then
  echo "[wiki-sync] 하네스 변경 감지 — Claude로 wiki 동기화를 백그라운드 실행합니다. (로그: $LOG_FILE)"
fi

{
  printf '\n===== %s | commit %s =====\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$COMMIT_SHA"
  nohup claude \
    --print \
    --permission-mode acceptEdits \
    --add-dir "$WIKI_DIR" \
    --append-system-prompt "이 세션은 무인 자동화입니다. 사용자에게 질문하지 말고 끝까지 완료하세요. 작업이 끝나면 wiki repo에서 commit + push 까지 수행하세요." \
    "$PROMPT_BODY"
} >>"$LOG_FILE" 2>&1 &
disown

exit 0
