# Design

Where design work starts. Decision contracts in `docs/decisions/` own every
rule; this file holds values and points at the contract that owns each element.

## Values

Source: `app/globals.css`. Update this section when that source changes.

| Token | Light | Dark |
| --- | --- | --- |
| `background` | `#f6f1e9` | `#1d1916` |
| `foreground` | `#2b2520` | `#f1e9dd` |
| `card` | `#fffcf7` | `#26211d` |
| `primary` | `#3d3229` | `#efe3d1` |
| `primary-foreground` | `#fbf7f0` | `#241e19` |
| `secondary` | `#efe7db` | `#322b25` |
| `muted` | `#ece4d7` | `#2e2722` |
| `muted-foreground` | `#7d7064` | `#a99a8a` |
| `accent` | `#e6dccd` | `#3a322b` |
| `destructive` | `#b5533c` | `#d9806a` |
| `border` | `#e3d8c8` | `#3a322b` |
| `ring` | `#b8a58f` | `#6d5e50` |

Scent family colors (`--fam-*`, same in both themes; `--fam-ink` `#3b2f25` is the text color on top of them):
`citrus` `#ead9a0`, `fruit` `#ecc2b0`, `green` `#c4d1b0`, `floral` `#ebc6cc`, `white` `#efe6d2`, `powder` `#d6cde3`,
`musk` `#ecd8c8`, `sweet` `#dcc0a3`, `amber` `#e3c48a`, `spice` `#e1b68e`, `smoke` `#b9aea5`, `wood` `#cdb39a`.

Text roles: `font-sans` (body, UI) is Noto Sans KR Variable (Pretendard stand-in); `font-heading` (h1–h3) is Noto Serif KR
(Arita Buri stand-in); `font-latin` (italic Latin proper names such as perfume names) is Cormorant Garamond italic.
All three are OFL fonts self-hosted through `@fontsource` packages, imported in `app/layout.tsx`. Pretendard and Arita Buri
themselves are not bundled; swap them in `app/globals.css` (`--font-sans`, `--font-heading`) when their files are added.
Radius and spacing: `--radius` is `0.75rem`; Tailwind default spacing scale. Buttons are pill-shaped (`rounded-full`,
default height `h-10`, `lg` `h-11`). Icons: lucide, thin line (`strokeWidth` about 1.2–1.3).

## Components

Source: `components/ui`. Update this section when it changes.

- `Alert`, `Badge`, `Button`, `Card`, `Checkbox`, `Empty`, `Input`, `Separator`, `Toast` (`Toaster`, `toast`), `Toggle`, `ToggleGroup`
- Project components (not shadcn): `AppShell` in `components/app-shell.tsx`; scent-family atoms (`FamilyOrb`, `FamilyBadge`, `MiniBottle`, `ScoreRing`, `PerfumeCard`, `PerfumeRow`) in `features/perfume/components.tsx`; `ScentWheel` in `features/expert-finder`; `ShareCard` in `features/share`.

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
