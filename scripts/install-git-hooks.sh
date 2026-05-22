#!/usr/bin/env bash
# scripts/install-git-hooks.sh
#
# .git/hooks/post-commit 을 설치해 하네스 변경 시 wiki 자동 동기화가 트리거되도록 한다.
# 레포 clone 후 한 번 실행하면 됩니다.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOK_DIR="$REPO_ROOT/.git/hooks"
HOOK_FILE="$HOOK_DIR/post-commit"

mkdir -p "$HOOK_DIR"

if [[ -f "$HOOK_FILE" ]] && ! grep -q "sync-wiki.sh" "$HOOK_FILE"; then
  echo "[install-git-hooks] 기존 post-commit 이 있습니다. 백업 후 wiki 동기화를 추가합니다."
  cp "$HOOK_FILE" "$HOOK_FILE.bak.$(date +%Y%m%d%H%M%S)"
fi

cat > "$HOOK_FILE" <<'HOOK'
#!/usr/bin/env bash
# Mobile_When2Go post-commit hook — 하네스 wiki 자동 동기화 트리거
REPO_ROOT="$(git rev-parse --show-toplevel)"
SCRIPT="$REPO_ROOT/scripts/sync-wiki.sh"
[[ -x "$SCRIPT" ]] && "$SCRIPT" || true
HOOK

chmod +x "$HOOK_FILE"
chmod +x "$REPO_ROOT/scripts/sync-wiki.sh"

echo "[install-git-hooks] 설치 완료: $HOOK_FILE"
echo ""
echo "다음 단계:"
echo "  1. claude CLI 가 PATH 에 있는지 확인:  command -v claude"
echo "  2. 첫 동기화 시 wiki repo 가 ~/.cache/when2go-wiki 에 clone 됩니다."
echo "  3. 비활성화하려면:  WIKI_SYNC_DISABLED=1 git commit ..."
echo "  4. 로그 위치:  $REPO_ROOT/.wiki-sync.log"
