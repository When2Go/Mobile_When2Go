# Wiki 자동 동기화

하네스 구성요소(`.claude/agents/`, `.claude/skills/`, `.claude/commands/`, `.claude/settings.json`, `CLAUDE.md`)가 commit 에서 변경되면 GitHub Wiki(`Mobile_When2Go.wiki`)를 자동으로 갱신한다.

---

## 동작 원리

```
git commit
   │
   ▼
.husky/post-commit   ← husky 가 core.hooksPath 로 라우팅
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

## 설치 — 팀원 머신 자동 적용

레포 clone 후 한 번:

```bash
npm install
```

`package.json` 의 `scripts.prepare = "husky"` 가 자동 실행되어 `.husky/_` wrapper 가 만들어지고, `core.hooksPath` 가 `.husky/_` 로 설정된다. 별도 설치 스크립트 호출 불필요.

확인:

```bash
git config --get core.hooksPath   # .husky/_ 가 나오면 OK
ls .husky/post-commit             # 존재해야 함
```

이전에 쓰이던 `scripts/install-git-hooks.sh` 는 husky 도입 시 제거됨. 그 시점 전에 설치된 `.git/hooks/post-commit` 이 남아 있더라도 `core.hooksPath` 가 우선이라 husky 경로가 사용된다. 깔끔히 정리하려면:

```bash
rm -f .git/hooks/post-commit
```

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

## 비활성화

- **일회성**: `WIKI_SYNC_DISABLED=1 git commit ...`
- **영구 (이 머신만)**: `chmod -x .husky/post-commit` 또는 hook 파일에서 `sync-wiki.sh` 호출 줄 주석 처리. 절대 `.husky/post-commit` 파일 자체를 삭제·미커밋하지 말 것 (다른 팀원 영향).
- **레포 차원 비활성화**: `package.json` 의 `prepare` 스크립트 제거 + `.husky/` 디렉토리 제거 + husky devDependency 제거.

## 트러블슈팅

자세한 트러블슈팅과 점검 절차는 데스크탑 `Desktop/wiki-sync-troubleshooting.md` 참조 (개발자 메모, 레포 외부).

대표 증상 요약:

| 증상 | 원인 / 해결 |
|---|---|
| `claude CLI를 찾지 못해 wiki 동기화를 건너뜁니다` | `npm i -g @anthropic-ai/claude-code` 또는 `brew install claude` |
| `wiki clone 실패` | wiki에 첫 페이지가 있는지 확인 (`https://github.com/When2Go/Mobile_When2Go/wiki`) |
| wiki 가 안 갱신됨 | `.wiki-sync.log` 확인. claude 가 백그라운드에서 작업 중일 수 있음 (수십 초 ~ 1분) |
| push 권한 오류 | 로컬 git credential 이 When2Go org 에 push 권한 있는지 확인 |
| 새 clone 후 hook 안 깔림 | `npm install` 실행 안 함 → 실행 후 `git config --get core.hooksPath` 확인 |

## 보안 고려

- claude headless 가 자동으로 commit + push 하므로 wiki repo 에 잘못된 내용이 올라갈 수 있다. PR 리뷰가 없는 영역이므로 주기적으로 wiki history 확인 권장.
- 민감 정보가 `.claude/` 또는 `CLAUDE.md` 에 포함되지 않도록 주의 (wiki는 public).
- 자동 동기화를 원치 않는 commit 은 `WIKI_SYNC_DISABLED=1` 로 끄고 진행.
