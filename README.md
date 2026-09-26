# 2D CRYPTO AI OFFICE V2

**AI Crypto Meeting & Broadcast Studio**

AI가 오늘 시장을 분석하고, 2D 캐릭터 6인이 실제 투자 분석 회의를 진행하며, 그 회의를 방송 콘텐츠로 녹화해 Telegram까지 자동 배포하는 시스템입니다.

```
Market Snapshot → Prompt Builder → Render → OpenRouter → AI Research
→ Parser → Validation → Market Brief → Meeting Engine → 2D Stage
→ Recording → Download / Telegram → Trading Scenario → Team Lead 승인
→ Virtual Trade → Review → Trader Memory → 다음 회의
```

> 현재 산출물은 **실행 가능한 단일 파일 Prototype**(`index.html`)입니다.
> 빌드 없이 브라우저에서 바로 실행되며, Render Backend 연결 없이도 DEMO MODE로 전 과정을 확인할 수 있습니다.

---

# 1. 빠른 시작

## 요구 환경
- 최신 **Chrome / Edge** 권장 (MediaRecorder + Fullscreen + WebSocket 모두 사용)
- Firefox 지원 (녹화 포맷은 브라우저가 자동 선택)
- 권장 해상도: **Desktop 1920×1080 · 1600×900 · 1366×768**, Mobile은 **가로 모드** (Galaxy S20 기준)

## 실행
```bash
# 방법 1 — 파일로 바로 열기
index.html 더블클릭

# 방법 2 — 로컬 서버 (권장)
npx serve .
# 또는
python -m http.server 8080
```

## 5분 데모 시나리오
1. 상단 배지 확인 — 인터넷이 되면 `LIVE · BINANCE`, 아니면 `DEMO DATA` (둘 다 정상, 랜덤 가짜 데이터는 표시하지 않음)
2. **회의 시작** 클릭 → 입구에서 6인 캐릭터가 순서대로 걸어와 착석 → 자동 회의 진행
3. **AI SETTINGS** 탭 → `PROMPT 생성` → `COPY PROMPT` → 외부 AI(ChatGPT 등)에 붙여넣기 → 결과를 **MANUAL IMPORT**에 붙여넣기 → `PARSE & VALIDATE` → `MARKET BRIEF로 확정` → 다음 회의에 반영
4. **BROADCAST ON** → 전체화면 + 녹화 + 회의 자동 진행 → 종료 시 `crypto-ai-meeting-YYYY-MM-DD.webm` 자동 다운로드
5. **TRADING ROOM** 탭 → 코인별 시나리오 **승인/거절**(김태훈 Team Lead) → 가상 포지션 → 청산 → Review → Trader Memory 누적

---

# 2. 화면 구성

| 탭 | 기능 |
|---|---|
| **MEETING** | 2D 방송 스테이지(캔버스), 회의 컨트롤, Market Board, Transcript |
| **AI SETTINGS** | Render/OpenRouter 연결, Prompt Builder, AUTO AI 실행, Manual Import, Parser/Validation, 비용 한도 |
| **TRADING ROOM** | Trading Desk 시나리오, Team Lead 승인/거절, 가상 포지션, Trade Review, Trader Memory |
| **REPORT** | 최근 회의 리포트 (복사 가능) |
| **ARCHIVE** | 과거 회의 기록 엞아보기 |

## 회의 컨트롤
`회의 시작` `일시정지` `스킵` `속도(1.0x/1.5x/2.0x)` `다시 시작` `녹화` `⛶ 전체화면` `🔴 BROADCAST ON`

## Broadcast Mode 규칙
- **Native Fullscreen API** 사용 (CSS 가짜 전체화면 아님)
- 사이드바/탭/프롬프트/AI설정/일시정지/스킵 등 **모든 컨트롤이 숨겨짐**
- 시청자 노출: 스테이지, 캐릭터, 말풍선, Market Board, 방송용 자막, 최소한의 REC 표시
- **ESC** → 방송 종료 (회의·녹화는 유지됨)

## 녹화
- 녹화 대상은 **Meeting Stage 캔버스만** (`canvas.captureStream`) — 브라우저 주소창/탭/OS 화면은 절대 포함되지 않음
- MIME 자동 감지: `video/webm;codecs=vp9,opus` → `video/webm` → `video/mp4` 순으로 브라우저 지원 확인
- 종료 시 Blob → **자동 다운로드**. Telegram 업로드가 실패필 경우에도 로컬 파일은 항상 확복됨

---

# 3. AI SETTINGS 사용법

## 3.1 자동 AI (AUTO AI)
```
Market Snapshot → Prompt 생성 → Render → OpenRouter (모델 자동 선택/폴�백은 서버에서)
→ AI 응답 → Parser → Validation → (통과 시) CryptoMarketBrief 자동 확정 → 다음 회의에 반영
```
1. `RENDER BACKEND ENDPOINT` 입력 → `SAVE SETTINGS`
2. `TEST CONNECTION` → READY 확인
3. `RUN AI ANALYSIS` → 파이프라인 상태(Market Data → Prompt → Model → Analysis → Parsing → Validation) 실시간 표시
4. Validation 통과 시 Brief 자동 확정 / 실패 시 Auto Repair(최대 2회) 인터페이스

**Backend 미연결 시** 가짜 성공을 표시하지 않고 `Backend unavailable (DEMO MODE)`로 명시하며, RETRY / MANUAL IMPORT / DEMO BRIEF 옵션을 제공합니다.

## 3.2 수동 AI (MANUAL IMPORT — 기존 V1 워크플로 유지)
1. `PROMPT 생성` → `COPY PROMPT`
2. 외부 AI에 붙여넣고 결과(JSON/Markdown/Text) 복사
3. `MANUAL IMPORT` 붙여넣기 → `PARSE & VALIDATE` → `MARKET BRIEF로 확정`
4. `VIEW RAW` / `COPY RAW`로 원문 확인 가능

### 입력 스키마 (CryptoMarketBrief)
```json
{
  "story": {
    "title": "데일리 브리핑",
    "openingHook": "...", "centralQuestion": "...",
    "turningPoint": "...", "endingQuestion": "...",
    "watchItems": ["BTC 지지선 방어 여부"]
  },
  "market": { "marketSummary": "..." },
  "coins": {
    "BTC": {
      "summary": "...", "technical": "...", "news": "...",
      "counterView": "...", "risks": "...",
      "tradingBias": "LONG-BIAS",
      "tradingEntryCondition": "직전 고점 돌파 후 눌림 확인",
      "tradingInvalidation": "$81,000 이탈 시 무효"
    },
    "ETH": { "…": "…" }, "BNB": { "…": "…" }, "XRP": { "…": "…" }, "SOL": { "…": "…" }
  }
}
```
- AI는 **조건/기준까지만** 제시합니다. 최종 승인/거절은 항상 **김태훈 Team Lead**가 수행합니다.
- Validation 통과 기준: 5개 코인 존재(필수) + story/trading/advancedSignals(경고)

## 3.3 비용 제한
설정: `MAX / REQ`, `DAILY $`, `REQ / DAY` — 오늘 사용량이 한도에 도달하면 자동 분석이 중단됩니다. 사용량은 실제 API 응답의 usage만 집계하며, 미제공 값은 임의로 만들지 않습니다.

---

# 4. Render Backend 연동 (API 계약)

AI Settings에 엔드포인트(예: `https://your-service.onrender.com`)만 입력하면 됩니다.
**OpenRouter Key / Telegram Token은 프론트엔드에 절대 넣지 않습니다** — 모두 Render 환경변수로 관리합니다.

## 환경변수 (Render)
| 변수 | 용도 |
|---|---|
| `OPENROUTER_API_KEY` | OpenRouter Gateway |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot |
| `TELEGRAM_CHANNEL_ID` | 게시 채널 |

## API 표
| Method | Path | 요청 | 응답 |
|---|---|---|---|
| GET | `/api/health` | — | `200 { "ok": true }` |
| POST | `/api/ai/analyze` | `{ prompt: string, settings: AISettings }` | `{ result: string\|object, model?: string, usage?: { input, output, cost } }` |
| POST | `/api/telegram/meeting-start` | `{ meetingId, text }` | `200` |
| POST | `/api/telegram/meeting-end` | `{ meetingId, text }` | `200` |
| POST | `/api/telegram/upload-video` | `FormData{ video: File, caption }` | `200` |

**주의**
- `/api/ai/analyze` 서버 남부에서 OpenRouter 모델 자동 선택 + Fallback 체인 수행 → 실제 사용 모델 ID를 `model`로 반환하면 UI에 표시됩니다. 응답에 없는 메타데이터는 `n/a`로 표시됩니다(날조 금지).
- Telegram 업로드는 `meetingId + recordingId` 기준으로 클라이언트에서 중복 게시를 방지합니다. 새로고침필 경우에도 동일 영상이 두 번 올라가지 않습니다.

---

# 5. 데이터 저장 (LocalStorage)

키 prefix: `cao2.`

| 키 | 내용 |
|---|---|
| `brief` | 확정된 CryptoMarketBrief |
| `aiSettings` | AI 설정 (§77 구조) |
| `memoryTrader` | 트레이더 교훈 → 다음 Prompt 자동 반영 |
| `memoryMeeting` | 이전 회의 요약/미해결 과제 |
| `balance / positions / reviews / scenarios` | Trading Room 상태 |
| `usage` | 오늘 AI 비용/요청 카운터 |
| `archive / report` | 회의 기록 |
| `tgSent` | Telegram 중복 방지 로그 |

**RESET ALL DATA** (우상단) — 위 데이터 전체 초기화. 유지되는 것: 캐릭터 정의, 코인 정의, 기본 팀 구성, 애플리케이션 소스, 기본 설정.

---

# 6. 현재 파일 구조 (모듈 맵)

단일 `index.html` 남부는 향후 분리를 전제로 한 **논리 모듈 구조**입니다.

```
<script>
├── CONFIG       전역 상수 / 코인 / 좌석 좌표
├── U            DOM/포맷/토스트 유틸
├── STORE        localStorage 계층 (키 prefix: cao2.)
├── MARKET       Market Snapshot (Binance WS + DEMO fallback) ● 회의와 분리
├── SPRITES      2D 픽셀 스프라이트 팩토리 (16×20 코드 생성)
├── CHARACTERS   6인 정의 + 런타임 상태 (WALK/SIT/SPEAK/LISTEN/…)
├── STAGE        캔버스 렌더러 = 녹화 단일 대상
├── MEETING      Script Builder + Event Engine ({{PRICE:BTC}} placeholder)
├── AI           AISettings, 상태머신, Render Gateway 인터페이스
├── PROMPT       자동 프롬프트 빌더 (AUTO/SMART/CUSTOM)
├── PARSER       JSON/MD/TEXT → CryptoMarketBrief + Validation + DEMO BRIEF
├── RECORDER     MediaRecorder (MIME 감지 → Blob → Download)
├── TELEGRAM     Render 경유 게이트웨이 (중복 방지)
├── TRADING      Trading Desk / 가상포지션 / Review / Memory
├── UI           탭, Transcript, Report/Archive, 모달
└── BROADCAST    Native Fullscreen 방송 모드
```

디버그 콘솔에서 `window.CAO2`로 모든 모듈에 접근할 수 있습니다 (예: `CAO2.MARKET.snapshot()`).

---

# 7. 트러블슈팅

| 증상 | 원인/해결 |
|---|---|
| `DEMO DATA`로만 표시됨 | 인터넷/방화벽이 Binance WebSocket을 차단 → 정상 동작. LIVE 아님을 숨기지 않습니다 |
| 녹화가 시작되지 않음 | 브라우저 MediaRecorder 지원 확인 (Chrome 권장) |
| Fullscreen이 안 됨 | 브라우저 권한 팝업 차단 → BROADCAST 버튼 재클릭 |
| `AI ANALYSIS FAILED` | Render 엔드포인트 미설정·서버 오류 → RETRY 또는 MANUAL IMPORT로 진행 |
| Telegram 게시 안 됨 | Backend 미연결이면 DEMO로 표기. 영상 로컬 다운로드는 항상 가능 |
| 회의 캐릭터가 안 움직임 | 탭 비활성 시 rAF이 멈출 수 있음 → 탭으로 돌아오면 재개 |

---

# 8. 로드맵

- [ ] `render-server/` 구현 (OpenRouter Auto Model + Fallback, Telegram Bot)
- [ ] 기존 V1 프로젝트와 통합 (React/Vite/TS) — **`MODULARIZATION_GUIDE.md` 참조**
- [ ] Trading Room Office-Life 애니메이션 (자리 이동/커핏/대화/복기)
- [ ] Live Meeting Signal 고도화 (Rolling Window + 확인 횟수)

---

**Security**: 이 저장소의 어디에도 AI/Telegram 시크릿을 커밋하지 마세요. 모든 키는 Render 환경변수에서만 관리합니다.
