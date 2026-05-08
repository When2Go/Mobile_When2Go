# 디자인 시스템

> 이 문서는 when2go-ui 에이전트가 스타일을 작성할 때 따르는 유일한 기준입니다.
> 원본: `design/Design.md` (Figma Make 프리뷰 기반 추출)

---

## 1. NativeWind 토큰 설정

`tailwind.config.js`에 시맨틱 토큰을 등록해 사용. Tailwind 기본 클래스도 허용하지만, 브랜드 컬러와 배경 계층은 시맨틱 토큰 우선.

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#2563eb',   // blue-600
        soft: '#eff6ff',      // blue-50
        text: '#3b82f6',      // blue-500 (강조 텍스트)
      },
    }
  }
}
```

---

## 2. 색상 팔레트

### 브랜드 컬러

| 역할 | Light | Dark |
|------|-------|------|
| Primary (버튼, 활성 탭) | `bg-blue-600` / `bg-primary` | `bg-blue-500` |
| Primary Soft (배지 bg) | `bg-blue-50` | `bg-blue-900/50` |
| Primary Text (출발시간 강조) | `text-blue-500` | `text-blue-400` |

### 배경 계층

| 레이어 | Light | Dark |
|--------|-------|------|
| 페이지 배경 | `bg-zinc-50` | `bg-zinc-950` |
| 카드 / 시트 | `bg-white` | `bg-zinc-900` |
| 서브 카드 / 입력 bg | `bg-zinc-50` | `bg-zinc-800` |
| 입력 필드 bg | `bg-zinc-100` | `bg-zinc-800` |
| 구분선 | `border-zinc-100` | `border-zinc-700` |

### 텍스트 계층

| 역할 | Light | Dark |
|------|-------|------|
| Heading | `text-zinc-900` | `text-zinc-100` |
| Label | `text-zinc-800` | `text-zinc-200` |
| Sub | `text-zinc-500` | `text-zinc-400` |
| Muted | `text-zinc-400` | `text-zinc-500` |

### 상태 컬러

| 상태 | 클래스 |
|------|--------|
| 진행중 | `bg-blue-600 text-white` (dark: `bg-blue-500`) |
| 완료 | `bg-emerald-100 text-emerald-700` (dark: `bg-emerald-700 text-emerald-100`) |
| 예정 | `bg-zinc-100 text-zinc-500` (dark: `bg-zinc-700 text-zinc-300`) |
| 위험/삭제 | `bg-red-500 text-white` |

---

## 3. 다크모드 구현 패턴

### ThemeContext

- `isDark` boolean + 시스템 자동 감지 + 수동 오버라이드
- `toggle()` 함수로 MyPage 토글 스위치와 연결

### 필수 패턴 (모든 화면/컴포넌트)

```tsx
const { isDark } = useTheme();

// 페이지 시작부에 로컬 토큰 선언
const pageBg  = isDark ? "bg-zinc-950" : "bg-zinc-50";
const card    = isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200";
const label   = isDark ? "text-zinc-100" : "text-zinc-900";
const sub     = isDark ? "text-zinc-400" : "text-zinc-500";
const divider = isDark ? "border-zinc-700" : "border-zinc-100";
```

### QA 체크리스트

```
[ ] 배경색 (pageBg, card 토큰 사용)
[ ] 텍스트색 (label, sub 토큰 사용)
[ ] 테두리색 (divider 토큰 사용)
[ ] 아이콘 색
[ ] 입력창 배경
[ ] 지도 이미지 (dark: opacity-30 grayscale brightness-50)
```

---

## 4. 타이포그래피

| 역할 | Size | Weight | 사용 예 |
|------|------|--------|---------|
| Page Title | `text-xl` | `font-bold` | 페이지 헤더 |
| Section Title | `text-lg` | `font-bold` | 목적지명 |
| Card Title | `text-base` | `font-bold` | 카드 제목 |
| Body | `text-sm` | `font-medium` | 일반 내용 |
| Caption | `text-xs` | `font-semibold` | 레이블 |
| Tiny | `text-[11px]` | `font-medium` | 주소, 갱신 시각 |
| Badge | `text-[10px]` | `font-bold` | 상태 뱃지 |
| Display | `text-5xl` | `font-black` | 버퍼 숫자 |
| Hero | `text-3xl` | `font-black` | Active Trip 메시지 |
| Route Time | `text-2xl` | `font-black` | 출발 시간 강조 |

---

## 5. 간격 (Spacing)

| 역할 | 값 |
|------|-----|
| 페이지 좌우 패딩 | `px-5` (표준) |
| 카드 내부 패딩 | `p-3` / `p-4` |
| 카드 간격 | `space-y-3` / `gap-3` |
| 바텀 CTA 패딩 | `p-5` 또는 `px-5 pb-10` |
| NavBar 높이 | `h-[68px]` |
| Header 높이 | `h-14` |

---

## 6. Border Radius

| 요소 | 클래스 |
|------|--------|
| 배지 / 칩 | `rounded-full` |
| 아이콘 버튼 | `rounded-full` |
| 입력 필드 | `rounded-xl` |
| 카드 | `rounded-2xl` |
| CTA 버튼 | `rounded-2xl` |
| 바텀시트 | `rounded-t-3xl` (상단만) |
| 모달 | `rounded-3xl` |

---

## 7. 컴포넌트 패턴

### CTA 버튼

```tsx
className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-600/20 active:bg-blue-700"
```

### 상태 뱃지

```tsx
className="rounded-full px-1.5 py-0.5 text-[10px] font-bold shrink-0"
// active: bg-blue-600 text-white
// done:   bg-emerald-100 text-emerald-700
// scheduled: bg-zinc-100 text-zinc-500
```

### 바텀시트 구조

```
BottomSheetModal 래퍼 사용 (src/components/common/BottomSheetModal.tsx)
  handle (h-1 w-10 rounded-full bg-zinc-200/700)
  header (제목 + 닫기 버튼)
  content (px-5, pb-8~10)

애니메이션: withSpring(stiffness:300, damping:30)
```

### 위치 마커 (홈 화면)

```tsx
// 내 위치: h-8 w-8 rounded-full bg-blue-500 border-2 border-white + ping 애니메이션
// 목적지: rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white
```

---

## 8. 아이콘

라이브러리: `lucide-react-native`

| 위치 | 크기 |
|------|------|
| 탭바 | `size={24}` |
| 헤더 | `size={20}` |
| 카드 내 | `size={16}` |
| 캡션 내 | `size={12}` |

주요 아이콘: `Home`, `Bell`, `Map`, `User`, `Search`, `Mic`, `MapPin`, `Clock`, `TrainFront`, `Bus`, `ArrowLeft`, `X`, `Check`, `Trash2`, `Repeat2`

---

## 9. AdMob 배치

| 위치 | 형태 | 조건 |
|------|------|------|
| Home 바텀시트 하단 | 배너 `h-9 rounded-xl` | 항상 |
| MyPage 하단 | 배너 `h-12` | 항상 |
| Active Trip 완료 후 | 전면 인터스티셜 | `stage === 2` 완료 + 600ms 딜레이 |

`src/components/common/AdBanner.tsx` 래퍼 사용.
