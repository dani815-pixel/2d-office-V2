# MODULARIZATION GUIDE

**index.html (단일 파일 Prototype) → React / Vite / TypeScript 파일 구조 마이그레이션 지침서**

이 문서는 현재 `index.html`을 기존 V1 프로젝트(React/Vite/TS)와 통합하기 위한 **파일 분리 기준과 절차**를 정의합니다.
현재 코드의 IIFE 모듈(`const MARKET = (() => {...})()`)은 **미래의 파일 1개와 1:1로 대응**되도록 작성되어 있습니다.

---

# 1. 핵심 원칙 (절대 규칙)

1. **단방향 데이터 흐름**
   ```
   MARKET → MEETING → STAGE        (읽기 방향만 허용, 역방향 참조 금지)
   AI → PARSER → CryptoMarketBrief → MEETING
   ```
2. **Meeting Engine은 MarketBrief만 소비한다.** AI 원문 응답(AI Response)을 Meeting/UI가 직접 해석 금지. 반드시 `AI Response → Parser → Normalized Data → Meeting Engine`.
3. **Market Tick은 Meeting을 리렌더하지 않는다.** 회의 중 가격 멘트는 발언 시점에 `placeholders.resolve()`로 현재 Snapshot을 읽는 방식 유지.
4. **STAGE만 canvas에 그린다.** UI 레이어(React 컴포넌트)는 canvas를 직접 조작하지 않고, STAGE의 공개 API(`enterChar`, `speak`, `banner`…)만 호출한다.
5. **녹화 대상은 STAGE canvas 하나.** `RECORDER`는 반드시 `STAGE.canvas`만 소비한다.
6. **시크릿은 서버 환경변수만.** 프론트 번들에 어떤 Key/Token도 포함 금지 (`OPENROUTER_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`).
7. **무한 재시도/무한 수리 금지.** AI 재시도 · Auto Repair(최대 2회) · Telegram 재시도(1회) 상한은 마이그레이션 후에도 유지.
8. **정직한 상태 표시.** Backend 미연결 시 `DEMO/NOT CONNECTED`를 명시. 랜덤 수치를 LIVE처럼 위장 금지.

---

# 2. 목표 파일 구조

```
2d-crypto-ai-office-v2/
├── index.html
├── vite.config.ts / tsconfig.json / package.json
├── src/
│   ├── main.tsx
│   ├── App.tsx                        # 탭 라우팅(MEETING/AI/TRADING/REPORT/ARCHIVE)
│   │
│   ├── core/
│   │   ├── types.ts                   # Data Contracts (§3 전체)  ★최우선 작성
│   │   ├── config.ts                  # ← CONFIG (W/H, COINS, SEAT_X, DOOR…)
│   │   ├── utils.ts                   # ← U (fmt/esc/uuid/clamp…)
│   │   ├── store.ts                   # ← STORE (localStorage 래퍼, 키 타입화)
│   │   └── eventBus.ts                # 마켓 틱·Live Signal 등 구독 채널
│   │
│   ├── market/
│   │   ├── MarketService.ts           # ← MARKET (snapshot, onTick, isLive)
│   │   └── connectors/
│   │       ├── binanceWs.ts           # ← connectWS (miniTicker)
│   │       └── demoFeed.ts            # ← DEMO snapshot (지금의 정적 데이터)
│   │
│   ├── characters/
│   │   ├── definitions.ts             # ← DEFS, SEAT_OF, ENTER_ORDER (§8/§9/§10)
│   │   ├── spriteFactory.ts           # ← SPRITES (픽셀맵 → offscreen canvas)
│   │   └── CharacterActor.ts          # ← 런타임 상태머신 (WALK/SIT/SPEAK…)
│   │
│   ├── stage/
│   │   ├── StageRenderer.ts           # ← STAGE.render/draw* (Pure TS, React 무관)
│   │   ├── StageFX.ts                 # ← 말풍선/배너/섹션/시그널/엔드카드
│   │   └── stageApi.ts                # ← STAGE 공개 API 타입 (enterChar/speak/…)
│   │
│   ├── meeting/
│   │   ├── MeetingEngine.ts           # ← MEETING (start/advance/update/doFinish)
│   │   ├── ScriptBuilder.ts           # ← buildScript (MarketBrief → MeetingEvent[])
│   │   └── placeholders.ts            # ← {{PRICE:BTC}} / {{CHANGE:BTC}} 해석
│   │
│   ├── ai/
│   │   ├── AISettingsStore.ts         # ← AI DEFAULTS + saveFromDOM/toDOM (§77)
│   │   ├── AIGateway.ts               # ← fetchWithTimeout, /api/ai/analyze 호출
│   │   ├── AIStatusMachine.ts         # ← §28 상태 IDLE…ERROR + 파이프라인
│   │   ├── PromptBuilder.ts           # ← PROMPT (AUTO/SMART/CUSTOM)
│   │   ├── ResultParser.ts            # ← PARSER.parse/norm/normMD/normTXT
│   │   ├── Validator.ts               # ← PARSER.validate (§30-31)
│   │   └── AutoRepair.ts              # ← 최대 2회 Repair 루프 (Backend 연동)
│   │
│   ├── broadcast/
│   │   ├── Recorder.ts                # ← RECORDER (MIME 감지/Blob/Download)
│   │   └── BroadcastMode.ts           # ← BROADCAST (Fullscreen API, ESC 핸들링)
│   │
│   ├── telegram/
│   │   └── TelegramGateway.ts         # ← TELEGRAM (중복 방지 meetingId+recordingId)
│   │
│   ├── trading/
│   │   ├── TradingStore.ts            # ← TRADING (scenarios/positions/balance)
│   │   ├── ReviewFlow.ts              # ← close → review → TraderMemory
│   │   └── specialists.ts             # ← SPEC 매핑 (Meeting Role ≠ Trading Coin)
│   │
│   ├── ui/
│   │   ├── components/
│   │   │   ├── TopBar.tsx / Tabs.tsx
│   │   │   ├── MeetingControls.tsx    # Start/Pause/Skip/Speed/Restart/Record/Broadcast
│   │   │   ├── MarketBoard.tsx        # ← UI.marketTick 의 DOM 부분
│   │   │   ├── TranscriptPanel.tsx    # ← UI.transcript/setSpeaker
│   │   │   ├── StageCanvas.tsx        # <canvas ref> + 오버레이 (유일한 canvas 마운트)
│   │   │   ├── PipelineView.tsx       # AI 파이프라인 상태
│   │   │   ├── ValidationList.tsx / RawViewer.tsx
│   │   │   ├── Toast.tsx / ConfirmModal.tsx / ReviewModal.tsx
│   │   │   └── RecordedBar.tsx        # 다운로드/Telegram 업로드 바
│   │   └── pages/
│   │       ├── MeetingPage.tsx        # 스테이지 + 컨트롤 + MarketBoard + Transcript
│   │       ├── AISettingsPage.tsx
│   │       ├── TradingRoomPage.tsx
│   │       ├── ReportPage.tsx
│   │       └── ArchivePage.tsx
│   └── styles/global.css              # 현재 <style> 내용을 토큰화하여 이동
│
└── render-server/                     # ★ 별도 서비스 (Render 배포)
    ├── package.json
    ├── src/
    │   ├── index.ts                   # express/fastify 엔트리 + CORS
    │   ├── routes/health.ts           # GET  /api/health
    │   ├── routes/ai.ts               # POST /api/ai/analyze
    │   ├── routes/telegram.ts         # POST /api/telegram/*
    │   ├── ai/
    │   │   ├── openrouter.ts          # OpenRouter chat/completions 호출
    │   │   ├── modelCatalog.ts        # 모델 메타(컨텍스트/가격/JSON 지원)
    │   │   ├── autoSelect.ts          # 자동 선택 (가용성→컨텍스트→JSON→비용)
    │   │   └── fallbackChain.ts       # Primary→Fallback→2차 Fallback (상한)
    │   └── telegram/bot.ts            # sendMessage / sendVideo
    └── .env                           # OPENROUTER_API_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID
```

---

# 3. Data Contracts — `src/core/types.ts` (그대로 시작점으로 사용)

```ts
export type CoinSymbol = 'BTC' | 'ETH' | 'BNB' | 'XRP' | 'SOL';

/** MARKET */
export interface CoinTick { price: number; chg: number; high: number; low: number; vol: number }
export interface MarketSnapshot {
  source: 'LIVE' | 'DEMO';
  ts: number;
  demoNote?: string;
  coins: Record<CoinSymbol, CoinTick>;
}

/** AI 결과 → 정규화 (Meeting이 소비하는 유일한 입력) */
export interface CryptoMarketBrief {
  __demo?: boolean;
  __provider?: 'openrouter' | 'manual';
  source?: string;
  story: Partial<StoryBlock> | null;
  market: { marketSummary?: string } | null;
  coins: Partial<Record<CoinSymbol, CoinBrief>>;
}
export interface CoinBrief {
  summary: string; technical: string; news: string;
  interpretation: string; counterView: string; risks: string;
  advancedSignals: unknown | null; verification: string;
  tradingBias: string; tradingEntryCondition: string; tradingInvalidation: string;
  tradingMode: string; tradingApprovalCriteria: string; tradingRejectionCriteria: string;
}
export interface StoryBlock {
  mode: string; title: string; openingHook: string; centralQuestion: string;
  debateTopics: string[]; turningPoint: string; surprise: string;
  endingQuestion: string; watchItems: string[]; changes: string[];
}

/** MEETING */
export type CharId = 'lead' | 'analyst' | 'onchain' | 'alt' | 'risk' | 'trader';
export type MeetingEvent =
  | { t: 'speak'; id: CharId; text: string; hl?: { tag: string }; desk?: boolean;
      react?: { id: CharId; kind: EmoteKind; at: number }[] }
  | { t: 'banner'; tag: string; text: string; accent?: string }
  | { t: 'section'; text: string }
  | { t: 'emote'; id: CharId; kind: EmoteKind }
  | { t: 'finish' };
export type EmoteKind = 'react' | 'question' | 'challenge' | 'listen';
export type MeetingState = 'IDLE' | 'ENTERING' | 'RUN' | 'FINISHED';

/** CHARACTER (meetingRole과 tradingCoin은 분리 필드 §9) */
export interface CharacterDef {
  id: CharId; name: string; role: string; en: string; accent: string;
  hair?: 'SHORT' | 'SIDE' | 'SPIKY' | 'CURLY';
  glasses?: boolean; cap?: boolean; tie?: string; badge?: boolean;
  headset?: boolean; hood?: boolean;
  coin: CoinSymbol | null;            // Trading Specialty (역할과 분리)
  palette: { hair: string; skin: string; top: string; pants: string; shoe: string; cap?: string };
}
export type CharState =
  | 'OFFSTAGE' | 'IDLE' | 'WALK' | 'SIT' | 'SPEAK'
  | 'LISTEN' | 'REACT' | 'QUESTION' | 'CHALLENGE' | 'HIGHLIGHT' | 'ACTIVE_SPEAKER';

/** AI (§77) */
export interface AISettings {
  provider: 'openrouter';
  mode: 'AUTO' | 'MANUAL';
  promptMode: 'AUTO' | 'SMART' | 'CUSTOM';
  maxCostPerRequest: number; dailyCostLimit: number; dailyRequestLimit: number;
  analysis: { market: boolean; news: boolean; technical: boolean; trading: boolean;
              previousMeeting: boolean; traderMemory: boolean };
  autoRepair: boolean; maxRepairAttempts: number; fallbackEnabled: boolean;
  endpoint: string;
}
export type AIStatus = 'IDLE' | 'CONNECTING' | 'BUILDING_PROMPT' | 'SELECTING_MODEL'
  | 'ANALYZING' | 'PARSING' | 'VALIDATING' | 'REPAIRING' | 'READY' | 'WARNING' | 'ERROR';
export interface AIResultMeta {           // §78 — API 미제공 값은 날조 금지
  model: string | null; provider: 'openrouter'; latency: string;
  inputTokens: number | 'n/a'; outputTokens: number | 'n/a';
  estimatedCost: number | 'n/a'; repairCount: number;
}

/** TRADING */
export interface TradeScenario {
  meetingId: string; sym: CoinSymbol; traderId: CharId;
  bias: 'LONG-BIAS' | 'SHORT-BIAS' | 'NEUTRAL';
  entry: string; invalidation: string; mode: 'SPOT' | 'FUTURES';
  decision: 'PENDING' | 'APPROVED' | 'REJECTED';   // 결정자: 김태훈 Team Lead (AI 아님)
}
export interface VirtualPosition {
  id: string; sym: CoinSymbol; side: 'LONG' | 'SHORT'; mode: 'SPOT' | 'FUTURES';
  entry: number; size: number; lev: number; openedAt: number; meetingId: string;
}
export interface TradeReview { id: string; sym: CoinSymbol; side: string; result: number;
  cause: string; lesson: string; date: string }
export interface TraderMemoryEntry { coin: CoinSymbol; result: number; cause: string;
  lesson: string; date: string }

/** MEMORY / RECORDING / TELEGRAM */
export interface MeetingMemory { date: string; title: string; summary: string; watchItems: string[] }
export interface RecordingState { status: 'IDLE' | 'RECORDING';
  recordingId: string | null; mime: string; startedAt: number }
export interface TelegramState { status: 'DISABLED' | 'CONNECTING' | 'READY' | 'SENDING'
  | 'SENT' | 'FAILED' | 'RETRYING'; lastLog?: string }
export type ValidationIssueStatus = 'ok' | 'warn' | 'bad';
export interface ValidationIssue { label: string; status: ValidationIssueStatus }
```

---

# 4. 현재 모듈 → 미래 파일 매핑표

| index.html 모듈 | 미래 파일 | 주의사항 |
|---|---|---|
| `CONFIG` | `core/config.ts` | SEAT_X/DOOR 등 좌표는 스테이지 스펙이므로 그대로 이동 |
| `U` | `core/utils.ts` | DOM 의존(`$`,`toast`,`icons`)만 분리 → `ui/`로 |
| `STORE` | `core/store.ts` | 키를 string literal union으로 타입화, `cao2.` prefix 유지(기존 사용자 데이터 호환) |
| `MARKET` | `market/MarketService.ts` | `connectWS` → `connectors/binanceWs.ts`, DEMO 데이터 → `demoFeed.ts` |
| `SPRITES` | `characters/spriteFactory.ts` | 픽셀맵 상수는 이 파일에 그대로, 순수 함수 유지 |
| `CHARACTERS` | `characters/definitions.ts` + `CharacterActor.ts` | `update(dt)`는 순수 TS. 정의(DEFS)와 런타임 분리 |
| `STAGE` | `stage/StageRenderer.ts` + `StageFX.ts` | rAF 루프는 `StageCanvas.tsx`가 start/stop. 공개 API만 `stageApi.ts`로 노출 |
| `MEETING` | `meeting/MeetingEngine.ts` + `ScriptBuilder.ts` + `placeholders.ts` | 엔진은 React 상태와 무관하게 동작. UI는 이벤트 콜백만 구독 |
| `AI` | `ai/AISettingsStore.ts` + `AIGateway.ts` + `AIStatusMachine.ts` | `finishWithRaw`의 autoCommit 정책 유지 |
| `PROMPT` | `ai/PromptBuilder.ts` | 템플릿 문자열 한글 그대로, 스냅샷 주입형 순수 함수 |
| `PARSER` | `ai/ResultParser.ts` + `Validator.ts` + `demoBrief.ts` | demoBrief는 `market/demoFeed.ts`와 함께 `__demo` 플래그 유지 |
| `RECORDER` | `broadcast/Recorder.ts` | `STAGE.canvas.captureStream(30)` 단일 소스 유지 |
| `TELEGRAM` | `telegram/TelegramGateway.ts` | 재시도 1회 상한, 중복 방지 Set 유지 |
| `TRADING` | `trading/TradingStore.ts` + `ReviewFlow.ts` | position PnL 계산 `pnl()`은 MarketSnapshot 주입형 |
| `UI` | `ui/components/*` + `ui/pages/*` | transcript/marketTick DOM 로직 → React 상태로 전환 |
| `BROADCAST` | `broadcast/BroadcastMode.ts` | `body.broadcast` 클래스 정책 → Tailwind variant 또는 CSS 그대로 |

---

# 5. 마이그레이션 순서 (Phase)

## Phase 0 — 스캐폴드
```bash
npm create vite@latest 2d-crypto-ai-office-v2 -- --template react-ts
```
- Tailwind 설정, `global.css`로 현재 `<style>` 토큰 이동
- `window.CAO2` 디버그 네임스페이스를 `src/debug.ts`로 유지(선택)

## Phase 1 — core (의존 없음, 먼저)
1. `types.ts`(§3) → 2. `config.ts` → 3. `utils.ts` → 4. `store.ts`
- 완료 기준: 기존 모든 모듈이 타입 import만으로 동작

## Phase 2 — market
- `MarketService`를 싱글턴 export. tick 시 React 상태를 직접 건드리지 말고 `eventBus.emit('market', snap)`
- 완료 기준: 콘솔에서 1초 단위 Snapshot 확인, WS 실패 시 DEMO 배지 로직 동일

## Phase 3 — characters + stage (순수 TS, React 없이 먼저)
- `StageRenderer.start(canvas)` / `.stop()` 형태로 rAF 관리
- 완료 기준: 빈 페이지에 canvas 하나만 띄워 입장→착석 연출 재현

## Phase 4 — meeting
- 엔진 콜백: `onTranscript`, `onStatus`, `onProgress`, `onFinish` 주입형 (현재의 `UI?.xxx` 호출부를 인터페이스로)
- 완료 기준: DEMO BRIEF로 전체 회의 auto-play

## Phase 5 — ai / prompt / parser
- `AIGateway`가 유일하게 `settings.endpoint`를 참조
- 페이즈 완료 기준: Manual Import → Validation → Brief 확정 → 회의 반영

## Phase 6 — broadcast / recorder / telegram
- `Recorder`는 `StageRenderer`의 canvas getter만 의존
- 완료 기준: Broadcast ON → 녹화 → 종료 → webm 다운로드

## Phase 7 — trading
- `TradingStore`는 MarketSnapshot을 함수 인자로 받도록(순수 계산 분리)
- 완료 기준: 승인→포지션→청산→Review→Memory→다음 Prompt 반영 루프

## Phase 8 — UI React化 (마지막)
- StageCanvas만 ref로 canvas를 보유, 나머지 DOM을 컴포넌트로
- Broadcast 모드: 조걶부 렌더 대신 `body.broadcast` CSS 정책 유지 권장(녹화 중 DOM 언마운트로 canvas 스트림이 끊기는 것을 방지)

## 병행 — render-server
- `routes/ai.ts`는 클라이언트 계약(README §4)을 그대로 구현
- OpenRouter `autoSelect` 순서: **가용성 → 컨텍스트 길이 → JSON/Structured 지원 → 비용 한도 → Fallback 여부**
- 실제 사용 모델을 응답 `model`에 포함 (UI 표시 의무화, 모델명 하드코딩 금지)

---

# 6. 완료 체크리스트

- [ ] 어떤 파일도 `process.env.OPENROUTER_API_KEY`를 import하지 않는다 (서버 제외)
- [ ] `grep -r "Math.random" src/market` → 가격 생성에 사용 없음
- [ ] Meeting Engine 테스트: MarketBrief fixture만으로 회의 완주
- [ ] 캔버스 회전율: Market tick 중에도 Meeting DOM/상태 불변 (§15)
- [ ] Broadcast: ESC → fullscreenchange 정상 해제, 녹화 스트림 유지
- [ ] Validation 실패 시 Auto Repair ≤ 2회, 원문 보존, 무한 루프 없음
- [ ] Telegram: `meetingId+recordingId`로 새로고침필 경우에도 중복 게시 없음
- [ ] RESET ALL DATA 후 캐릭터/코인/기본팀 정의는 유지됨 (§72)

---

> 이 지침서의 모듈 경계는 현재 `index.html`의 주석 블록(`/* ===== MODULE: XXX ===== */`)과 동일합니다.
> 분리 작업 시에는 주석 단위로 코드를 잘라 옮기고, 각 파일 상단에 원본 모듈명 주석을 남기면 추적이 쉽습니다.
