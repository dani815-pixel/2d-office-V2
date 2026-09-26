import { CONFIG } from '../core/config.ts';

/** Pixel-art sprite factory extracted from the V2 prototype. */
export const SPRITES = (() => {

  // --- 기본 몸통 맵 (16×20). H=hair S=skin E=eye M=mouth T=top P=pants B=shoe ---
  const BODY_A = [
    '....HHHHHHHH....','...HHHHHHHHHH...','...HHHHHHHHHH...','..HHSSSSSSSSHH..',
    '..HHSESSSSESHH..','...SSSSSSSSSS...','...SSSSMMSSSS...','....SSSSSSSS....',
    '..TTTTTTTTTTTT..','.TTTTTTTTTTTTTT.','.TSTTTTTTTTTTST.','.TSTTTTTTTTTTST.',
    '..TTTTTTTTTTTT..','..TTTTTTTTTTTT..','...PPPPPPPPPP...','...PPPPPPPPPP...',
    '...PPPP..PPPP...','...PPPP..PPPP...','...BBBB..BBBB...','...BBBB..BBBB...',
  ];
  const LEGS_B = [ '...PPPPPPPPPP...','...PPPPPPPPPP...',
    '..PPPP....PPPP..','..PPP......PPP..','..BBB......BBB..','.BBB........BBB.' ];
  const SIT_BOTTOM = [ '...PPPPPPPPPP...','..PPPPPPPPPPPP..','..PPPPPPPPPPPP..','..BBBBBBBBBBBB..','................','................' ];
  const MOUTH_OPEN = '...SSSMMMMSSS...';
  const GLASSES_ROW = '..HHGEGGGGEGHH..';

  // --- 헤어 스타일 (rows 0-3 덮어쓰기) ---
  const HAIR = {
    SHORT: null, // base 그대로
    SIDE:  ['..HHHHHHHHHH....','.HHHHHHHHHHHH...','..HHHHHHHHHHH...','..HHHSSSSSSHHH..'.padEnd(16,'.').slice(0,16)],
    SPIKY: ['..H.HH.HH.H.H...','.HHHHHHHHHHHHH..','..HHHHHHHHHHHH..','..HHSSSSSSSSHH..'],
    CURLY: ['....HHHHHHHH....','...HHHHHHHHHH...','..HH.HHHHHH.HH..','..H.HSSSSSSH.H..'],
  };
  const CAP_ROWS = ['....CCCCCCCC....','...CCCCCCCCCC...','..CCCCCCCCCCCC..','..CCSSSSSSSSCC..'];

  const PAD = (s) => (s + '.'.repeat(20)).slice(0,16);

  function renderFrame(def, opt){
    // opt: {legs:'A'|'B'|'SIT', mouth:'open'|'closed'}
    const cv = document.createElement('canvas'); cv.width = 16; cv.height = 20;
    const g = cv.getContext('2d');
    const P = def.palette;
    const ROWS = BODY_A.slice();
    if (def.hair && HAIR[def.hair]) for (let i=0;i<4;i++) ROWS[i] = HAIR[def.hair][i];
    if (def.cap) for (let i=0;i<4;i++) ROWS[i] = CAP_ROWS[i];
    if (def.glasses) ROWS[4] = GLASSES_ROW;
    ROWS[6] = opt.mouth === 'open' ? MOUTH_OPEN : ROWS[6];
    if (opt.legs === 'B'){ for (let i=0;i<6;i++) ROWS[14+i] = LEGS_B[i]; }
    if (opt.legs === 'SIT'){ for (let i=0;i<6;i++) ROWS[14+i] = SIT_BOTTOM[i]; }

    const COLOR = { H:P.hair, S:P.skin, E:'#14161f', M:'#a04b55', T:P.top, P:P.pants, B:P.shoe, C:P.cap||'#f08c3f', G:'#1a2030' };
    for (let y=0;y<20;y++){
      const row = PAD(ROWS[y]);
      for (let x=0;x<16;x++){
        const ch = row[x]; if (ch === '.') continue;
        g.fillStyle = COLOR[ch] || P.skin;
        g.fillRect(x, y, 1, 1);
      }
    }
    // --- 액세서리 오버레이 ---
    if (def.tie){
      g.fillStyle = def.tie;
      g.fillRect(7,8,2,1); g.fillRect(7,9,2,5); g.fillRect(7,14,2,1);
    }
    if (def.badge){ // Team Lead 금 배지
      g.fillStyle = '#ffd166'; g.fillRect(4,9,2,2);
    }
    if (def.headset){
      g.fillStyle = '#10131c';
      g.fillRect(1,3,2,4); g.fillRect(13,3,2,4);     // 이어패드
      g.fillRect(1,1,14,1);                            // 밴드
      g.fillStyle = '#38e1ff'; g.fillRect(2,6,1,2); g.fillRect(3,7,2,1); // 마이크 암
    }
    if (def.hood){ // 후드 뒷 실루엣
      g.fillStyle = P.top; g.fillRect(2,1,2,3); g.fillRect(12,1,2,3);
    }
    return cv;
  }

  function build(def){
    return {
      idle:  renderFrame(def, {legs:'A', mouth:'closed'}),
      walkA: renderFrame(def, {legs:'A', mouth:'closed'}),
      walkB: renderFrame(def, {legs:'B', mouth:'closed'}),
      sit:   renderFrame(def, {legs:'SIT', mouth:'closed'}),
      speak: renderFrame(def, {legs: def.seated ? 'SIT':'A', mouth:'open'}),
      speakSit: renderFrame(def, {legs:'SIT', mouth:'open'}),
    };
  }
  return { build };

})();
