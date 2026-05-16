-- ─── Seed: 기존 mock 데이터 삽입 ────────────────
-- schema.sql 실행 후 이 파일을 실행하세요.

DO $$
DECLARE
  p_imweb  UUID;
  p_cafe24 UUID;
  s        UUID;
  b        UUID;
BEGIN

-- ── Platforms ────────────────────────────────────
INSERT INTO platforms (label, description, icon, order_index)
VALUES ('아임웹 가이드북', 'UXUI팀의 아임웹 홈페이지 개발 플로우 가이드입니다.', '🌐', 0)
RETURNING id INTO p_imweb;

INSERT INTO platforms (label, description, icon, order_index)
VALUES ('카페24 가이드북', 'UXUI팀의 카페24 홈페이지 개발 플로우 가이드입니다.', '🛒', 1)
RETURNING id INTO p_cafe24;

-- ── 아임웹 Step 00 ───────────────────────────────
INSERT INTO steps (platform_id, number, title, subtitle, order_index)
VALUES (p_imweb, '00', '아임웹이란?', '아임웹 플랫폼 개요', 0)
RETURNING id INTO s;

INSERT INTO blocks (step_id, type, label, content, order_index)
VALUES (s, 'info', '플랫폼 소개',
'아임웹은 코딩 없이도 쇼핑몰·기업 홈페이지를 제작할 수 있는 국내 대표 홈페이지 빌더 플랫폼입니다.

• 디자인 모드: 드래그&드롭 방식으로 레이아웃 구성
• 관리자 모드: 쇼핑, 예약, 회원관리 등 백엔드 기능 설정
• 커스터마이징 불가 페이지: 로그인, 회원가입, 마이페이지, 쇼핑몰 상세페이지 (정해진 레이아웃에서 옵션 선택 방식)', 0);

-- ── 아임웹 Step 01 ───────────────────────────────
INSERT INTO steps (platform_id, number, title, subtitle, order_index)
VALUES (p_imweb, '01', '클라이언트 초기 세팅', '회원가입 · 리셀러 등록 · 요금제 안내', 1)
RETURNING id INTO s;

INSERT INTO blocks (step_id, type, label, content, order_index)
VALUES (s, 'default', '초기 세팅 프로세스',
'클라이언트가 아임웹 회원가입 진행
가입 계정으로 실무진이 알파브라더스 리셀러 계정 등록
클라이언트가 상황에 맞는 요금제 결제 진행', 0);

INSERT INTO blocks (step_id, type, label, content, order_index)
VALUES (s, 'tip', '회원가입 및 계정 전달 요청',
'클라이언트에게 아임웹 링크 및 카드뉴스를 전달하며 회원가입 진행 후 계정 정보 전달을 요청합니다.

• 카드뉴스는 순서를 맞춰 이미지로 전달합니다 (압축파일 X)
• 아임웹 자체 계정 추천: 구글/페북 계정 가입 시 로그인마다 인증 필요, 네이버 계정 가입 시 메일 수신 불가 발생
• 아임웹 링크: https://imweb.me/', 1);

INSERT INTO blocks (step_id, type, label, content, order_index)
VALUES (s, 'tip', '리셀러 등록',
'전달받은 클라이언트 계정으로 아임웹 로그인 후 홈페이지를 개설합니다.
(템플릿·사이트명 모두 추후 변경 가능)

홈페이지 개설 후 관리자 페이지에서 리셀러에 알파브라더스를 등록합니다.
클라이언트 결제 요금제의 10%가 알파에게 적립됩니다.

등록 경로: 고객사 계정 로그인 → 리소스 → 전문가 찾기 → 전문가 웹사이트 관리 → license@alphabrothers.co.kr 입력

알파브라더스 전문가 계정으로 로그인하여 리셀러 등록 요청을 승인합니다.
• 전문가 계정: license@alphabrothers.co.kr / Alpha123!!', 2);

INSERT INTO blocks (step_id, type, label, content, order_index)
VALUES (s, 'tip', '요금제 안내',
'리셀러 등록 완료 후 클라이언트에게 요금제 결제를 안내합니다.

• 일반 기업 소개 → 스타터
• 일반 쇼핑몰 → 스타터 또는 프로 (프로: 쇼핑등급·적립금·간편결제·해외결제 가능)
• 수출바우처 홈페이지 → 글로벌

요금 안내: https://imweb.me/price', 3);

-- ── 아임웹 Step 02 ───────────────────────────────
INSERT INTO steps (platform_id, number, title, subtitle, order_index)
VALUES (p_imweb, '02', '아임웹 기획 템플릿', '클라이언트 요청 내용 수집', 2)
RETURNING id INTO s;

INSERT INTO blocks (step_id, type, label, content, order_index)
VALUES (s, 'info', '기획 템플릿 제공 의도',
'기획 템플릿은 착수미팅 이후, 홈페이지 구성을 위해 클라이언트에게 필요한 내용을 요청하는 자료입니다.

클라이언트에게 "홈페이지에 넣고 싶은 내용을 전달해달라"고 요청하면 대부분 무엇을 전달해야 할지 모릅니다. 예시 화면과 함께 원하는 내용을 질문하면 훨씬 수월하게 방향성을 잡을 수 있습니다.

기획 템플릿 링크: https://www.figma.com/file/FH9UR6qT7yQPlfqlVq9XjT/', 0);

INSERT INTO blocks (step_id, type, label, content, order_index)
VALUES (s, 'warning', '템플릿은 필수인가요?',
'모든 클라이언트에게 이 템플릿이 적합한 것은 아닙니다.

이미 대략적인 홈페이지 흐름이 잡혀있는 경우, 템플릿 전달보다 와이어프레임을 진행하면서 실무진이 더미로 내용을 작성하는 것을 권장합니다.', 1);

-- ── 아임웹 Step 03 ───────────────────────────────
INSERT INTO steps (platform_id, number, title, subtitle, order_index)
VALUES (p_imweb, '03', '와이어프레임 및 UI', '피그마에서 디자인 확정 후 아임웹에 적용', 3)
RETURNING id INTO s;

INSERT INTO blocks (step_id, type, label, content, order_index)
VALUES (s, 'process', '디자인 프로세스 3단계',
'와이어프레임 제작|홈페이지 전체 페이지 레이아웃과 내용 기획. 필요한 기능은 이 단계에서 확정
메인시안 2종|홈페이지 톤앤매너, 메인페이지 시안 확정
전체 UI 작업|전체 홈페이지 디자인 작업. 완료 후 UXUI 피드백 파일로 클라이언트 피드백 요청', 0);

INSERT INTO blocks (step_id, type, label, content, order_index)
VALUES (s, 'warning', '착수 전 필수 확인',
'아임웹 개발 착수 이전에 디자인 시안이 반드시 확정되어야 합니다.
피그마에서 PC버전 UI 작업을 완료한 후 아임웹에 동일하게 구현합니다.', 1);

-- ── 아임웹 Step 04 ───────────────────────────────
INSERT INTO steps (platform_id, number, title, subtitle, order_index)
VALUES (p_imweb, '04', '아임웹 개발 착수 · 디자인 모드', '디자인 모드 기본 구성 및 위젯 활용', 4)
RETURNING id INTO s;

INSERT INTO blocks (step_id, type, label, content, order_index)
VALUES (s, 'links', '디자인 모드 참고 가이드',
'쇼핑 위젯 설정|쇼핑|https://imweb.me/faq?mode=view&category=29&category2=33&idx=71623|
쇼핑 기획전 위젯 설정|쇼핑|https://imweb.me/faq?mode=view&category=29&category2=33&idx=71624|
상품 진열 방식 4가지|쇼핑|https://imweb.me/faq?mode=view&category=29&category2=33&idx=71742|
상품 상세페이지 디자인 변경|쇼핑|https://imweb.me/faq?mode=view&category=29&category2=33&idx=71687|커스터마이징 불가 (A/B/C 중 택1)
상단 서브메뉴 스타일 변경|디자인|https://imweb.me/faq?mode=view&category=29&category2=33&idx=71571|
섹션 사이드 고정법|디자인|https://imweb.me/blog?idx=172|
API 없이 구글 지도 삽입|디자인|https://imweb.me/faq?mode=view&category=29&category2=33&idx=71556|
PC 하단 고정 섹션 구현|코딩|https://imweb.me/faq?mode=view&category=29&category2=38&idx=71858|
스크롤 이동 버튼 만들기|코딩|https://imweb.me/faq?mode=view&category=29&category2=38&idx=71621|
카카오톡 채널 채팅 버튼 추가|코딩|https://imweb.me/faq?mode=view&category=29&category2=38&idx=71672|
플로팅 배너 만들기|코딩|https://imweb.me/faq?mode=view&category=29&category2=38&idx=71277|
예약 상품 진열하기|예약|https://imweb.me/faq?mode=view&category=29&category2=41&idx=29587|예약 위젯 사용', 0);

-- ── 아임웹 Step 05 ───────────────────────────────
INSERT INTO steps (platform_id, number, title, subtitle, order_index)
VALUES (p_imweb, '05', '아임웹 개발 착수 · 관리자 모드', '홈페이지 백단 설정', 5)
RETURNING id INTO s;

INSERT INTO blocks (step_id, type, label, content, order_index)
VALUES (s, 'links', '관리자 모드 참고 가이드',
'회원가입 절차 설정|회원|https://imweb.me/faq?mode=view&category=29&category2=47&idx=188|
이메일 인증 후 가입 설정|회원|https://imweb.me/faq?mode=view&category=29&category2=47&idx=71697|
쇼핑 기본설정|쇼핑|https://imweb.me/faq?mode=view&category=29&category2=40&idx=71938|
쇼핑 구성 전체 프로세스|쇼핑|https://imweb.me/faq?mode=view&category=28&category2=63&idx=25393|
상품 카테고리 구성|쇼핑|https://imweb.me/faq?mode=view&category=28&category2=63&idx=25401|
상품 등록하기|쇼핑|https://imweb.me/faq?mode=view&category=28&category2=63&idx=25406|
상품 일괄 추가|쇼핑|https://imweb.me/faq?mode=view&category=29&category2=40&idx=71508|
입력폼 관리|콘텐츠|https://imweb.me/faq?mode=view&category=29&category2=37&idx=71395|', 0);

-- ── 아임웹 Step 06 ───────────────────────────────
INSERT INTO steps (platform_id, number, title, subtitle, order_index)
VALUES (p_imweb, '06', '기타 사항 및 마무리', '도메인 연결 · 최종 체크리스트', 6)
RETURNING id INTO s;

INSERT INTO blocks (step_id, type, label, content, order_index)
VALUES (s, 'info', '진행 예정',
'도메인 연결 및 기타 관리자 모드 세팅이 완료되면, 홈페이지 마무리 안내 과정을 추가할 예정입니다.', 0);

-- ── 아임웹 Step 07 ───────────────────────────────
INSERT INTO steps (platform_id, number, title, subtitle, order_index)
VALUES (p_imweb, '07', '가이드 PDF', '클라이언트 전달용 공식 가이드 모음', 7)
RETURNING id INTO s;

INSERT INTO blocks (step_id, type, label, content, order_index)
VALUES (s, 'default', '가이드 파일 목록',
'✅ 홈페이지 완료 이전
• [알파] 가비아 도메인 구입 방법.pdf

✅ 홈페이지 완료 이후 (공통)
• [알파] 아임웹 SSL 신청 가이드.pdf
• [알파] 아임웹 디자인모드 가이드.pdf

✅ 홈페이지 완료 이후 (쇼핑)
• [알파] 아임웹 전자결제(PG) 신청 및 설정 가이드.pdf
• [알파] 쇼핑 회원 등급 및 혜택 안내 가이드.pdf
• [알파] 아임웹 쇼핑몰 약관 설정 가이드.pdf
• [알파] 제품 등록 매뉴얼.pdf', 0);

-- ── 아임웹 Step 08 ───────────────────────────────
INSERT INTO steps (platform_id, number, title, subtitle, order_index)
VALUES (p_imweb, '08', '코드 소스', '실무 적용 코드 모음', 8)
RETURNING id INTO s;

INSERT INTO blocks (step_id, type, label, content, order_index)
VALUES (s, 'default', '코드 아카이빙',
'• 코드로 버튼 만들기 → https://unlimeat.imweb.me/PRODUCT
• 세로 선 넣는 코드 → https://yuhera.imweb.me/ecobox
• 원형 애니메이션 배너 만들기 → https://percentof.imweb.me/
• 코드로 햄버거 메뉴 만들기 → https://yuhera.imweb.me/
• 이미지 겹치게 하기 → https://yuhera.imweb.me/ecobox
• 가로 롤링 배너 만들기 → https://yuhera.imweb.me/ecobox
• 코드로 원페이지 GNB 만들기 → https://yuhera.imweb.me/ecobox
• 마우스 포인터 따라 원형 애니메이션 → https://percentof.imweb.me/', 0);

-- ── 카페24 Step 00 ───────────────────────────────
INSERT INTO steps (platform_id, number, title, subtitle, order_index)
VALUES (p_cafe24, '00', '카페24란?', '카페24 플랫폼 개요', 0)
RETURNING id INTO s;

INSERT INTO blocks (step_id, type, label, content, order_index)
VALUES (s, 'info', '플랫폼 소개',
'카페24는 온라인 비즈니스를 위한 웹호스팅, 서버호스팅, 클라우드 도메인 등을 제공하는 플랫폼입니다.
가입 후 클릭 몇 번으로 누구나 무료로 온라인 쇼핑몰을 구축할 수 있습니다.

• 카페24 쇼핑몰: 상품 결제·구입·판매관리 기능 제공. 단, 결제 및 상품관리 기능 삭제 불가
• 디자인 센터: 무료·유료 디자인 템플릿 제공 → https://d.cafe24.com/home/

주요 팁
• 관리자 모드는 반드시 스마트 모드가 아닌 프로모드로 설정
• 모바일 쇼핑몰 - 모바일 환경 설정에서 PC·모바일 화면전환 "사용함" 체크 필요', 0);

-- ── 카페24 Step 01 ───────────────────────────────
INSERT INTO steps (platform_id, number, title, subtitle, order_index)
VALUES (p_cafe24, '01', '템플릿 서칭 및 제안', '고객 요청 기능 정리 · 스킨 선정 · 구매', 1)
RETURNING id INTO s;

INSERT INTO blocks (step_id, type, label, content, order_index)
VALUES (s, 'process', '진행 순서',
'① 고객 요청 기능 정리|고객사별 주요 기능 파악 (리뷰, 숏폼 등). 감도 vs 기능 비중을 조정하여 서칭
② 스킨 고르기 (약 1일 소요)|색상·이미지보다 핵심 기능 + 전체 레이아웃 구조 중심으로 검토. 최다 기능 스킨 3종 제안 → 심플한 스킨 원할 경우 재서칭
③ 스킨 구매 및 기본 세팅|추가 기능 필요 시 스킨사에 먼저 문의 (비용·기간 확인). 타 업체를 통한 커스텀은 지양
④ 추가 세팅|고객사 요청 추가 기능 정리 후 스킨사에 문의. 와이어프레임 형태로 레이아웃 잡아 고객사에 전달', 0);

INSERT INTO blocks (step_id, type, label, content, order_index)
VALUES (s, 'default', '스킨 선택 기준',
'유형별 특징
• 고감도 저기능: 감성·브랜딩 중심 → 상품군이 비교적 적을 때 적합
• 저감도 고기능: 기능·편의성 중심 → 상품군이 많거나 커머스 스타일 원할 때 적합

비용 구조
• 이미 구현된 섹션을 숨김 처리: 무료
• 신규 섹션·기능 추가: 유료 (스킨사에 사전 문의 필수)', 1);

INSERT INTO blocks (step_id, type, label, content, order_index)
VALUES (s, 'kakao', '클라이언트 안내 멘트 (복사해서 사용)',
'# 스킨 제안 안내
안녕하세요, UXUI디자이너 박지은입니다 :)
AI로 만드신 메인페이지 기준으로 다양한 기능들이 반영된 스킨 3종을 선별하여 제안드립니다.
스킨 선택 시 색상/이미지보다는 원하시는 핵심 기능과 전체 레이아웃 구조를 중심으로 검토하시는 것을 권장드립니다.
신규 섹션 및 기능 추가는 비용이 발생하지만, 이미 구현된 섹션을 숨김 처리하는 것은 비용이 부과되지 않습니다.
검토 후 선호하시는 스킨 말씀 부탁드립니다.
---
# 스킨사 커스텀 문의 결과
스킨사 커스텀 문의 결과 전달드립니다.
타임딜 섹션 추가 비용은 20만원, 작업 기간은 약 1주일 소요됩니다. 스킨 구매 비용 합산 시 총 40만원이 발생합니다.
타임딜 기능이 필요하실 경우, 비용 및 일정 측면에서 1번 또는 2번 스킨 구매를 권장드립니다.', 2);

INSERT INTO blocks (step_id, type, label, content, order_index)
VALUES (s, 'warning', '세팅 전 체크리스트',
'☐ 결제 방식 확인 (계좌이체 / 카드 / 무통장입금)
☐ 세금계산서 / 현금영수증 가능 여부 확인
☐ 스킨사 커스텀 추가 비용 및 소요 기간 확인
☐ 기획안 양식 전달 완료
☐ 카페24 아이디/비밀번호 → 클라이언트 정보 페이지에 등록

⚠️ 수정 시 추가 비용 발생 가능 → 최대한 정확하게 정리하여 전달', 3);

-- ── 카페24 Step 02 ───────────────────────────────
INSERT INTO steps (platform_id, number, title, subtitle, order_index)
VALUES (p_cafe24, '02', '와이어프레임 및 디자인', '레이아웃 기획 및 UI 제작', 2)
RETURNING id INTO s;

INSERT INTO blocks (step_id, type, label, content, order_index)
VALUES (s, 'info', '진행 예정', '카페24 와이어프레임 및 디자인 가이드 작성 예정입니다.', 0);

-- ── 카페24 Step 03 ───────────────────────────────
INSERT INTO steps (platform_id, number, title, subtitle, order_index)
VALUES (p_cafe24, '03', '카페24 구축', '실제 구축 및 커스텀 작업', 3)
RETURNING id INTO s;

INSERT INTO blocks (step_id, type, label, content, order_index)
VALUES (s, 'info', '진행 예정', '카페24 구축 가이드 작성 예정입니다.', 0);

-- ── 카페24 Step 04 ───────────────────────────────
INSERT INTO steps (platform_id, number, title, subtitle, order_index)
VALUES (p_cafe24, '04', '업종별 서비스', '카페24 추천 업종 및 기능 가이드', 4)
RETURNING id INTO s;

INSERT INTO blocks (step_id, type, label, content, order_index)
VALUES (s, 'default', '업종 리스트',
'📃 [쇼핑몰] 패션
📃 [쇼핑몰] 뷰티
📃 [쇼핑몰] 푸드
📃 [쇼핑몰] 가구/인테리어 (진행 중)
📃 [쇼핑몰] 엔터테인먼트 (예정)
📃 [쇼핑몰] 여행/숙박 (예정)', 0);

END $$;
