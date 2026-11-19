export type ShareCardData = {
  /** 카드 바탕색(1위 향수 계열 색, 이미 해석된 색 값) */
  background: string;
  persona: string;
  foodNames: string[];
  top: { name: string; house: string; pct: number; hit: string[] } | null;
  others: number;
};

const W = 840;
const H = 1120;
const INK = "#2d241c";

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** 공유 카드를 PNG로 그린다. 화면의 카드와 같은 내용·색이다. */
export async function drawShareCard(d: ShareCardData): Promise<Blob> {
  const display = '"Noto Serif KR", serif';
  const latin = '"Cormorant Garamond", serif';
  const sans = '"Noto Sans KR Variable", sans-serif';
  // 한글 글꼴은 조각으로 나뉘어 있으므로 그릴 글자로 미리 불러온다.
  const text = [d.persona, ...d.foodNames, d.top?.name, d.top?.house, ...(d.top?.hit ?? []), "나의 입맛 향수 유형 가장 잘 맞는 향수 함께 맞은 향수 향 아카이브"].join(" ");
  await Promise.all([`62px ${display}`, `italic 60px ${latin}`, `26px ${sans}`].map((f) => document.fonts.load(f, text)));
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = d.background;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#ebc6cc";
  ctx.beginPath();
  ctx.arc(W - 40, 40, 190, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c4d1b0";
  ctx.beginPath();
  ctx.arc(30, H - 30, 130, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = INK;
  ctx.textBaseline = "alphabetic";
  ctx.font = `26px ${sans}`;
  ctx.globalAlpha = 0.75;
  ctx.fillText("나의 입맛 향수 유형", 70, 120);
  ctx.globalAlpha = 1;
  ctx.font = `62px ${display}`;
  ctx.fillText(d.persona, 70, 200);

  ctx.font = `30px ${sans}`;
  wrap(ctx, d.foodNames.join(" + "), W - 140).forEach((l, i) => ctx.fillText(l, 70, 290 + i * 44));

  if (d.top) {
    const y = 420;
    ctx.fillStyle = "rgba(255,252,247,0.72)";
    ctx.beginPath();
    ctx.roundRect(60, y, W - 120, 440, 36);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.font = `26px ${sans}`;
    ctx.globalAlpha = 0.75;
    ctx.fillText("가장 잘 맞는 향수", 100, y + 70);
    ctx.globalAlpha = 1;
    ctx.textAlign = "right";
    ctx.font = `bold 34px ${sans}`;
    ctx.fillText(`${d.top.pct}%`, W - 100, y + 70);
    ctx.textAlign = "left";
    ctx.font = `italic 60px ${latin}`;
    wrap(ctx, d.top.name, W - 200).forEach((l, i) => ctx.fillText(l, 100, y + 150 + i * 64));
    ctx.font = `28px ${sans}`;
    ctx.fillText(d.top.house, 100, y + 270);
    let x = 100;
    let row = 0;
    ctx.font = `24px ${sans}`;
    for (const n of d.top.hit) {
      const w = ctx.measureText(n).width + 40;
      if (x + w > W - 100) {
        x = 100;
        row += 1;
      }
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath();
      ctx.roundRect(x, y + 310 + row * 56, w, 44, 22);
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.fillText(n, x + 20, y + 341 + row * 56);
      x += w + 10;
    }
  }

  ctx.fillStyle = INK;
  ctx.globalAlpha = 0.7;
  ctx.font = `24px ${sans}`;
  ctx.fillText(`함께 맞은 향수 ${d.others}개 · 향 아카이브`, 70, H - 70);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("이미지를 만들지 못했어요"))), "image/png"),
  );
}
