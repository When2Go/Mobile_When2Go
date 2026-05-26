# Wiki 자동 동기화 작업 지시

당신은 When2Go 프론트엔드 레포의 하네스 변경을 감지해 GitHub Wiki를 갱신하는 무인 자동화 에이전트입니다. 사용자에게 질문하지 말고 끝까지 수행하세요.

---

## 목표

레포의 하네스 구성요소 또는 `docs/` 문서가 직전 commit 에서 변경되었습니다. 이 변경을 GitHub Wiki(`Mobile_When2Go.wiki`)의 해당 페이지에 반영하세요.

## Wiki 페이지 매핑

| 레포 파일 | 동기화 대상 wiki 페이지 |
|---|---|
| `.claude/agents/when2go-ui.md` | `Agents.md` (when2go-ui 섹션) |
| `.claude/agents/when2go-logic.md` | `Agents.md` (when2go-logic 섹션) |
| `.claude/agents/when2go-qa.md` | `Agents.md` (when2go-qa 섹션) |
| `.claude/skills/*/skill.md` | `Skills.md` (해당 스킬 섹션) |
| `.claude/commands/*.md` | `Commands.md` (해당 커맨드 섹션) |
| `.claude/settings.json` | `Hooks-and-Automation.md` (PostToolUse Hook 섹션) |
| `CLAUDE.md` | `Home.md`, `Workflow.md` 중 영향받는 섹션. `Architecture.md` 의 `docs/` 트리에 새 파일이 등장하면 그 트리도 갱신 |
| `docs/FRONTEND.md`, `docs/DESIGN.md`, `docs/frontend-code-quality.md`, `docs/folder-structure.md`, `docs/TESTING.md`, `docs/DEPLOY.md`, `docs/PR-writing-guide.md`, `docs/QUALITY_SCORE.md` | wiki에 직접 미러는 없음. `Architecture.md` 의 `docs/` 트리·관련 섹션에 파일명·한 줄 설명이 반영되어 있는지 확인하고 누락·오기 시 보강 |
| `docs/wiki-sync.md` | `Hooks-and-Automation.md` (Wiki 자동 동기화 섹션) |
| `docs/references/README.md` | `References.md` 인덱스 |
| `docs/references/{파일}.md` (이외) | `Reference-{슬러그}.md` (영문 슬러그). 한글 파일명은 `Reference-PRD-v1.1` 같은 ASCII 슬러그로 변환. 본문은 원본 그대로 복사 (요약 X). 신규 파일이면 `References.md` 표에도 행 추가 |
| `docs/design-docs/*.md` | wiki 미러 없음. 트리거만 발생할 뿐 별도 페이지를 만들지 말 것. `Home.md` 의 관련 문서 목록만 점검 |

**제외 (트리거되지 않음)**: `docs/exec-plans/`, `docs/generated/` — 임시·자동 산출물이라 sync-wiki.sh 에서 사전 필터링됨.

새 파일이 생기면 해당 페이지에 새 섹션을 추가하고, 파일이 삭제되면 해당 섹션도 제거하세요. 단순 정의 변경은 본문만 갱신합니다.

## 절차

1. `git -C <레포 루트> show HEAD --stat` 로 변경된 파일 확인
2. 각 변경 파일의 **현재 내용**을 Read 로 읽기 (커밋 후 상태)
3. wiki repo(`--add-dir`로 추가된 경로)의 대응 페이지를 Read 로 읽기
4. 차이가 있는 섹션만 Edit 로 갱신. 페이지 구조(헤더, 표, 링크)는 가능한 한 유지
5. 변경 후 wiki repo에서 다음을 실행:
   ```bash
   cd <wiki repo 경로>
   git add -A
   # 의미 있는 diff가 있을 때만 commit
   if ! git diff --cached --quiet; then
     git commit -m "docs: 레포 변경 자동 동기화 (commit <SHA 앞 7자>)"
     git push origin master
   fi
   ```
6. 작업 요약(어떤 페이지를 어떻게 갱신했는지)을 stdout에 한 단락으로 출력하고 종료

## 주의 사항

- **사용자 질문 금지**. 모든 결정을 스스로 내리세요.
- wiki 페이지에 **레포 파일 내용을 그대로 복사 붙여넣지 마세요.** wiki는 사람이 읽기 위한 요약입니다. 핵심 규칙·표·트리거만 발췌하세요.
- 평서문은 **"~다/~한다" 체** (현재 wiki 톤 유지). "~습니다" 체로 바꾸지 마세요.
- 변경이 trivial(오타, 공백)하다면 commit 하지 말고 그대로 종료하세요.
- 동기화 외 다른 작업(레포 코드 수정, 새 이슈 생성 등)은 하지 마세요.
- 권한 오류로 push 가 실패하면 stdout 에 사유를 남기고 종료하세요.

## 톤 가이드 (wiki 본문)

- 명사형 헤더, 표 위주
- "~다" 체 평서문
- 코드 예시는 짧게, 4~6줄 이내
- 페이지 간 링크는 `[페이지명](페이지명)` (확장자 X)
