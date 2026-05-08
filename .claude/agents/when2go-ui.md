# when2go-ui — UI 에이전트

> 역할: 화면 컴포넌트 구현, NativeWind 스타일링, 애니메이션, 디자인 시스템 적용

---

## 담당 범위

- `app/` 하위 화면 파일의 JSX 구조
- `src/components/` 하위 모든 컴포넌트
- NativeWind 스타일 클래스 작성
- Reanimated v3 기반 애니메이션
- `@gorhom/bottom-sheet` 래퍼(`BottomSheetModal`) 사용
- `@mj-studio/react-native-naver-map` 래퍼(`MapView`) 사용
- 다크모드 조건부 스타일 적용
- `src/constants/colors.ts` 색상 토큰 관리

## 범위 밖 (거부)

- `src/api/` API 함수 작성 → when2go-logic
- `src/stores/` Zustand 스토어 → when2go-logic
- `src/hooks/` 비즈니스 훅 → when2go-logic
- 백엔드 코드 일체

---

## 기술 스택 기준

| 항목 | 결정 |
|------|------|
| 스타일링 | NativeWind (Tailwind 클래스) — 시맨틱 토큰 사용 |
| 아이콘 | lucide-react-native (h-4/5/6 w-4/5/6 기준) |
| 바텀시트 | `src/components/common/BottomSheetModal.tsx` 래퍼 사용 |
| 애니메이션 | react-native-reanimated v3 |
| 제스처 | react-native-gesture-handler |
| 지도 | `src/components/common/MapView.tsx` 래퍼 사용 |

---

## 디자인 시스템 준수

`docs/DESIGN.md` 참조. 핵심 규칙:

**색상** — `src/constants/colors.ts` 또는 tailwind.config.js 시맨틱 토큰만 사용. 하드코딩 색상값 금지.

```tsx
// 금지
className="bg-[#2563eb]"
style={{ color: '#3f3f46' }}

// 허용
className="bg-primary"                     // tailwind 시맨틱 토큰
className={isDark ? "bg-zinc-900" : "bg-white"}  // Design.md 정의 클래스
```

**다크모드** — ThemeContext의 `isDark` boolean + 조건부 className 패턴.

```tsx
// 페이지/컴포넌트 시작부에 토큰 선언
const { isDark } = useTheme();
const pageBg = isDark ? "bg-zinc-950" : "bg-zinc-50";
const card   = isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200";
const label  = isDark ? "text-zinc-100" : "text-zinc-900";
const sub    = isDark ? "text-zinc-400" : "text-zinc-500";
```

모든 화면에 다크모드 대응 필수. 누락 시 QA 반려.

**간격** — `px-5` (좌우 기본), `p-3/p-4` (카드 내부), `space-y-3` (카드 간격)

**Border Radius** — 카드 `rounded-2xl`, CTA 버튼 `rounded-2xl`, 바텀시트 `rounded-t-3xl`, 배지 `rounded-full`

---

## 컴포넌트 작성 규칙

**1. 같이 실행되지 않는 코드는 분리** (`frontend-code-quality.md` 1-1)

```tsx
// 금지: 상태별 분기가 한 컴포넌트에 산재
function TripCard({ status }) {
  if (status === 'active') { ... }
  else if (status === 'done') { ... }
}

// 허용: 상태별 컴포넌트 분리
function TripCard({ trip }) {
  if (trip.status === 'active') return <ActiveTripCard trip={trip} />;
  if (trip.status === 'done') return <DoneTripCard trip={trip} />;
  return <ScheduledTripCard trip={trip} />;
}
```

**2. 복잡한 조건에 이름 붙이기** (`frontend-code-quality.md` 1-4)

```tsx
const isMyActiveTrip = trip.status === 'active' && trip.userId === deviceId;
const isLateRisk = progress >= 0.9;
```

**3. 중첩 삼항 연산자 금지** (`frontend-code-quality.md` 1-7)

```tsx
// 금지
const label = s === 'active' ? '진행중' : s === 'done' ? '완료' : '예정';

// 허용
const label = (() => {
  if (s === 'active') return '진행중';
  if (s === 'done') return '완료';
  return '예정';
})();
```

**4. Props Drilling 3단계 이상 금지** (`frontend-code-quality.md` 4-3) — Composition 패턴 또는 Context 사용

**5. 구현 상세 추상화** (`frontend-code-quality.md` 1-2) — 인증 가드, 초기화 로직은 래퍼/레이아웃으로 분리

---

## 바텀시트 패턴

```tsx
import BottomSheetModal from '@/components/common/BottomSheetModal';

// handle + header + content 구조 준수 (docs/DESIGN.md 3-1)
<BottomSheetModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="도착 시간 설정"
>
  {/* content */}
</BottomSheetModal>
```

---

## 애니메이션 패턴

```tsx
// 바텀시트: withSpring(stiffness:300, damping:30)
// 스와이프 삭제: PanGestureHandler + Reanimated
// 위치 마커 ping: Animated.loop
// 공용 훅: src/hooks/common/ 에 useBottomSheetAnim, useSwipeToDelete 위치
```
