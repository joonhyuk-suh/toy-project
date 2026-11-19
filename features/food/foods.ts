export type FoodCategory = "커피·차" | "음료" | "디저트" | "과일" | "술";

export type Ingredient = {
  name: string;
  /** 향수 노트(Scento 표기). 향수에 거의 쓰이지 않는 재료는 null */
  note: string | null;
};

export type Food = {
  id: string;
  category: FoodCategory;
  /** lucide 아이콘 이름 */
  icon: string;
  name: string;
  ingredients: Ingredient[];
  /** 검색에만 쓰는 다른 이름 */
  alias: string;
};

const F = (
  id: string,
  category: FoodCategory,
  icon: string,
  name: string,
  ing: [string, string | null][],
  alias = "",
): Food => ({ id, category, icon, name, ingredients: ing.map(([n, note]) => ({ name: n, note })), alias });

export const FOODS: Food[] = [
  F("latte", "커피·차", "coffee", "바닐라라떼", [["에스프레소", "Coffee"], ["우유", "Milk"], ["바닐라 시럽", "Vanilla"]], "라떼 커피"),
  F("americano", "커피·차", "coffee", "아메리카노", [["에스프레소", "Coffee"]], "커피"),
  F("mocha", "커피·차", "coffee", "카페모카", [["에스프레소", "Coffee"], ["초콜릿", "Chocolate"], ["우유", "Milk"]], "라떼 커피 초코"),
  F("coconutcoffee", "커피·차", "coffee", "코코넛 커피", [["에스프레소", "Coffee"], ["코코넛 밀크", "Coconut"]], "커피 스무디"),
  F("earlgrey", "커피·차", "leaf", "얼그레이", [["홍차", "Tea"], ["베르가못", "Bergamot"]], "홍차 티"),
  F("matcha", "커피·차", "leaf", "말차라떼", [["말차", "Tea"], ["우유", "Milk"]], "녹차 라떼"),
  F("milktea", "커피·차", "milk", "밀크티", [["홍차", "Tea"], ["우유", "Milk"], ["설탕 시럽", null]], "버블티 홍차"),
  F("chai", "커피·차", "flame", "짜이 티", [["홍차", "Tea"], ["카다멈", "Cardamom"], ["시나몬", "Cinnamon"], ["우유", "Milk"]], "차이 라떼"),
  F("gingertea", "커피·차", "flame", "꿀 생강차", [["생강", "Ginger"], ["꿀", "Honey"]], "차"),
  F("lemonade", "음료", "citrus", "레몬에이드", [["레몬", "Lemon"], ["탄산수", null]], "에이드"),
  F("grapefruitade", "음료", "citrus", "자몽에이드", [["자몽", "Grapefruit"], ["탄산수", null]], "에이드"),
  F("orangejuice", "음료", "citrus", "오렌지 주스", [["오렌지", "Orange"]], "주스"),
  F("choco", "디저트", "cake-slice", "초코 케이크", [["초콜릿", "Chocolate"], ["바닐라", "Vanilla"], ["밀가루", null]], "케이크"),
  F("figtart", "디저트", "cake", "무화과 타르트", [["무화과", "Fig"], ["아몬드 크림", "Almond"], ["버터", null]], "타르트 파이"),
  F("tiramisu", "디저트", "cake", "티라미수", [["에스프레소", "Coffee"], ["코코아", "Chocolate"], ["마스카포네", "Milk"]], "케이크 커피"),
  F("pistachio", "디저트", "lollipop", "피스타치오 젤라또", [["피스타치오", "Pistachio"], ["우유", "Milk"]], "아이스크림"),
  F("vanillaice", "디저트", "lollipop", "바닐라 아이스크림", [["바닐라빈", "Vanilla"], ["우유", "Milk"]], "아이스크림"),
  F("popcorn", "디저트", "popcorn", "캐러멜 팝콘", [["캐러멜", "Caramel"], ["옥수수", null]], "간식"),
  F("cinnamonroll", "디저트", "croissant", "시나몬롤", [["시나몬", "Cinnamon"], ["캐러멜", "Caramel"], ["빵", null]], "빵 베이커리"),
  F("honeytoast", "디저트", "sandwich", "허니 토스트", [["꿀", "Honey"], ["식빵", null], ["버터", null]], "빵"),
  F("rosemacaron", "디저트", "cookie", "장미 마카롱", [["아몬드 가루", "Almond"], ["장미 시럽", "Rose"]], "쿠키 마카롱"),
  F("coconutcookie", "디저트", "cookie", "코코넛 쿠키", [["코코넛", "Coconut"], ["바닐라", "Vanilla"]], "쿠키"),
  F("fig", "과일", "grape", "생무화과", [["무화과", "Fig"]], "과일"),
  F("peach", "과일", "apple", "복숭아", [["복숭아", "Peach"]], "과일"),
  F("pear", "과일", "apple", "배", [["배", "Pear"]], "과일"),
  F("cherry", "과일", "cherry", "체리", [["체리", "Cherry"]], "과일"),
  F("mandarin", "과일", "citrus", "귤", [["귤 껍질", "Orange"]], "과일 감귤"),
  F("highball", "술", "glass-water", "하이볼", [["위스키", "Whisky"], ["레몬", "Lemon"], ["탄산수", null]], "칵테일"),
  F("whisky", "술", "martini", "위스키 온더록", [["위스키", "Whisky"]], "술"),
  F("vinchaud", "술", "wine", "뱅쇼", [["오렌지", "Orange"], ["시나몬", "Cinnamon"], ["넛멕", "Nutmeg"], ["레드와인", null]], "와인"),
];

export const CATEGORIES = ["전체", "커피·차", "음료", "디저트", "과일", "술"] as const;
export type CategoryFilter = (typeof CATEGORIES)[number];

/** 홈의 "이번 주 많이 찾은 조합". 실제 집계가 아니라 정해 둔 조합이다. */
export const PRESETS: { name: string; foods: string[] }[] = [
  { name: "포근한 디저트파", foods: ["latte", "choco", "earlgrey"] },
  { name: "상큼한 하이볼파", foods: ["lemonade", "highball"] },
  { name: "과즙 가득 과일파", foods: ["fig", "peach"] },
  { name: "향신료 티타임파", foods: ["chai", "cinnamonroll"] },
];
