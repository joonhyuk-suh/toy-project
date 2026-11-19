# Design

Where design work starts. Decision contracts in `docs/decisions/` own every
rule; this file holds values and points at the contract that owns each element.

## Values

Source: `app/globals.css`. Update this section when that source changes.

| Token | Light | Dark |
| --- | --- | --- |
| `background` | `oklch(1 0 0)` | `oklch(0.145 0.008 326)` |
| `foreground` | `oklch(0.145 0.008 326)` | `oklch(0.985 0 0)` |
| `card` | `oklch(1 0 0)` | `oklch(0.212 0.019 322.12)` |
| `primary` | `oklch(0.488 0.243 264.376)` | `oklch(0.424 0.199 265.638)` |
| `primary-foreground` | `oklch(0.97 0.014 254.604)` | `oklch(0.97 0.014 254.604)` |
| `secondary` | `oklch(0.967 0.001 286.375)` | `oklch(0.274 0.006 286.033)` |
| `muted` | `oklch(0.96 0.003 325.6)` | `oklch(0.263 0.024 320.12)` |
| `muted-foreground` | `oklch(0.542 0.034 322.5)` | `oklch(0.711 0.019 323.02)` |
| `accent` | `oklch(0.96 0.003 325.6)` | `oklch(0.263 0.024 320.12)` |
| `destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` |
| `border` | `oklch(0.922 0.005 325.62)` | `oklch(1 0 0 / 10%)` |
| `ring` | `oklch(0.711 0.019 323.02)` | `oklch(0.542 0.034 322.5)` |

Text roles: `html` uses `font-mono` (JetBrains Mono); `--font-sans` is Inter.
Radius and spacing: `--radius` is `0.625rem`; Tailwind default spacing scale.

## Components

Source: `components/ui`. Update this section when it changes.

- `Button`

## Rejected patterns

- 공식 shadcn component가 있는 일반 UI를 직접 markup으로 다시 만들기 → [ui-composition](docs/decisions/ui-composition.md)
- 화면마다 임의 색상과 spacing 덮어쓰기 → [ui-composition](docs/decisions/ui-composition.md)
- 화면 전체에 고정폭 글꼴 적용 → [visual-identity](docs/decisions/visual-identity.md)
- 이모지를 아이콘이나 이미지 대신 쓰기 → [visual-identity](docs/decisions/visual-identity.md)
- 휴대폰 화면만 최적화한 레이아웃 → [visual-identity](docs/decisions/visual-identity.md)

## Map

- 일반 control과 overlay (Button, Field, Card, Dialog, Tabs, Alert 등) → [ui-composition](docs/decisions/ui-composition.md)
- 페이지 공통 shell과 content width → [ui-composition](docs/decisions/ui-composition.md)
- loading, empty, error, success, disabled 상태 → [ui-composition](docs/decisions/ui-composition.md)
- 좁은 화면에서 column 쌓기 → [ui-composition](docs/decisions/ui-composition.md)
- 글꼴 역할 (제목, 본문, 영문 고유명) → [visual-identity](docs/decisions/visual-identity.md)
- 바탕, 카드, 강조색 값 → [visual-identity](docs/decisions/visual-identity.md)
- 향 계열 색 → [visual-identity](docs/decisions/visual-identity.md)
- 아이콘 → [visual-identity](docs/decisions/visual-identity.md)
- 반응형 구간과 상단 메뉴, 하단 탭 메뉴 → [visual-identity](docs/decisions/visual-identity.md)
