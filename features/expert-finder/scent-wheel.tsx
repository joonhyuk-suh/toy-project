import { FAMILIES } from "@/features/perfume";
import type { FamilyId } from "@/features/perfume";

const CX = 160;
const R_IN = 82;
const R_OUT = 156;

const round = (n: number) => Math.round(n * 100) / 100;

function sector(a0: number, a1: number) {
  // 서버와 브라우저의 부동소수점 끝자리가 달라 하이드레이션이 어긋나지 않도록 반올림한다.
  const p = (r: number, a: number) => [round(CX + r * Math.cos(a)), round(CX + r * Math.sin(a))];
  const [x0, y0] = p(R_OUT, a0);
  const [x1, y1] = p(R_OUT, a1);
  const [x2, y2] = p(R_IN, a1);
  const [x3, y3] = p(R_IN, a0);
  return `M${x0} ${y0} A${R_OUT} ${R_OUT} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${R_IN} ${R_IN} 0 0 0 ${x3} ${y3}Z`;
}

/** 향 계열 휠: 12개 계열이 원형으로 놓이고, 눌러서 계열을 고른다. 계열마다 고른 재료 수를 보여 준다. */
export function ScentWheel({
  selected,
  counts,
  noteCount,
  onSelect,
}: {
  selected: FamilyId;
  counts: Partial<Record<FamilyId, number>>;
  noteCount: number;
  onSelect: (family: FamilyId) => void;
}) {
  const step = (2 * Math.PI) / FAMILIES.length;
  const start = -Math.PI / 2 - step / 2;
  const current = FAMILIES.find((f) => f.id === selected)!;
  return (
    <svg viewBox="0 0 320 320" className="mx-auto block w-full max-w-80" role="group" aria-label="향 계열 휠">
      {FAMILIES.map((f, i) => {
        const a0 = start + i * step;
        const a1 = a0 + step;
        const mid = (a0 + a1) / 2;
        const on = f.id === selected;
        const count = counts[f.id] ?? 0;
        return (
          <g key={f.id}>
            <path
              d={sector(a0 + 0.004, a1 - 0.004)}
              fill={f.color}
              role="button"
              tabIndex={0}
              aria-pressed={on}
              aria-label={`${f.ko}${count ? `, 고른 재료 ${count}개` : ""}`}
              onClick={() => onSelect(f.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(f.id);
                }
              }}
              className="cursor-pointer outline-none transition-[opacity,transform] duration-200 hover:opacity-85 focus-visible:opacity-85"
              style={{
                transformOrigin: `${CX}px ${CX}px`,
                transform: on ? "scale(1.045)" : undefined,
                stroke: on ? "var(--fam-ink)" : "var(--card)",
                strokeWidth: on ? 1.5 : 2,
              }}
            />
            <text
              x={round(CX + 118 * Math.cos(mid))}
              y={round(CX + 118 * Math.sin(mid))}
              textAnchor="middle"
              dominantBaseline="central"
              className="pointer-events-none"
              style={{ fontSize: 11, fill: "var(--fam-ink)" }}
            >
              {f.ko}
              {count ? ` ·${count}` : ""}
            </text>
          </g>
        );
      })}
      <circle cx={CX} cy={CX} r={76} fill="var(--card)" />
      <text x={CX} y={152} textAnchor="middle" className="font-heading" style={{ fontSize: 16, fill: "var(--foreground)" }}>
        {current.ko}
      </text>
      <text x={CX} y={176} textAnchor="middle" style={{ fontSize: 11, fill: "var(--muted-foreground)" }}>
        재료 {noteCount}개
      </text>
    </svg>
  );
}
