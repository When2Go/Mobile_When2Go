# 카카오 로컬 REST API 사용 가이드

> 하네스 엔지니어링 프로젝트 내 카카오 로컬 API 연동 표준 문서
> 최종 업데이트: 2026-05-22
> 공식 문서: [이해하기](https://developers.kakao.com/docs/ko/local/common) · [REST API](https://developers.kakao.com/docs/ko/local/dev-guide)
> 관련 문서: [kakao-maps.md](./kakao-maps.md)

---

## 목차

1. [개요](#1-개요)
2. [사전 설정 & 키 발급](#2-사전-설정--키-발급)
3. [공통 요청 규격](#3-공통-요청-규격)
4. [엔드포인트 일람](#4-엔드포인트-일람)
5. [주소로 좌표 변환](#5-주소로-좌표-변환)
6. [좌표로 행정구역정보 변환](#6-좌표로-행정구역정보-변환)
7. [좌표로 주소 변환](#7-좌표로-주소-변환)
8. [좌표계 변환](#8-좌표계-변환)
9. [키워드로 장소 검색](#9-키워드로-장소-검색)
10. [카테고리로 장소 검색](#10-카테고리로-장소-검색)
11. [카테고리 그룹 코드](#11-카테고리-그룹-코드)
12. [호출 예시 코드](#12-호출-예시-코드)
13. [에러 처리](#13-에러-처리)
14. [쿼터 & 운영 정책](#14-쿼터--운영-정책)
15. [하네스 엔지니어링 적용 가이드](#15-하네스-엔지니어링-적용-가이드)
16. [참고 링크](#16-참고-링크)

---

## 1. 개요

카카오 로컬(Local) API는 **키워드로 특정 장소 정보를 조회**하거나 **좌표를 주소 또는 행정구역으로 변환**하는 등 장소에 대한 정보를 제공한다. 특정 카테고리로 장소 검색이 가능하며, **지번 주소와 도로명 주소 체계를 모두 지원**한다.

| 항목 | 내용 |
|---|---|
| 목적 | 주소 ↔ 좌표 변환, 키워드/카테고리 장소 검색, 행정구역 조회 |
| 호출 방식 | HTTP GET |
| 인증 방식 | **REST API 키** (헤더) |
| 베이스 URL | `https://dapi.kakao.com/v2/local` |
| 응답 형식 | JSON (기본) / XML |
| 주소 체계 | 지번 주소 / 도로명 주소 |

> ⚠️ REST API 키는 요청 헤더에 포함되므로 **클라이언트 직접 호출 시 키가 노출**된다. 백엔드 프록시(BFF)를 통한 호출을 권장한다.

지도 화면 렌더링이 필요한 경우 → [kakao-maps.md](./kakao-maps.md)

---

## 2. 사전 설정 & 키 발급

1. [카카오디벨로퍼스 앱 생성](https://developers.kakao.com/docs/ko/tutorial/start#create)
2. **카카오맵 API 활성화**: [앱 관리 페이지](https://developers.kakao.com/console/app)의 **[카카오맵] > [사용 설정]**의 [상태]를 **[ON]**으로 설정
   - 기존에 카카오맵 API를 활성화한 앱이 있고 다른 앱에서 추가 활성화가 필요한 경우, **추가 기능 신청**으로 권한 신청 및 승인 필요
3. **앱 설정 > 앱 키**에서 **REST API 키** 확인

> ⚠️ **2024년 12월 1일부터** 신규로 카카오맵 API를 호출하는 앱은 카카오맵 사용 설정이 **필수**다.

### 환경 변수 관리

```bash
# .env (서버)
KAKAO_REST_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
KAKAO_API_TIMEOUT_MS=10000
KAKAO_API_MAX_RETRIES=3
```

---

## 3. 공통 요청 규격

### 인증 헤더

모든 요청에 아래 헤더를 포함해야 한다.

```http
Authorization: KakaoAK ${REST_API_KEY}
```

> `KakaoAK ` 접두어(공백 포함)를 반드시 붙여야 한다. 누락 시 인증 실패.

### 응답 포맷 선택

URL의 `${FORMAT}` 부분에 응답 형식을 지정한다. 지정하지 않으면 JSON이 기본값이다.

```
/v2/local/search/keyword.json  → JSON 응답 (Content-Type: application/json;charset=UTF-8)
/v2/local/search/keyword.xml   → XML 응답  (Content-Type: text/xml;charset=UTF-8)
```

### 공통 응답 구조

```json
{
  "meta": { ... },        // 응답 관련 정보 (페이징, total_count 등)
  "documents": [ ... ]    // 응답 결과 배열
}
```

### ⚠️ 좌표 순서 — 매우 중요

로컬 API의 `x`, `y` 파라미터/응답 필드는 다음을 의미한다.

| 필드 | 의미 |
|---|---|
| `x` | **X 좌표값, 경위도인 경우 경도(longitude)** |
| `y` | **Y 좌표값, 경위도인 경우 위도(latitude)** |

카카오맵 SDK의 `LatLng(lat, lng)`와 순서가 **반대**이므로 혼용 시 반드시 변환할 것.

```ts
// 로컬 API 응답 → SDK 좌표 객체 변환 패턴
const position = new kakao.maps.LatLng(Number(doc.y), Number(doc.x));
//                                       ^^ 위도        ^^ 경도
```

---

## 4. 엔드포인트 일람

| # | API | 메서드 | URL |
|---|---|---|---|
| 1 | 주소로 좌표 변환 | `GET` | `https://dapi.kakao.com/v2/local/search/address.${FORMAT}` |
| 2 | 좌표로 행정구역정보 변환 | `GET` | `https://dapi.kakao.com/v2/local/geo/coord2regioncode.${FORMAT}` |
| 3 | 좌표로 주소 변환 | `GET` | `https://dapi.kakao.com/v2/local/geo/coord2address.${FORMAT}` |
| 4 | 좌표계 변환 | `GET` | `https://dapi.kakao.com/v2/local/geo/transcoord.${FORMAT}` |
| 5 | 키워드로 장소 검색 | `GET` | `https://dapi.kakao.com/v2/local/search/keyword.${FORMAT}` |
| 6 | 카테고리로 장소 검색 | `GET` | `https://dapi.kakao.com/v2/local/search/category.${FORMAT}` |

---

## 5. 주소로 좌표 변환

주소를 좌표로 변환하여 지도 위에 표시할 수 있도록 하는 API. 지번 주소·도로명 주소 모두 지원하며, 좌표·우편번호·빌딩명 등의 다양한 정보를 함께 제공한다.

### 쿼리 파라미터

| 이름 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `query` | String | ✅ | 검색을 원하는 질의어 |
| `analyze_type` | String | | 검색 결과 제공 방식<br>`similar`: 입력한 건물명과 일부만 매칭될 경우에도 확장된 검색 결과 제공 (기본값)<br>`exact`: 정확한 건물명이 입력된 주소패턴일 경우, 정확히 일치하는 결과만 제공 |
| `page` | Integer | | 결과 페이지 번호 (1~45, 기본값 1) |
| `size` | Integer | | 한 페이지 결과 수 (1~30, 기본값 10) |

### 응답 — Meta

| 이름 | 타입 | 설명 |
|---|---|---|
| `total_count` | Integer | 검색된 문서 수 |
| `pageable_count` | Integer | `total_count` 중 노출 가능 문서 수 |
| `is_end` | Boolean | 현재 페이지가 마지막 페이지인지 여부 |

### 응답 — Document

| 이름 | 타입 | 설명 |
|---|---|---|
| `address_name` | String | 전체 지번 주소 또는 전체 도로명 주소 (입력에 따라 결정) |
| `address_type` | String | `address_name`의 타입<br>`REGION`(지명) / `ROAD`(도로명) / `REGION_ADDR`(지번 주소) / `ROAD_ADDR`(도로명 주소) |
| `x` | String | X 좌표 (경도) |
| `y` | String | Y 좌표 (위도) |
| `address` | `Address` | 지번 주소 상세 |
| `road_address` | `RoadAddress` | 도로명 주소 상세 (없을 수 있음) |

### 응답 — Address (지번 주소 상세)

| 이름 | 타입 | 설명 |
|---|---|---|
| `address_name` | String | 전체 지번 주소 |
| `region_1depth_name` | String | 시도 |
| `region_2depth_name` | String | 구 단위 |
| `region_3depth_name` | String | 동 단위 |
| `region_3depth_h_name` | String | 행정동 명칭 |
| `h_code` | String | 행정 코드 |
| `b_code` | String | 법정 코드 |
| `mountain_yn` | String | 산 여부 (`Y` / `N`) |
| `main_address_no` | String | 지번 주번지 |
| `sub_address_no` | String | 지번 부번지 (없으면 `""`) |
| `x` | String | 경도 |
| `y` | String | 위도 |

> `zip_code`(6자리 우편번호)는 **Deprecated**. 5자리 `zone_no`(`road_address.zone_no`) 사용 권장.

### 응답 — RoadAddress (도로명 주소 상세)

| 이름 | 타입 | 설명 |
|---|---|---|
| `address_name` | String | 전체 도로명 주소 |
| `region_1depth_name` | String | 시도 |
| `region_2depth_name` | String | 구 단위 |
| `region_3depth_name` | String | 동 단위 |
| `road_name` | String | 도로명 |
| `underground_yn` | String | 지하 여부 (`Y` / `N`) |
| `main_building_no` | String | 건물 본번 |
| `sub_building_no` | String | 건물 부번 (없으면 `""`) |
| `building_name` | String | 건물 이름 |
| `zone_no` | String | 우편번호 (5자리) |
| `x` | String | 경도 |
| `y` | String | 위도 |

### 예제

**요청**

```bash
curl -v -G GET "https://dapi.kakao.com/v2/local/search/address.json" \
  -H "Authorization: KakaoAK ${REST_API_KEY}" \
  --data-urlencode "query=전북 삼성동 100"
```

**응답**

```json
{
  "meta": { "total_count": 4, "pageable_count": 4, "is_end": true },
  "documents": [
    {
      "address_name": "전북 익산시 부송동 100",
      "y": "35.97664845766847",
      "x": "126.99597295767953",
      "address_type": "REGION_ADDR",
      "address": {
        "address_name": "전북 익산시 부송동 100",
        "region_1depth_name": "전북",
        "region_2depth_name": "익산시",
        "region_3depth_name": "부송동",
        "region_3depth_h_name": "삼성동",
        "h_code": "4514069000",
        "b_code": "4514013400",
        "mountain_yn": "N",
        "main_address_no": "100",
        "sub_address_no": "",
        "x": "126.99597295767953",
        "y": "35.97664845766847"
      },
      "road_address": {
        "address_name": "전북 익산시 망산길 11-17",
        "region_1depth_name": "전북",
        "region_2depth_name": "익산시",
        "region_3depth_name": "부송동",
        "road_name": "망산길",
        "underground_yn": "N",
        "main_building_no": "11",
        "sub_building_no": "17",
        "building_name": "",
        "zone_no": "54547",
        "y": "35.976749396987046",
        "x": "126.99599512792346"
      }
    }
  ]
}
```

---

## 6. 좌표로 행정구역정보 변환

좌표값을 받아 해당 좌표에 부합하는 **행정동 / 법정동 정보**를 반환한다. 대략적인 지역 정보를 제공하여 위치 기반 서비스(맛집, 날씨 등) 연계에 활용할 수 있다.

### 쿼리 파라미터

| 이름 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `x` | String | ✅ | X 좌표 (경위도인 경우 경도) |
| `y` | String | ✅ | Y 좌표 (경위도인 경우 위도) |
| `input_coord` | String | | 입력 좌표계 (기본 `WGS84`)<br>지원: `WGS84`, `WCONGNAMUL`, `CONGNAMUL`, `WTM`, `TM` |
| `output_coord` | String | | 출력 좌표계 (기본 `WGS84`)<br>지원: `WGS84`, `WCONGNAMUL`, `CONGNAMUL`, `WTM`, `TM` |

### 응답 — Meta

| 이름 | 타입 | 설명 |
|---|---|---|
| `total_count` | Integer | 검색된 문서 수 |

### 응답 — Document

| 이름 | 타입 | 설명 |
|---|---|---|
| `region_type` | String | `H`(행정동) 또는 `B`(법정동) |
| `address_name` | String | 전체 지역 명칭 |
| `region_1depth_name` | String | 시도 단위 (바다 영역은 존재하지 않음) |
| `region_2depth_name` | String | 구 단위 |
| `region_3depth_name` | String | 동 단위 |
| `region_4depth_name` | String | `region_type=B`이며 리(里) 영역인 경우에만 존재 |
| `code` | String | region 코드 |
| `x` | Double | 경도 |
| `y` | Double | 위도 |

### 예제

**요청**

```bash
curl -v -G GET "https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=127.1086228&y=37.4012191" \
  -H "Authorization: KakaoAK ${REST_API_KEY}"
```

**응답**

```json
{
  "meta": { "total_count": 2 },
  "documents": [
    {
      "region_type": "B",
      "address_name": "경기도 성남시 분당구 삼평동",
      "region_1depth_name": "경기도",
      "region_2depth_name": "성남시 분당구",
      "region_3depth_name": "삼평동",
      "region_4depth_name": "",
      "code": "4113510900",
      "x": 127.10459896729914,
      "y": 37.40269721785548
    },
    {
      "region_type": "H",
      "address_name": "경기도 성남시 분당구 삼평동",
      "region_1depth_name": "경기도",
      "region_2depth_name": "성남시 분당구",
      "region_3depth_name": "삼평동",
      "region_4depth_name": "",
      "code": "4113565500",
      "x": 127.1163593869371,
      "y": 37.40612091848614
    }
  ]
}
```

---

## 7. 좌표로 주소 변환

좌표의 지번 주소와 도로명 주소를 반환한다. **도로명 주소는 좌표에 따라 반환되지 않을 수 있다.**

### 쿼리 파라미터

| 이름 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `x` | String | ✅ | 경도 |
| `y` | String | ✅ | 위도 |
| `input_coord` | String | | 입력 좌표계 (기본 `WGS84`)<br>지원: `WGS84`, `WCONGNAMUL`, `CONGNAMUL`, `WTM`, `TM` |

### 응답 — Meta

| 이름 | 타입 | 설명 |
|---|---|---|
| `total_count` | Integer | 변환된 주소의 개수 (`0` 또는 `1`) |

### 응답 — Document

| 이름 | 타입 | 설명 |
|---|---|---|
| `address` | `Address` | 지번 주소 상세 |
| `road_address` | `RoadAddress` | 도로명 주소 상세 (없을 수 있음) |

### 응답 — Address

| 이름 | 타입 | 설명 |
|---|---|---|
| `address_name` | String | 전체 지번 주소 |
| `region_1depth_name` | String | 시도 단위 |
| `region_2depth_name` | String | 구 단위 |
| `region_3depth_name` | String | 동 단위 |
| `mountain_yn` | String | 산 여부 (`Y` / `N`) |
| `main_address_no` | String | 지번 주번지 |
| `sub_address_no` | String | 지번 부번지 (없으면 `""`) |

> `zip_code`는 Deprecated.

### 응답 — RoadAddress

| 이름 | 타입 | 설명 |
|---|---|---|
| `address_name` | String | 전체 도로명 주소 |
| `region_1depth_name` | String | 시도 단위 |
| `region_2depth_name` | String | 구 단위 |
| `region_3depth_name` | String | 면 단위 |
| `road_name` | String | 도로명 |
| `underground_yn` | String | 지하 여부 |
| `main_building_no` | String | 건물 본번 |
| `sub_building_no` | String | 건물 부번 (없으면 `""`) |
| `building_name` | String | 건물 이름 |
| `zone_no` | String | 우편번호 (5자리) |

### 예제

```bash
curl -v -G GET "https://dapi.kakao.com/v2/local/geo/coord2address.json?x=127.423084873712&y=37.0789561558879&input_coord=WGS84" \
  -H "Authorization: KakaoAK ${REST_API_KEY}"
```

```json
{
  "meta": { "total_count": 1 },
  "documents": [
    {
      "road_address": {
        "address_name": "경기도 안성시 죽산면 죽산초교길 69-4",
        "region_1depth_name": "경기",
        "region_2depth_name": "안성시",
        "region_3depth_name": "죽산면",
        "road_name": "죽산초교길",
        "underground_yn": "N",
        "main_building_no": "69",
        "sub_building_no": "4",
        "building_name": "무지개아파트",
        "zone_no": "17519"
      },
      "address": {
        "address_name": "경기 안성시 죽산면 죽산리 343-1",
        "region_1depth_name": "경기",
        "region_2depth_name": "안성시",
        "region_3depth_name": "죽산면 죽산리",
        "mountain_yn": "N",
        "main_address_no": "343",
        "sub_address_no": "1"
      }
    }
  ]
}
```

---

## 8. 좌표계 변환

서로 다른 좌표계 간 변환을 수행한다.

### 쿼리 파라미터

| 이름 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `x` | Double | ✅ | 경도 |
| `y` | Double | ✅ | 위도 |
| `input_coord` | String | | 입력 좌표계 (기본 `WGS84`) |
| `output_coord` | String | ✅ | 출력 좌표계 |

**지원 좌표계 (input/output 공통)**

`WGS84`, `WCONGNAMUL`, `CONGNAMUL`, `WTM`, `TM`, `KTM`, `UTM`, `BESSEL`, `WKTM`, `WUTM`

> ⚠️ `output_coord`는 **필수 파라미터**다. (다른 좌표 API의 `output_coord`는 선택이지만 좌표계 변환은 필수)

### 응답 — Document

| 이름 | 타입 | 설명 |
|---|---|---|
| `x` | Double | 변환된 X 좌표 |
| `y` | Double | 변환된 Y 좌표 |

### 예제

```bash
curl -v -G GET "https://dapi.kakao.com/v2/local/geo/transcoord.json?x=160710.37729270622&y=-4388.879299157299&input_coord=WTM&output_coord=WGS84" \
  -H "Authorization: KakaoAK ${REST_API_KEY}"
```

```json
{
  "meta": { "total_count": 1 },
  "documents": [
    { "x": 126.57740680000002, "y": 33.453357700000005 }
  ]
}
```

---

## 9. 키워드로 장소 검색

질의어에 매칭된 장소 검색 결과를 정렬 기준에 따라 제공한다. 현재 위치 좌표, 반경 제한, 정렬 옵션, 페이징 등의 옵션을 사용할 수 있다.

### 쿼리 파라미터

| 이름 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `query` | String | ✅ | 검색을 원하는 질의어 |
| `category_group_code` | String | | 카테고리 그룹 코드 (결과 필터링) |
| `x` | String | | 중심 X 좌표 (경도). `radius`와 함께 사용 |
| `y` | String | | 중심 Y 좌표 (위도). `radius`와 함께 사용 |
| `radius` | Integer | | 중심 좌표로부터 반경 거리. 단위 m, **0 ~ 20000** |
| `rect` | String | | 사각 범위 내 제한 검색 좌표<br>`좌측X, 좌측Y, 우측X, 우측Y` 형식 |
| `page` | Integer | | 결과 페이지 번호 (1~45, 기본 1) |
| `size` | Integer | | 한 페이지 결과 수 (1~15, 기본 15) |
| `sort` | String | | `distance` 또는 `accuracy` (기본 `accuracy`)<br>`distance` 사용 시 기준 좌표 `x`, `y` 필요 |

### 응답 — Meta

| 이름 | 타입 | 설명 |
|---|---|---|
| `total_count` | Integer | 검색된 문서 수 |
| `pageable_count` | Integer | 노출 가능 문서 수 (최대 `45`) |
| `is_end` | Boolean | 마지막 페이지 여부 |
| `same_name` | `SameName` | 질의어의 지역 및 키워드 분석 정보 |

### 응답 — SameName

| 이름 | 타입 | 설명 |
|---|---|---|
| `region` | String[] | 질의어에서 인식된 지역 리스트 (예: '중앙로 맛집' → '중앙로') |
| `keyword` | String | 지역 정보를 제외한 키워드 (예: '맛집') |
| `selected_region` | String | 인식된 지역 리스트 중 현재 검색에 사용된 지역 |

### 응답 — Document

| 이름 | 타입 | 설명 |
|---|---|---|
| `id` | String | 장소 ID |
| `place_name` | String | 장소명, 업체명 |
| `category_name` | String | 카테고리 이름 (예: `음식점 > 한식`) |
| `category_group_code` | String | 중요 카테고리만 그룹핑한 코드 |
| `category_group_name` | String | 카테고리 그룹명 |
| `phone` | String | 전화번호 |
| `address_name` | String | 전체 지번 주소 |
| `road_address_name` | String | 전체 도로명 주소 |
| `x` | String | X 좌표 (경도) |
| `y` | String | Y 좌표 (위도) |
| `place_url` | String | 장소 상세페이지 URL |
| `distance` | String | 중심좌표까지의 거리 m (`x`, `y` 파라미터를 준 경우에만) |

### 예제 — 서울 강남구 삼성동 20km 반경에서 "카카오프렌즈" 검색

```bash
curl -v -G GET "https://dapi.kakao.com/v2/local/search/keyword.json?y=37.514322572335935&x=127.06283102249932&radius=20000" \
  -H "Authorization: KakaoAK ${REST_API_KEY}" \
  --data-urlencode "query=카카오프렌즈"
```

```json
{
  "meta": {
    "same_name": { "region": [], "keyword": "카카오프렌즈", "selected_region": "" },
    "pageable_count": 14,
    "total_count": 14,
    "is_end": true
  },
  "documents": [
    {
      "place_name": "카카오프렌즈 코엑스점",
      "distance": "418",
      "place_url": "http://place.map.kakao.com/26338954",
      "category_name": "가정,생활 > 문구,사무용품 > 디자인문구 > 카카오프렌즈",
      "address_name": "서울 강남구 삼성동 159",
      "road_address_name": "서울 강남구 영동대로 513",
      "id": "26338954",
      "phone": "02-6002-1880",
      "category_group_code": "",
      "category_group_name": "",
      "x": "127.05902969025047",
      "y": "37.51207412593136"
    }
  ]
}
```

---

## 10. 카테고리로 장소 검색

미리 정의된 카테고리 코드에 해당하는 장소를 검색한다.

### 쿼리 파라미터

| 이름 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `category_group_code` | String | ✅ | 카테고리 그룹 코드 |
| `x` | String | ⚠️ | 중심 X 좌표 (경도) |
| `y` | String | ⚠️ | 중심 Y 좌표 (위도) |
| `radius` | Integer | ⚠️ | 반경 거리 m (0 ~ 20000) |
| `rect` | String | ⚠️ | 사각 영역 `좌X, 좌Y, 우X, 우Y` |
| `page` | Integer | | 1 ~ 45 (기본 1) |
| `size` | Integer | | 1 ~ 15 (기본 15) |
| `sort` | String | | `distance` 또는 `accuracy` (기본 `accuracy`) |

> ⚠️ `(x, y, radius)` 조합 **또는** `rect` 중 **하나는 반드시** 포함되어야 한다.

### 응답 — Meta / Document

키워드 검색과 동일한 구조를 따른다 (`same_name`, `pageable_count`, `is_end`, `documents` 모두 동일).

### 예제 — 카테고리 약국(PM9) 검색

```bash
curl -v -G GET "https://dapi.kakao.com/v2/local/search/category.json?category_group_code=PM9&x=127.06283102249932&y=37.514322572335935&radius=20000" \
  -H "Authorization: KakaoAK ${REST_API_KEY}"
```

```json
{
  "meta": {
    "same_name": null,
    "pageable_count": 11,
    "total_count": 11,
    "is_end": true
  },
  "documents": [
    {
      "place_name": "장생당약국",
      "distance": "",
      "place_url": "http://place.map.kakao.com/16618597",
      "category_name": "의료,건강 > 약국",
      "address_name": "서울 강남구 대치동 943-16",
      "road_address_name": "서울 강남구 테헤란로84길 17",
      "id": "16618597",
      "phone": "02-558-5476",
      "category_group_code": "PM9",
      "category_group_name": "약국",
      "x": "127.05897078335246",
      "y": "37.506051888130386"
    }
  ]
}
```

---

## 11. 카테고리 그룹 코드

키워드/카테고리 장소 검색의 `category_group_code` 파라미터에서 사용한다.

| 코드 | 의미 | 코드 | 의미 |
|---|---|---|---|
| `MT1` | 대형마트 | `BK9` | 은행 |
| `CS2` | 편의점 | `CT1` | 문화시설 |
| `PS3` | 어린이집, 유치원 | `AG2` | 중개업소 |
| `SC4` | 학교 | `PO3` | 공공기관 |
| `AC5` | 학원 | `AT4` | 관광명소 |
| `PK6` | 주차장 | `AD5` | 숙박 |
| `OL7` | 주유소, 충전소 | `FD6` | 음식점 |
| `SW8` | 지하철역 | `CE7` | 카페 |
| | | `HP8` | 병원 |
| | | `PM9` | 약국 |

---

## 12. 호출 예시 코드

### TypeScript / Node.js (fetch)

```ts
const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY!;
const BASE = 'https://dapi.kakao.com/v2/local';
const HEADERS = { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` };

// 주소 → 좌표 변환
async function geocode(query: string) {
  const url = new URL(`${BASE}/search/address.json`);
  url.searchParams.set('query', query);
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Kakao geocode ${res.status}: ${await res.text()}`);
  return res.json();
}

// 좌표 → 주소 변환
async function reverseGeocode(x: number, y: number) {
  const url = new URL(`${BASE}/geo/coord2address.json`);
  url.searchParams.set('x', String(x));
  url.searchParams.set('y', String(y));
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Kakao reverse ${res.status}`);
  return res.json();
}

// 키워드 장소 검색
async function searchKeyword(
  query: string,
  opts: { x?: number; y?: number; radius?: number; sort?: 'distance' | 'accuracy' } = {},
) {
  const url = new URL(`${BASE}/search/keyword.json`);
  url.searchParams.set('query', query);
  if (opts.x !== undefined) url.searchParams.set('x', String(opts.x));
  if (opts.y !== undefined) url.searchParams.set('y', String(opts.y));
  if (opts.radius !== undefined) url.searchParams.set('radius', String(opts.radius));
  if (opts.sort) url.searchParams.set('sort', opts.sort);
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Kakao keyword ${res.status}`);
  return res.json();
}
```

### Python (requests)

```python
import os
import requests

KAKAO_REST_API_KEY = os.environ["KAKAO_REST_API_KEY"]
BASE = "https://dapi.kakao.com/v2/local"
HEADERS = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}

def geocode(query: str, page: int = 1, size: int = 10):
    """주소 → 좌표 변환"""
    params = {"query": query, "page": page, "size": size}
    r = requests.get(f"{BASE}/search/address.json", headers=HEADERS, params=params, timeout=10)
    r.raise_for_status()
    return r.json()

def reverse_geocode(x: float, y: float, input_coord: str = "WGS84"):
    """좌표 → 주소 변환"""
    params = {"x": x, "y": y, "input_coord": input_coord}
    r = requests.get(f"{BASE}/geo/coord2address.json", headers=HEADERS, params=params, timeout=10)
    r.raise_for_status()
    return r.json()

def coord_to_region(x: float, y: float):
    """좌표 → 행정구역 변환"""
    r = requests.get(
        f"{BASE}/geo/coord2regioncode.json",
        headers=HEADERS,
        params={"x": x, "y": y},
        timeout=10,
    )
    r.raise_for_status()
    return r.json()

def search_keyword(query: str, x: float = None, y: float = None, radius: int = None, sort: str = "accuracy"):
    """키워드 장소 검색"""
    params = {"query": query, "sort": sort}
    if x is not None: params["x"] = x
    if y is not None: params["y"] = y
    if radius is not None: params["radius"] = radius
    r = requests.get(f"{BASE}/search/keyword.json", headers=HEADERS, params=params, timeout=10)
    r.raise_for_status()
    return r.json()

def search_category(category_group_code: str, x: float, y: float, radius: int = 1000):
    """카테고리 장소 검색"""
    params = {"category_group_code": category_group_code, "x": x, "y": y, "radius": radius}
    r = requests.get(f"{BASE}/search/category.json", headers=HEADERS, params=params, timeout=10)
    r.raise_for_status()
    return r.json()
```

### cURL

```bash
# 주소 → 좌표 변환
curl -v -G GET "https://dapi.kakao.com/v2/local/search/address.json" \
  -H "Authorization: KakaoAK ${REST_API_KEY}" \
  --data-urlencode "query=서울 강남구 테헤란로 152"

# 키워드 검색
curl -v -G GET "https://dapi.kakao.com/v2/local/search/keyword.json" \
  -H "Authorization: KakaoAK ${REST_API_KEY}" \
  --data-urlencode "query=강남역 맛집" \
  -d "x=127.0276&y=37.4979&radius=1000"

# 카테고리 검색 (카페)
curl -v -G GET "https://dapi.kakao.com/v2/local/search/category.json" \
  -H "Authorization: KakaoAK ${REST_API_KEY}" \
  -d "category_group_code=CE7&x=127.0276&y=37.4979&radius=500"
```

---

## 13. 에러 처리

REST API 응답은 [공통 응답 코드](https://developers.kakao.com/docs/ko/rest-api/reference)를 따른다.

### 자주 발생하는 케이스

| 증상 | 원인 | 해결 |
|---|---|---|
| `401 Unauthorized` | `Authorization` 헤더 누락 또는 `KakaoAK ` 접두어 누락 | 헤더 값을 `KakaoAK ${REST_API_KEY}` 형식으로 확인 |
| `403 Forbidden` | 카카오맵 사용 설정 OFF, 또는 권한 없음 | 콘솔에서 [카카오맵] > [사용 설정] ON 전환 |
| `documents` 빈 배열 | 검색 결과 없음 | 정상 응답, UI에 "결과 없음" 노출 |
| 도로명 검색 시 결과 0건 | 카카오 DB의 도로명 매칭 한계 | 지번 주소로 재시도, 또는 `analyze_type=similar` 활용 |
| `429 Too Many Requests` | 쿼터 초과 | 지수 백오프 재시도, 캐싱 적용 |

자세한 에러 코드는 [REST API 에러 코드](https://developers.kakao.com/docs/ko/rest-api/error-code)를 참고할 것.

---

## 14. 쿼터 & 운영 정책

- 카카오 API는 원활한 서비스 제공을 위해 **월간 및 일간 쿼터**를 적용한다.
- 현재 적용 중인 쿼터 정보는 [쿼터 페이지](https://developers.kakao.com/docs/ko/getting-started/quota)에서 확인 가능.
- 무료 제공 쿼터 외 추가 제공량이 필요한 경우 [유료 API](https://developers.kakao.com/docs/ko/app-setting/paid-api) 설정이 필요.

**권장 운영 패턴**

- 동일 주소/좌표에 대한 결과는 Redis 또는 DB에 **캐싱** (변하지 않는 데이터이므로 TTL 길게 설정 가능)
- 자동완성 등 빠른 입력에는 **디바운스** 적용
- `429` 응답 수신 시 **지수 백오프** 재시도

---

## 15. 하네스 엔지니어링 적용 가이드

### 아키텍처 — BFF 경유 호출 권장

```
┌────────────┐   /api/geo/*   ┌──────────────────┐   KakaoAK {KEY}   ┌─────────────────────┐
│  Frontend  │ ─────────────▶ │  Backend (BFF)   │ ────────────────▶ │  Kakao Local API    │
│            │                │  - 키 환경변수   │                   │  dapi.kakao.com     │
│            │                │  - 캐싱 (Redis)  │                   │  /v2/local/...      │
└────────────┘                └──────────────────┘                   └─────────────────────┘
```

### BFF 내부 엔드포인트 권장 매핑

| 내부 엔드포인트 | 카카오 엔드포인트 | 용도 |
|---|---|---|
| `GET /api/geo/geocode?query=` | `/v2/local/search/address.json` | 주소 → 좌표 |
| `GET /api/geo/reverse?x=&y=` | `/v2/local/geo/coord2address.json` | 좌표 → 주소 |
| `GET /api/geo/region?x=&y=` | `/v2/local/geo/coord2regioncode.json` | 행정구역 |
| `GET /api/geo/transcoord?...` | `/v2/local/geo/transcoord.json` | 좌표계 변환 |
| `GET /api/places/keyword?...` | `/v2/local/search/keyword.json` | 키워드 검색 |
| `GET /api/places/category?...` | `/v2/local/search/category.json` | 카테고리 검색 |

### 응답 데이터 정규화 패턴

API의 `x`, `y`는 문자열이고 SDK는 `LatLng(lat, lng)` 순으로 받으므로, BFF에서 한 번 정규화하는 것을 권장한다.

```ts
type NormalizedPlace = {
  id: string;
  name: string;
  lat: number;    // y → 위도
  lng: number;    // x → 경도
  address: string;
  roadAddress: string;
  categoryGroup: string;
  url: string;
  distance: number | null;
};

function normalize(doc: any): NormalizedPlace {
  return {
    id: doc.id,
    name: doc.place_name,
    lat: Number(doc.y),
    lng: Number(doc.x),
    address: doc.address_name,
    roadAddress: doc.road_address_name,
    categoryGroup: doc.category_group_name,
    url: doc.place_url,
    distance: doc.distance ? Number(doc.distance) : null,
  };
}
```

### 체크리스트

- [ ] REST API 키를 서버 환경변수에만 보관 (프론트 미노출)
- [ ] 카카오맵 사용 설정 ON 확인
- [ ] 인증 헤더 `KakaoAK ` 접두어 (공백 포함) 확인
- [ ] `x`(경도), `y`(위도) 순서 명확히 주석
- [ ] `documents` 빈 배열 케이스 처리
- [ ] 401 / 403 / 429 각 케이스 에러 핸들링
- [ ] `zone_no` 사용 (deprecated `zip_code` 사용 금지)
- [ ] 캐싱 레이어 (Redis 등) 적용
- [ ] 쿼터 사용량 모니터링

---

## 16. 참고 링크

- [카카오 개발자 콘솔](https://developers.kakao.com/console/app)
- [로컬 API 이해하기](https://developers.kakao.com/docs/ko/local/common)
- [로컬 API REST 가이드](https://developers.kakao.com/docs/ko/local/dev-guide)
- [REST API 테스트 도구](https://developers.kakao.com/tool/rest-api/open/get/v2-local-search-address.%7Bformat%7D)
- [REST API 응답/에러 레퍼런스](https://developers.kakao.com/docs/ko/rest-api/reference)
- [REST API 에러 코드](https://developers.kakao.com/docs/ko/rest-api/error-code)
- [쿼터](https://developers.kakao.com/docs/ko/getting-started/quota)
- [유료 API](https://developers.kakao.com/docs/ko/app-setting/paid-api)
