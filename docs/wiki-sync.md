# Wiki 자동 동기화

하네스 구성요소(`.claude/agents/`, `.claude/skills/`, `.claude/commands/`, `.claude/settings.json`, `CLAUDE.md`)가 commit 에서 변경되면 GitHub Wiki(`Mobile_When2Go.wiki`)를 자동으로 갱신한다.

---

## 동작 원리

```
git commit
   │
   ▼
.git/hooks/post-commit
   │
   ▼
scripts/sync-wiki.sh
   ├─ 1. 직전 commit의 변경 파일에 하네스 파일 포함 여부 확인
   ├─ 2. 없으면 종료 (0)
   ├─ 3. ~/.cache/when2go-wiki/ 에 wiki repo clone 또는 pull
   └─ 4. claude --print 를 백그라운드로 spawn
              │
              ▼
        scripts/wiki-sync-prompt.md 의 지시에 따라
        해당 wiki 페이지 Edit → wiki repo 에서 commit + push
```

`claude --print` 는 무인 headless 모드. `--permission-mode acceptEdits` 로 권한 프롬프트 없이 진행한다.

## 설치

레포 clone 직후 한 번:

```bash
./scripts/install-git-hooks.sh
```

- `.git/hooks/post-commit` 가 설치된다 (git hooks 는 레포에 커밋되지 않으므로 각 개발자가 직접 설치)
- 기존 post-commit 이 있으면 백업 후 교체

## 트리거 조건

다음 파일이 직전 commit 의 변경 목록에 포함될 때만 발동:

| 패턴 | 동기화 대상 wiki 페이지 |
|---|---|
| `.claude/agents/*.md` | `Agents` |
| `.claude/skills/*/skill.md` | `Skills` |
| `.claude/commands/*.md` | `Commands` |
| `.claude/settings.json` | `Hooks-and-Automation` |
| `CLAUDE.md` | `Home`, `Workflow` (영향받는 섹션) |

그 외 파일만 변경된 commit 은 트리거되지 않는다.

## 환경 변수

| 변수 | 기본값 | 설명 |
|---|---|---|
| `WIKI_SYNC_DISABLED` | (unset) | `1` 설정 시 skip. 예: `WIKI_SYNC_DISABLED=1 git commit ...` |
| `WIKI_CACHE_DIR` | `~/.cache/when2go-wiki` | wiki repo clone 위치 |
| `WIKI_REMOTE_URL` | `https://github.com/When2Go/Mobile_When2Go.wiki.git` | wiki repo URL |

## 로그

`./.wiki-sync.log` 에 누적. `.gitignore`에 포함됨.

```bash
tail -f .wiki-sync.log
```

## 수동 실행

```bash
# 직전 commit 기준으로 한 번 더 동기화
./scripts/sync-wiki.sh
```

## 비활성화 (영구)

```bash
rm .git/hooks/post-commit
```

또는 hook 파일에서 `sync-wiki.sh` 호출 줄만 주석 처리.

## 트러블슈팅

| 증상 | 원인 / 해결 |
|---|---|
| `claude CLI를 찾지 못해 wiki 동기화를 건너뜁니다` | `npm i -g @anthropic-ai/claude-code` 또는 `brew install claude` |
| `wiki clone 실패` | wiki에 첫 페이지가 있는지 확인 (`https://github.com/When2Go/Mobile_When2Go/wiki`) |
| wiki 가 안 갱신됨 | `.wiki-sync.log` 확인. claude 가 백그라운드에서 작업 중일 수 있음 (수십 초 ~ 1분) |
| push 권한 오류 | 로컬 git credential 이 When2Go org 에 push 권한 있는지 확인 |

## 보안 고려

- claude headless 가 자동으로 commit + push 하므로 wiki repo 에 잘못된 내용이 올라갈 수 있다. PR 리뷰가 없는 영역이므로 주기적으로 wiki history 확인 권장.
- 민감 정보가 `.claude/` 또는 `CLAUDE.md` 에 포함되지 않도록 주의 (wiki는 public).
- 자동 동기화를 원치 않는 commit 은 `WIKI_SYNC_DISABLED=1` 로 끄고 진행.
