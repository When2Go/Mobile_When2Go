# 디자인 시스템

> 이 문서는 when2go-ui 에이전트가 스타일을 작성할 때 따르는 유일한 기준입니다.
> 원본 시안: 상위 폴더 `../design/` (Vite + React HTML — Figma Make 프리뷰 기반).
> 토큰 정의는 `../design/Design.md`, 화면 시안은 `../design/index.html` / `../design/src/`, 톤·가이드는 `../design/guidelines/Guidelines.md`. **UI 작업은 본 문서의 토큰만 따르는 것이 아니라, 시안 자체와 화면별로 직접 대조해야 한다.**

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

| 역할 | 클래스 |
|------|--------|
| Primary (버튼, 활성 탭) | `bg-blue-600` / `bg-primary` |
| Primary Soft (배지 bg) | `bg-blue-50` |
| Primary Text (출발시간 강조) | `text-blue-500` |

### 배경 계층

| 레이어 | 클래스 |
|--------|--------|
| 페이지 배경 | `bg-zinc-50` |
| 카드 / 시트 | `bg-white` |
| 서브 카드 / 입력 bg | `bg-zinc-50` |
| 입력 필드 bg | `bg-zinc-100` |
| 구분선 | `border-zinc-100` |

### 텍스트 계층

| 역할 | 클래스 |
|------|--------|
| Heading | `text-zinc-900` |
| Label | `text-zinc-800` |
| Sub | `text-zinc-500` |
| Muted | `text-zinc-400` |

### 상태 컬러

| 상태 | 클래스 |
|------|--------|
| 진행중 | `bg-blue-600 text-white` |
| 완료 | `bg-emerald-100 text-emerald-700` |
| 예정 | `bg-zinc-100 text-zinc-500` |
| 위험/삭제 | `bg-red-500 text-white` |

---

## 3. 다크모드 정책

현재 다크모드는 **일괄 제거 상태**입니다 (#58). 라이트 톤만 유지하고, 컴포넌트 레벨의 `isDark ? darkClass : lightClass` 분기는 모두 라이트 값으로 정리됐습니다.

### 보존된 골격 (재도입 대비)

- `src/contexts/ThemeContext.tsx` — `ThemeProvider`, `useTheme()` 시그니처 유지 (`isDark`는 상수 `false`)
- `tailwind.config.js` — `darkMode: 'class'` 설정 유지
- 재도입 시 본 컨텍스트 내부만 복원하면 각 화면에 다크 톤을 다시 디자인해 넣을 수 있습니다.

### 신규 작업 규칙

- **신규 컴포넌트에 `isDark` 분기 추가 금지.**
- 색상은 위 팔레트의 라이트 값만 사용합니다.
- 다크 톤 재도입은 별도 이슈로 진행하며, 디자인 톤 재정의가 먼저입니다.

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
