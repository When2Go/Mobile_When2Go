# 외부 자료 / 외부 시스템 레퍼런스

레포 외부의 자료를 사람이 정리해 보관하는 곳. 도구가 자동 생성하지 않고, 외부 소스가 바뀌면 수동 동기화한다 (도구 산출물은 `docs/generated/`).

다음 4가지가 포함될 수 있다:

- **외부 라이브러리/SDK 레퍼런스** — 채택한 패키지의 사용 범위·핵심 API·함정. 파일명 `{라이브러리명}-reference.md` 또는 `{라이브러리명}-llms.txt`
- **외부 시스템 인터페이스** — 백엔드 API 스키마처럼 우리가 호출하는 외부 계약. 파일명 `{시스템명}-api-schema.md` 또는 `{시스템명}-api.md`
- **외부 문서 사본** — 상위 폴더/외부 문서의 동기화 사본. 파일명은 원본명 유지(`PRD-*.md` 등)
- **외부 API의 사용 범위·비용 정책** — 부가 API 과금처럼 코드에 적기 어색한 운영 규칙. 파일명 `{서비스명}-api-schema.md`

---

## 등록됨

| 파일 | 분류 | 설명 |
|------|------|------|
| `PRD-지금나가-v1.1.md` | 외부 문서 사본 | 프로젝트 PRD 사본 (상위 폴더 원본과 동기화) |
| `api-schema.md` | 외부 시스템 인터페이스 | Spring Boot 백엔드 API 스키마 (도메인·요청/응답·공통 봉투·인증 헤더). API 함수 작성 1차 자료 |
| `kakao-local-api.md` | 외부 라이브러리/SDK 레퍼런스 | 카카오 로컬 REST API — 키워드 검색·좌표 변환·인증 헤더 (#15 연동 참조) |
| `naver-maps-api-schema.md` | 외부 라이브러리/SDK 레퍼런스 + 운영 정책 | `@mj-studio/react-native-naver-map` 사용 범위 + 비용 정책 (Mobile Dynamic Map SDK 한정). 지도 작업 1차 자료 |

## 등록 예정

- `nativewind-reference.md`
- `expo-router-reference.md`
- `gorhom-bottom-sheet-reference.md`
- `reanimated-reference.md`
