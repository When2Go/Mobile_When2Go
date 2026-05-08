# /gc — 가비지 컬렉션 워크플로우

코드베이스 전수 스캔 및 드리프트 정리. AI가 기존 코드를 보고 패턴을 따라하기 때문에 나쁜 패턴이 스노우볼됨. 이를 주기적으로 정리.

---

## 단계별 작업

### 1단계: 문서 ↔ 코드 동기화

- `docs/FRONTEND.md` 패턴 vs 실제 코드 대조
- `docs/DESIGN.md` 디자인 토큰 vs 실제 스타일 클래스
- `docs/generated/component-inventory.md` vs 실제 컴포넌트 파일 목록
- 불일치 목록 + 자동 갱신 제안

### 2단계: 패턴 드리프트 스캔

```bash
# 하드코딩 색상값
grep -r "bg-\[#" src/ --include="*.tsx"
grep -r "text-\[#" src/ --include="*.tsx"
grep -r "style={{" src/ --include="*.tsx"

# any 타입
grep -rn ": any" src/ --include="*.ts" --include="*.tsx"

# console.log
grep -rn "console\." src/ --include="*.ts" --include="*.tsx"

# 중첩 삼항
grep -rn "? .* ? " src/ --include="*.tsx"

# ODsay 직접 호출
grep -rn "odsay\|odcloud" src/ --include="*.ts"
```

위반 건수 + 자동 수정 가능 여부 표시.

### 3단계: 데드 코드 정리

- 미사용 export, 미사용 파일, 미사용 의존성 감지
- 삭제 제안 (사용자 확인 후 실행)

### 4단계: 드리프트 방지

- 반복 위반 → `harness-feedback` Level 2 승격 제안
- 교정 지시 업데이트 필요 여부 확인

### 5단계: 보고서 + docs/ 갱신

- `docs/generated/component-inventory.md` 업데이트
- `docs/QUALITY_SCORE.md` 업데이트

---

## 범위 밖

- 백엔드 코드, `node_modules`, `.expo`, 빌드 폴더
