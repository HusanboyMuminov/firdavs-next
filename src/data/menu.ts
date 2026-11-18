import type { Localized } from "@/i18n/config";
import { photos, type Photo } from "./photos";

/**
 * The menu — edit freely. Every text field is required in all four languages
 * (uz / ko / ru / en); TypeScript reports any missing translation.
 *
 * Prices: set `price` in Korean won (VAT included), e.g. `price: 15000`.
 *   While a dish has `price: null`, no price is shown for it.
 * Photos: see `photos.ts`. Order of dishes here = order on the menu.
 */

export type CategoryId =
  | "soups"
  | "mains"
  | "plov"
  | "salads"
  | "bread"
  | "desserts"
  | "drinks";

/**
 * featured                     → shown in the Home carousel
 * spicy / vegetarian / sharing → icon on the card + label in the dish sheet
 */
export type Tag = "featured" | "spicy" | "vegetarian" | "sharing";

export type Dish = {
  /** Stable id — used in links (?dish=…) and saved favorites. Don't rename casually. */
  id: string;
  category: CategoryId;
  name: Localized;
  ingredients: Localized;
  description: Localized;
  /** Korean won, VAT included. `null` = not shown yet. */
  price: number | null;
  /** Optional serving size, e.g. { uz: "450 g", ko: "450g", ru: "450 г", en: "450 g" }. */
  portion?: Localized;
  photo?: Photo;
  tags?: Tag[];
  /**
   * Also list this same dish in other categories (it stays one item for the
   * cart, favorites and search), e.g. a glass of qatiq under Drinks and Salads.
   * `before`: the dish id to show it in front of there (default: at the end).
   */
  alsoIn?: { category: CategoryId; before?: string }[];
  /** Extra search terms: alternative spellings, transliterations, etc. */
  keywords?: string[];
};

/** Order here = order of the tabs and sections. `cover` is the Home tile photo. */
export const categories: { id: CategoryId; label: Localized; cover?: Photo }[] = [
  { id: "soups", label: { uz: "Shoʻrvalar", ko: "수프", ru: "Супы", en: "Soups" }, cover: photos.shorva },
  { id: "mains", label: { uz: "Asosiy taomlar", ko: "메인 요리", ru: "Основные блюда", en: "Main dishes" }, cover: photos.manti },
  { id: "plov", label: { uz: "Palov", ko: "플롭", ru: "Плов", en: "Plov" }, cover: photos.toyOshi },
  { id: "salads", label: { uz: "Salatlar", ko: "샐러드", ru: "Салаты", en: "Salads" }, cover: photos.achchiqChuchuk },
  { id: "bread", label: { uz: "Non va pishiriqlar", ko: "빵 · 페이스트리", ru: "Хлеб и выпечка", en: "Bread" }, cover: photos.tandirNon },
  { id: "desserts", label: { uz: "Shirinliklar", ko: "디저트", ru: "Десерты", en: "Desserts" }, cover: photos.napoleon },
  { id: "drinks", label: { uz: "Ichimliklar", ko: "음료", ru: "Напитки", en: "Drinks" }, cover: photos.anorFresh },
];

const PLOV_WORDS = ["plov", "pilaf", "pilau", "palov", "osh", "필라프"];
const KEBAB_WORDS = ["kebab", "kabob", "shashlik", "shashlyk", "꼬치"];
const SAMSA_WORDS = ["samsa", "somsa", "samosa", "삼사"];

export const dishes: Dish[] = [
  // ─── Soups ───────────────────────────────────────────────────────────
  {
    id: "shorva",
    category: "soups",
    name: { uz: "Shoʻrva", ko: "쇼르바", ru: "Шурпа", en: "Shurpa" },
    ingredients: {
      uz: "Mol goʻshti, kartoshka, sabzi, noʻxat, koʻkat",
      ko: "소고기, 감자, 당근, 병아리콩, 허브",
      ru: "Говядина, картофель, морковь, нут, зелень",
      en: "Beef, potato, carrot, chickpeas, fresh herbs",
    },
    description: {
      uz: "Yirik mol goʻshti boʻlaklari va sabzavotlar solingan tiniq shoʻrva — oʻzbek dasturxonining mumtoz taomi.",
      ko: "큼직한 소고기와 채소가 들어간 맑은 국물 — 우즈베키스탄 가정식을 대표하는 수프입니다.",
      ru: "Прозрачный бульон с крупными кусками говядины и овощами — классика узбекской домашней кухни.",
      en: "A clear broth with generous pieces of beef and vegetables — a classic of Uzbek home cooking.",
    },
    price: null,
    photo: photos.shorva,
    keywords: ["shurpa", "shorpa", "shurva", "chorba", "beef soup", "소고기"],
  },
  {
    id: "mastava",
    category: "soups",
    name: { uz: "Mastava", ko: "마스타바", ru: "Мастава", en: "Mastava" },
    ingredients: {
      uz: "Mol goʻshti, guruch, pomidor, kartoshka, sabzi, qatiq",
      ko: "소고기, 쌀, 토마토, 감자, 당근, 요거트",
      ru: "Говядина, рис, помидоры, картофель, морковь, катык",
      en: "Beef, rice, tomato, potato, carrot, qatiq yogurt",
    },
    description: {
      uz: "Pomidorli quyuq shoʻrva — guruch va sabzavotlar bilan, ustidan qatiq va koʻkat solib tortiladi.",
      ko: "토마토 국물에 쌀과 채소를 넣어 끓인 든든한 수프로, 요거트와 허브를 올려 냅니다.",
      ru: "Сытный суп с рисом и овощами в томатном бульоне, подаётся с катыком и зеленью.",
      en: "A hearty rice and vegetable soup in a tomato broth, finished with a spoon of qatiq and fresh herbs.",
    },
    price: null,
    photo: photos.mastava,
    keywords: ["rice soup", "mastava"],
  },
  {
    id: "milliy-lagmon",
    category: "soups",
    name: { uz: "Milliy lagʻmon", ko: "우즈베크식 라그만", ru: "Миллий лагман", en: "Milliy Lagman" },
    ingredients: {
      uz: "Choʻzma lagʻmon, mol goʻshti, bolgar qalampiri, kartoshka, pomidor",
      ko: "손으로 늘린 면, 소고기, 피망, 감자, 토마토",
      ru: "Тянутая лапша, говядина, сладкий перец, картофель, помидоры",
      en: "Hand-pulled noodles, beef, bell pepper, potato, tomato",
    },
    description: {
      uz: "Milliy usulda: choʻzma lagʻmon goʻshtli va sabzavotli quyuq shoʻrvada tortiladi.",
      ko: "우즈베크 전통 방식의 라그만 — 손으로 늘린 면을 진한 소고기 채소 국물에 담았습니다.",
      ru: "Лагман по-национальному: тянутая лапша в насыщенном мясном бульоне с овощами.",
      en: "Uzbek national-style lagman: hand-pulled noodles in a rich beef and vegetable broth.",
    },
    price: null,
    photo: photos.milliyLagmon,
    keywords: ["milliy", "national", "lagman", "laghman", "lagmon", "suyuq", "noodle soup", "국수"],
  },
  {
    id: "uygur-lagmon",
    category: "soups",
    name: { uz: "Uygʻur lagʻmon", ko: "위구르 라그만", ru: "Уйгурский лагман", en: "Uyghur Lagman" },
    ingredients: {
      uz: "Choʻzma lagʻmon, mol goʻshti, bolgar qalampiri, pomidor, sarimsoq",
      ko: "손으로 늘린 면, 소고기, 피망, 토마토, 마늘",
      ru: "Тянутая лапша, говядина, сладкий перец, помидоры, чеснок",
      en: "Hand-pulled noodles, beef, bell pepper, tomato, garlic",
    },
    description: {
      uz: "Uygʻurcha lagʻmon: choʻzma lagʻmon ustiga goʻshtli va sabzavotli vaju solinib, tagida ozgina shoʻrva bilan likopchada tortiladi.",
      ko: "위구르식 라그만 — 손으로 늘린 면에 소고기 채소 볶음을 얹고, 접시 바닥에 국물을 자작하게 곁들여 냅니다.",
      ru: "Лагман по-уйгурски: тянутая лапша с говядиной и овощами, подаётся на тарелке с небольшим количеством бульона.",
      en: "Uyghur-style lagman: hand-pulled noodles topped with beef and vegetables, served on a plate over a little broth.",
    },
    price: null,
    photo: photos.uygurLagmon,
    tags: ["featured"],
    keywords: ["uyghur", "uighur", "uygur", "lagman", "laghman", "lagmon", "noodles", "국수", "면"],
  },
  {
    id: "dolma",
    category: "soups",
    name: { uz: "Doʻlma", ko: "돌마", ru: "Долма", en: "Dolma" },
    ingredients: {
      uz: "Bolgar qalampiri, goʻsht qiymasi, guruch, piyoz, pomidorli sho‘rva",
      ko: "피망, 다진 고기, 쌀, 양파, 토마토 국물",
      ru: "Сладкий перец, мясной фарш, рис, лук, томатный бульон",
      en: "Bell peppers, minced meat, rice, onion, tomato broth",
    },
    description: {
      uz: "Goʻsht qiymasi va guruch bilan toʻldirilgan qalampir, yengil pomidorli sho‘rvada dimlanadi.",
      ko: "다진 고기와 쌀로 속을 채운 피망을 가벼운 토마토 국물에 익혔습니다.",
      ru: "Перцы, фаршированные мясом и рисом, томлённые в лёгком томатном бульоне.",
      en: "Peppers stuffed with minced meat and rice, simmered in a light tomato broth.",
    },
    price: null,
    photo: photos.dolma,
    keywords: ["dolma", "dulma", "stuffed peppers", "피망"],
  },
  {
    id: "chuchvara",
    category: "soups",
    name: { uz: "Chuchvara", ko: "추츠바라", ru: "Чучвара", en: "Chuchvara Dumpling Soup" },
    ingredients: {
      uz: "Goʻshtli mayda chuchvara, sho‘rva, piyoz, koʻkat",
      ko: "작은 고기만두, 육수, 양파, 허브",
      ru: "Маленькие пельмени с мясом, бульон, лук, зелень",
      en: "Small meat dumplings, broth, onion, herbs",
    },
    description: {
      uz: "Ziravorli goʻsht qiymasi solingan mayda chuchvaralar, tiniq sho‘rvada tortiladi.",
      ko: "양념한 다진 고기를 넣은 작은 만두를 맑은 육수에 담았습니다.",
      ru: "Маленькие пельмени с пряным мясным фаршем в прозрачном бульоне.",
      en: "Small dumplings filled with seasoned minced meat, served in a clear broth.",
    },
    price: null,
    photo: photos.chuchvara,
    keywords: ["chuchvara", "tushbera", "dushbara", "pelmeni", "dumpling soup", "만두"],
  },
  {
    id: "qoy-oyoq-shorva",
    category: "soups",
    name: {
      uz: "Qoʻy oyogʻidan tayyorlangan shoʻrva",
      ko: "양족탕",
      ru: "Шурпа из бараньих ножек",
      en: "Lamb Trotter Soup",
    },
    ingredients: {
      uz: "Qoʻy oyoqlari, sabzavotlar, ziravorlar, koʻkat",
      ko: "양 족, 채소, 향신료, 허브",
      ru: "Бараньи ножки, овощи, специи, зелень",
      en: "Lamb trotters, vegetables, spices, fresh herbs",
    },
    description: {
      uz: "Qoʻy oyoqlarini uzoq qaynatib tayyorlanadigan quyuq va toʻyimli shoʻrva.",
      ko: "양 족을 오래 고아 만든 진하고 든든한 수프입니다.",
      ru: "Наваристая, сытная шурпа из долго томлённых бараньих ножек.",
      en: "A rich, hearty soup of lamb trotters, simmered for hours.",
    },
    price: null,
    photo: photos.qoyOyoqShorva,
    keywords: ["shurpa", "shorva", "shurva", "qoy oyogi", "oyoq", "pocha", "trotter", "lamb feet", "ilik", "양족"],
  },

  // ─── Main dishes ─────────────────────────────────────────────────────
  {
    id: "qovurma-lagmon",
    category: "mains",
    name: { uz: "Qovurma lagʻmon", ko: "볶음 라그만", ru: "Ковурма лагман", en: "Fried Noodles" },
    ingredients: {
      uz: "Lagʻmon, mol goʻshti, bolgar qalampiri, piyoz",
      ko: "라그만 면, 소고기, 피망, 양파",
      ru: "Лапша для лагмана, говядина, сладкий перец, лук",
      en: "Lagman noodles, beef, bell pepper, onion",
    },
    description: {
      uz: "Lagʻmon goʻsht, qalampir va piyoz bilan qovuriladi.",
      ko: "라그만 면을 소고기, 피망, 양파와 함께 볶은 요리입니다.",
      ru: "Лапша для лагмана, обжаренная с говядиной, перцем и луком.",
      en: "Lagman noodles stir-fried with beef, peppers and onion.",
    },
    price: null,
    photo: photos.qovurmaLagmon,
    keywords: ["lagman", "fried noodles", "qovurma", "kovurma", "볶음면"],
  },
  {
    id: "manti",
    category: "mains",
    name: { uz: "Manti", ko: "만티", ru: "Манты", en: "Manti Dumplings" },
    ingredients: {
      uz: "Qoʻy va mol goʻshti, piyoz, zira, yupqa xamir",
      ko: "양고기·소고기, 양파, 커민, 얇은 피",
      ru: "Баранина и говядина, лук, зира, тонкое тесто",
      en: "Lamb & beef, onion, cumin, thin dough",
    },
    description: {
      uz: "Sersuv goʻsht va piyozli, bugʻda pishirilgan yirik manti — bir laganda 6 boʻlak.",
      ko: "육즙 가득한 고기와 양파 소를 넣어 쪄 낸 큼직한 만두로, 한 접시에 6조각 담아 냅니다.",
      ru: "Крупные манты на пару с сочной мясной начинкой и луком — 6 штук на блюде.",
      en: "Large steamed dumplings filled with juicy meat and onion — 6 pieces on one plate.",
    },
    price: null,
    portion: { uz: "6 boʻlak", ko: "6조각", ru: "6 штук", en: "6 pieces" },
    photo: photos.manti,
    tags: ["featured"],
    keywords: ["manty", "mantu", "dumplings", "만두", "찐만두"],
  },
  {
    id: "xonim",
    category: "mains",
    name: { uz: "Xonim", ko: "호님 (말이 찐만두)", ru: "Ханум", en: "Khanum Steamed Roll" },
    ingredients: {
      uz: "Yupqa xamir, mol goʻshti, piyoz, ziravorlar",
      ko: "얇은 반죽, 소고기, 양파, 향신료",
      ru: "Тонкое тесто, говядина, лук, специи",
      en: "Thin dough, beef, onion, spices",
    },
    description: {
      uz: "Yupqa xamirga mol goʻshti va piyoz oʻralib, bugʻda pishiriladi — bir likopchada 5 boʻlak.",
      ko: "얇은 반죽에 소고기와 양파 소를 말아 쪄 낸 요리로, 한 접시에 5조각 담아 냅니다.",
      ru: "Тонкое тесто, свёрнутое рулетом с говядиной и луком и приготовленное на пару, — 5 кусочков на тарелке.",
      en: "Thin dough rolled around seasoned beef and onion, then steamed — 5 pieces on one plate.",
    },
    price: null,
    portion: { uz: "5 boʻlak", ko: "5조각", ru: "5 кусочков", en: "5 pieces" },
    // No openly licensed photo of xonim exists yet: add your own (see photos.ts).
    keywords: ["xonim", "khanum", "hanum", "khonim", "honim", "roll", "steamed", "말이"],
  },
  {
    id: "qozon-kabob",
    category: "mains",
    name: { uz: "Qozon kabob", ko: "카잔 케밥", ru: "Казан-кебаб", en: "Kazan Kebab" },
    ingredients: {
      uz: "Qoʻy qovurgʻasi, fri kartoshka, piyoz, zira",
      ko: "양갈비, 감자튀김, 양파, 커민",
      ru: "Бараньи рёбрышки, картофель фри, лук, зира",
      en: "Lamb ribs, fries, onion, cumin",
    },
    description: {
      uz: "Qozonda tilla rang tusga kirguncha qovurilgan qoʻy qovurgʻasi — fri kartoshka bilan tortiladi.",
      ko: "카잔(무쇠솥)에서 노릇하게 익힌 양갈비를 감자튀김과 함께 냅니다.",
      ru: "Бараньи рёбрышки, обжаренные в казане до золотистой корочки, подаются с картофелем фри.",
      en: "Lamb ribs fried in a kazan until golden, served with a side of fries.",
    },
    price: null,
    photo: photos.qozonKabob,
    tags: ["featured"],
    keywords: ["kazan kabob", "kazan kebab", "qozon", "lamb ribs", "fries", "양갈비"],
  },
  {
    id: "achchiq-gosht",
    category: "mains",
    name: { uz: "Achchiq goʻsht", ko: "매운 고기볶음", ru: "Аччик гушт", en: "Spicy Fried Meat" },
    ingredients: {
      uz: "Mol goʻshti, bolgar qalampiri, piyoz, pomidor, achchiq qalampir",
      ko: "소고기, 피망, 양파, 토마토, 고추",
      ru: "Говядина, сладкий перец, лук, помидоры, острый перец",
      en: "Beef, bell pepper, onion, tomato, chili",
    },
    description: {
      uz: "Goʻsht va sabzavotlar achchiq qalampir bilan qovuriladi — toʻyimli va xushboʻy.",
      ko: "소고기와 채소를 고추와 함께 매콤하게 볶아 낸 요리입니다.",
      ru: "Говядина с овощами, обжаренная с острым перцем, — сытно и ароматно.",
      en: "Beef and vegetables stir-fried with hot chili — hearty and fragrant.",
    },
    price: null,
    photo: photos.achchiqGosht,
    tags: ["spicy"],
    keywords: ["achchiq gosht", "acchiq gosht", "achik gusht", "spicy meat", "매운"],
  },
  {
    id: "jiz",
    category: "mains",
    name: { uz: "Jiz", ko: "지즈 (양고기 볶음)", ru: "Жиз", en: "Jiz Fried Lamb" },
    ingredients: {
      uz: "Qoʻy goʻshti, dumba yogʻi, piyoz, ziravorlar",
      ko: "양고기, 양 꼬리 기름, 양파, 향신료",
      ru: "Баранина, курдючный жир, лук, специи",
      en: "Lamb, tail fat, onion, spices",
    },
    description: {
      uz: "Qozonda oʻz yogʻida jizillab qovurilgan sersuv qoʻy goʻshti boʻlaklari — piyoz bilan tortiladi.",
      ko: "카잔에서 기름에 지글지글 볶아 낸 육즙 가득한 양고기로, 양파와 함께 냅니다.",
      ru: "Сочные кусочки баранины, обжаренные в казане в собственном жиру, подаются с луком.",
      en: "Juicy pieces of lamb sizzled in a kazan in their own fat, served with onion.",
    },
    price: null,
    photo: photos.jiz,
    keywords: ["jiz", "jiz biz", "dzhiz", "fried lamb", "양고기"],
  },
  {
    id: "beshbarmoq",
    category: "mains",
    name: { uz: "Beshbarmoq", ko: "베시바르막", ru: "Бешбармак", en: "Beshbarmak" },
    ingredients: {
      uz: "Keng yupqa xamir, qaynatilgan goʻsht, piyoz, shoʻrva",
      ko: "넓고 얇은 면, 삶은 고기, 양파, 육수",
      ru: "Широкая тонкая лапша, отварное мясо, лук, бульон",
      en: "Wide thin noodles, boiled meat, onion, broth",
    },
    description: {
      uz: "Keng yoyilgan xamir ustiga yumshoq qaynatilgan goʻsht va piyoz solib tortiladigan anʼanaviy taom.",
      ko: "넓게 민 면 위에 부드럽게 삶은 고기와 양파를 올려 내는 전통 요리입니다.",
      ru: "Традиционное блюдо: широкая лапша с нежным отварным мясом и луком.",
      en: "A traditional dish of wide noodles topped with tender boiled meat and onion.",
    },
    price: null,
    photo: photos.beshbarmoq,
    keywords: ["beshbarmak", "beshbarmoq", "besbarmak", "besh barmak", "베시바르막"],
  },
  {
    id: "qovurdoq",
    category: "mains",
    name: { uz: "Qovurdoq", ko: "코부르도크 (말고기 볶음)", ru: "Ковурдак из конины", en: "Qovurdoq Horse Meat" },
    ingredients: {
      uz: "Ot goʻshti, piyoz, ziravorlar",
      ko: "말고기, 양파, 향신료",
      ru: "Конина, лук, специи",
      en: "Horse meat, onion, spices",
    },
    description: {
      uz: "Anʼanaviy ot goʻshtidan tayyorlangan qovurdoq — qizigan metall idishda tortiladi.",
      ko: "전통 방식으로 볶은 말고기 요리로, 뜨거운 철 그릇에 담아 냅니다.",
      ru: "Традиционный ковурдак из конины — подаётся в раскалённой металлической посуде.",
      en: "Traditional fried horse meat, served sizzling in a metal dish.",
    },
    price: null,
    photo: photos.qovurdoq,
    keywords: ["qovurdoq", "kovurdak", "kuurdak", "kuyrdak", "horse meat", "ot goshti", "konina", "말고기"],
  },
  {
    id: "qurtoba",
    category: "mains",
    name: { uz: "Qurtoba", ko: "쿠르토바", ru: "Куртоба", en: "Qurtoba" },
    ingredients: {
      uz: "Qurut sousi, non boʻlaklari, piyoz, pomidor, koʻkat",
      ko: "쿠루트(말린 요거트) 소스, 빵 조각, 양파, 토마토, 허브",
      ru: "Соус из курта, кусочки лепёшки, лук, помидоры, зелень",
      en: "Qurut (dried yogurt) sauce, flatbread pieces, onion, tomato, herbs",
    },
    description: {
      uz: "Qurut sousiga botirilgan non boʻlaklari ustiga piyoz, pomidor va koʻkat solinadigan anʼanaviy taom.",
      ko: "쿠루트 소스에 적신 빵 조각 위에 양파, 토마토, 허브를 올린 전통 요리입니다.",
      ru: "Традиционное блюдо: кусочки лепёшки в соусе из курта с луком, помидорами и зеленью.",
      en: "A traditional dish of flatbread soaked in qurut sauce, topped with onion, tomato and herbs.",
    },
    price: null,
    photo: photos.qurtoba,
    keywords: ["qurtoba", "qurutob", "kurutob", "qurut", "kurt", "쿠르토바"],
  },
  {
    id: "bifshteks-tabaka",
    category: "mains",
    name: { uz: "Bifshteks tabaka", ko: "비프스테이크 타바카", ru: "Бифштекс табака", en: "Beefsteak Tabaka" },
    ingredients: {
      uz: "Mol goʻshti, ziravorlar",
      ko: "소고기, 향신료",
      ru: "Говядина, специи",
      en: "Beef, spices",
    },
    description: {
      uz: "Tovada qovurilgan mol goʻshtidan bifshteks.",
      ko: "팬에 구운 소고기 스테이크입니다.",
      ru: "Говяжий бифштекс, обжаренный на сковороде.",
      en: "A pan-fried beef steak.",
    },
    price: null,
    photo: photos.bifshteksTabaka,
    keywords: ["bifshteks", "bifsteks", "beefsteak", "steak", "tabaka", "스테이크"],
  },
  {
    id: "qiyma-shashlik",
    category: "mains",
    name: { uz: "Qiyma shashlik", ko: "다진 고기 샤슬릭", ru: "Шашлык из фарша", en: "Minced Meat Shashlik" },
    ingredients: {
      uz: "Goʻsht qiymasi, piyoz, ziravorlar",
      ko: "다진 고기, 양파, 향신료",
      ru: "Мясной фарш, лук, специи",
      en: "Minced meat, onion, spices",
    },
    description: {
      uz: "Ziravorli goʻsht qiymasi sixga oʻralib, choʻgʻda pishiriladi.",
      ko: "양념한 다진 고기를 꼬치에 감아 구웠습니다.",
      ru: "Пряный мясной фарш на шампурах, приготовленный на огне.",
      en: "Seasoned minced meat shaped on skewers and grilled.",
    },
    price: null,
    photo: photos.qiymaShashlik,
    keywords: [...KEBAB_WORDS, "qiyma", "lula", "lyulya", "minced"],
  },
  {
    id: "kuskavoy-shashlik",
    category: "mains",
    name: { uz: "Kuskavoy shashlik", ko: "양고기 덩어리 샤슬릭", ru: "Кусковой шашлык", en: "Lamb Chunk Shashlik" },
    ingredients: {
      uz: "Marinadlangan qoʻy goʻshti boʻlaklari, piyoz, ziravorlar",
      ko: "양념한 양고기 덩어리, 양파, 향신료",
      ru: "Маринованные куски баранины, лук, специи",
      en: "Marinated lamb chunks, onion, spices",
    },
    description: {
      uz: "Marinadlangan sersuv qoʻy goʻshti boʻlaklari sixda pishiriladi.",
      ko: "양념에 재운 큼직한 양고기를 꼬치에 끼워 구웠습니다.",
      ru: "Сочные куски маринованной баранины, приготовленные на шампурах.",
      en: "Juicy pieces of marinated lamb grilled on skewers.",
    },
    price: null,
    photo: photos.kuskavoyShashlik,
    tags: ["featured"],
    keywords: [...KEBAB_WORDS, "kuskavoy", "kuskovoy", "lamb", "chunks"],
  },
  {
    id: "qanot-shashlik",
    category: "mains",
    name: { uz: "Qanot shashlik", ko: "닭날개 샤슬릭", ru: "Шашлык из крылышек", en: "Chicken Wing Shashlik" },
    ingredients: {
      uz: "Tovuq qanotlari, marinad, ziravorlar",
      ko: "닭날개, 양념, 향신료",
      ru: "Куриные крылышки, маринад, специи",
      en: "Chicken wings, marinade, spices",
    },
    description: {
      uz: "Marinadlangan tovuq qanotlari sixda pishiriladi.",
      ko: "양념에 재운 닭날개를 꼬치에 끼워 구웠습니다.",
      ru: "Маринованные куриные крылышки, приготовленные на шампурах.",
      en: "Marinated chicken wings grilled on skewers.",
    },
    price: null,
    photo: photos.qanotShashlik,
    keywords: [...KEBAB_WORDS, "qanot", "wings", "chicken", "tovuq", "치킨", "닭"],
  },
  {
    id: "tovuq-kabob",
    category: "mains",
    name: { uz: "Tovuq kabobi", ko: "닭고기 샤슬릭", ru: "Шашлык из курицы", en: "Chicken Shashlik" },
    ingredients: {
      uz: "Tovuq goʻshti, qatiqli marinad, sarimsoq, paprika",
      ko: "닭고기, 요거트 양념, 마늘, 파프리카",
      ru: "Курица, маринад на катыке, чеснок, паприка",
      en: "Chicken, yogurt marinade, garlic, paprika",
    },
    description: {
      uz: "Qatiq va ziravorlarda marinadlangan tovuq goʻshti sixda pishiriladi.",
      ko: "요거트와 향신료에 재운 닭고기를 꼬치에 구웠습니다.",
      ru: "Курица, маринованная в катыке и специях, приготовленная на шампурах.",
      en: "Chicken marinated in yogurt and spices, grilled on skewers.",
    },
    price: null,
    photo: photos.tovuqKabob,
    keywords: [...KEBAB_WORDS, "chicken", "tovuq", "kuritsa", "치킨", "닭꼬치"],
  },
  {
    id: "assorti-kabob",
    category: "mains",
    name: { uz: "Assorti kabob", ko: "모둠 케밥", ru: "Шашлык ассорти", en: "Mixed Kebab Platter" },
    ingredients: {
      uz: "Qoʻy, tovuq va qiyma kabob, grilda pishgan sabzavotlar, piyoz",
      ko: "양고기·닭고기·룰라 꼬치, 구운 채소, 양파",
      ru: "Шашлык из баранины и курицы, люля-кебаб, овощи гриль, лук",
      en: "Lamb, chicken & lula skewers, grilled vegetables, onion",
    },
    description: {
      uz: "Qoʻy, tovuq va qiyma kaboblari hamda grilda pishgan sabzavotlar toʻplami.",
      ko: "양고기·닭고기·룰라 꼬치와 구운 채소를 한 접시에 담은 모둠 케밥입니다.",
      ru: "Ассорти из шашлыка из баранины, курицы и люля-кебаба с овощами гриль.",
      en: "An assortment of lamb, chicken and lula skewers with grilled vegetables.",
    },
    price: null,
    photo: photos.assortiKabob,
    keywords: [...KEBAB_WORDS, "mixed", "assorted", "assorti", "platter", "모둠"],
  },

  // ─── Plov ────────────────────────────────────────────────────────────
  {
    id: "toy-oshi",
    category: "plov",
    name: { uz: "Toʻy oshi", ko: "잔치 플롭", ru: "Свадебный плов", en: "Wedding Plov" },
    ingredients: {
      uz: "Guruch, qoʻy goʻshti, sariq sabzi, noʻxat, mayiz, bedana tuxumi",
      ko: "쌀, 양고기, 노란 당근, 병아리콩, 건포도, 메추리알",
      ru: "Рис, баранина, жёлтая морковь, нут, изюм, перепелиное яйцо",
      en: "Rice, lamb, yellow carrot, chickpeas, raisins, quail egg",
    },
    description: {
      uz: "Qozonda damlangan Toshkentcha toʻy oshi — yumshoq qoʻy goʻshti va bedana tuxumi bilan.",
      ko: "카잔에서 지은 타슈켄트식 잔치 플롭으로, 부드러운 양고기와 메추리알을 올렸습니다.",
      ru: "Праздничный плов по-ташкентски из казана — с нежной бараниной и перепелиным яйцом.",
      en: "Tashkent-style festive plov cooked in a kazan, crowned with tender lamb and a quail egg.",
    },
    price: null,
    photo: photos.toyOshi,
    tags: ["featured"],
    keywords: [...PLOV_WORDS, "wedding", "tashkent", "toy"],
  },
  {
    id: "namangan-oshi",
    category: "plov",
    name: { uz: "Namangan oshi", ko: "나망간 플롭", ru: "Наманганский плов", en: "Namangan Plov" },
    ingredients: {
      uz: "Lazer guruch, mol goʻshti, sariq sabzi, piyoz, zira",
      ko: "레이저(Lazer) 쌀, 소고기, 노란 당근, 양파, 커민",
      ru: "Рис «Лазер», говядина, жёлтая морковь, лук, зира",
      en: "Lazer rice, beef, yellow carrot, onion, cumin",
    },
    description: {
      uz: "Lazer guruch va mol goʻshtidan qozonda damlangan asl Namangan oshi.",
      ko: "레이저(Lazer) 쌀과 소고기로 카잔에서 지은 정통 나망간 플롭입니다.",
      ru: "Настоящий наманганский плов из риса «Лазер» и говядины, приготовленный в казане.",
      en: "Authentic Namangan plov of Lazer rice and beef, cooked in a kazan.",
    },
    price: null,
    photo: photos.namanganOshi,
    keywords: [...PLOV_WORDS, "namangan", "laser", "lazer", "beef", "소고기"],
  },
  {
    id: "lagan-osh",
    category: "plov",
    name: { uz: "Lagan osh", ko: "라간 플롭", ru: "Плов на лягане", en: "Plov Platter" },
    ingredients: {
      uz: "Guruch, qoʻy goʻshti, sariq sabzi, noʻxat, bedana tuxumi",
      ko: "쌀, 양고기, 노란 당근, 병아리콩, 메추리알",
      ru: "Рис, баранина, жёлтая морковь, нут, перепелиные яйца",
      en: "Rice, lamb, yellow carrot, chickpeas, quail eggs",
    },
    description: {
      uz: "Butun davra uchun katta laganda tortiladigan osh.",
      ko: "여럿이 함께 나눠 먹도록 큰 접시(라간)에 담아내는 플롭입니다.",
      ru: "Плов, подаваемый на большом блюде-лягане на всю компанию.",
      en: "Plov served on a large lagan platter for the whole table.",
    },
    price: null,
    photo: photos.laganOsh,
    keywords: [...PLOV_WORDS, "family", "platter", "lagan", "lyagan", "큰 접시"],
  },

  // ─── Salads (Qatiq (stakanli) from Drinks is also listed here, before the pickles) ────
  {
    id: "achchiq-chuchuk",
    category: "salads",
    name: { uz: "Achchiq-chuchuk", ko: "아치추크 샐러드", ru: "Ачичук", en: "Tomato & Onion Salad" },
    ingredients: {
      uz: "Pomidor, shirin piyoz, bodring, achchiq qalampir, rayhon",
      ko: "토마토, 단양파, 오이, 고추, 바질",
      ru: "Помидоры, сладкий лук, огурец, острый перец, базилик",
      en: "Tomato, sweet onion, cucumber, chili, basil",
    },
    description: {
      uz: "Osh bilan tortiladigan klassik salat — yupqa toʻgʻralgan, sersuv va yangi.",
      ko: "플롭과 함께 먹는 대표 샐러드로, 얇게 썬 채소가 상큼하고 촉촉합니다.",
      ru: "Классический салат к плову — тонко нарезанный, сочный и свежий.",
      en: "The classic fresh salad served alongside plov — thinly sliced, juicy and bright.",
    },
    price: null,
    photo: photos.achchiqChuchuk,
    keywords: ["achichuk", "achchiq chuchuk", "shakarob", "tomato", "토마토"],
  },
  {
    id: "morkovcha",
    category: "salads",
    name: { uz: "Morkovcha", ko: "고려인 당근 샐러드", ru: "Морковча", en: "Korean-Style Carrot Salad" },
    ingredients: {
      uz: "Sabzi, sarimsoq, kashnich urugʻi, achchiq qalampir, sirka",
      ko: "당근, 마늘, 고수씨, 고추, 식초",
      ru: "Морковь, чеснок, семена кориандра, острый перец, уксус",
      en: "Carrot, garlic, coriander seed, chili, vinegar",
    },
    description: {
      uz: "Markaziy Osiyoda sevib yeyiladigan nordon-achchiq sabzi salati — koreys diasporasi retsepti.",
      ko: "중앙아시아 고려인들이 전해 온 새콤매콤한 당근 무침입니다.",
      ru: "Пикантная маринованная морковь, любимая по всей Средней Азии, — рецепт корё-сарам.",
      en: "Tangy marinated carrots loved across Central Asia — a recipe of the Koryo-saram.",
    },
    price: null,
    photo: photos.morkovcha,
    keywords: ["carrot", "morkovcha", "morkov po koreyski", "당근", "마르코프차"],
  },
  {
    id: "yangi-salat",
    category: "salads",
    name: { uz: "Yangi (Sveji) salat", ko: "신선한 채소 샐러드", ru: "Свежий салат", en: "Fresh Salad" },
    ingredients: {
      uz: "Pomidor, bodring, bolgar qalampiri, koʻkat, piyoz",
      ko: "토마토, 오이, 피망, 채소잎, 양파",
      ru: "Помидоры, огурцы, сладкий перец, зелень, лук",
      en: "Tomato, cucumber, bell pepper, greens, onion",
    },
    description: {
      uz: "Yangi sabzavotlardan tayyorlangan yengil salat.",
      ko: "신선한 채소로 만든 가벼운 샐러드입니다.",
      ru: "Лёгкий салат из свежих овощей.",
      en: "A light salad of fresh vegetables.",
    },
    price: null,
    photo: photos.yangiSalat,
    keywords: ["yangi", "sveji", "svezhiy", "fresh", "vegetable salad", "채소"],
  },
  {
    id: "oliviya",
    category: "salads",
    name: { uz: "Oliviya salat", ko: "올리비에 샐러드", ru: "Салат оливье", en: "Olivier Salad" },
    ingredients: {
      uz: "Kartoshka, sabzi, tuxum, goʻsht, noʻxat, bodring, mayonez",
      ko: "감자, 당근, 달걀, 고기, 완두콩, 오이, 마요네즈",
      ru: "Картофель, морковь, яйца, мясо, горошек, огурцы, майонез",
      en: "Potato, carrot, egg, meat, peas, pickles, mayonnaise",
    },
    description: {
      uz: "Mayonez bilan aralashtirilgan anʼanaviy oliviya salati — bayramona taom.",
      ko: "마요네즈로 버무린 전통 올리비에 샐러드입니다.",
      ru: "Традиционный салат оливье с майонезом — праздничное блюдо.",
      en: "The classic Olivier salad dressed with mayonnaise.",
    },
    price: null,
    photo: photos.oliviya,
    keywords: ["oliviya", "olivier", "olivye", "salad", "올리비에"],
  },
  {
    id: "salyonniy-assorti",
    category: "salads",
    name: { uz: "Salyonniy assorti", ko: "염장 모둠 (절임 모둠)", ru: "Солёное ассорти", en: "Pickled Assortment" },
    ingredients: {
      uz: "Tuzlangan bodring, pomidor, karam, qalampir",
      ko: "오이·토마토·양배추·고추 절임",
      ru: "Солёные огурцы, помидоры, капуста, перец",
      en: "Pickled cucumber, tomato, cabbage, pepper",
    },
    description: {
      uz: "Turli xil tuzlangan sabzavotlar toʻplami — bir laganda tortiladi.",
      ko: "여러 가지 절임 채소를 한 접시에 담은 모둠입니다.",
      ru: "Ассорти из разных солёных овощей на одном блюде.",
      en: "An assortment of various pickled vegetables on one plate.",
    },
    price: null,
    photo: photos.salyonniyAssorti,
    keywords: ["salyonniy", "solyony", "assorti", "pickles", "tuzlama", "절임"],
  },
  {
    id: "tuzlangan-bodring",
    category: "salads",
    name: { uz: "Tuzlangan bodring", ko: "오이 절임", ru: "Солёные огурцы", en: "Pickled Cucumbers" },
    ingredients: {
      uz: "Tuzlangan bodring, sarimsoq, koʻkat",
      ko: "오이 절임, 마늘, 허브",
      ru: "Солёные огурцы, чеснок, зелень",
      en: "Pickled cucumbers, garlic, herbs",
    },
    description: {
      uz: "Bir laganda tortiladigan shoʻr-nordon tuzlangan bodring.",
      ko: "한 접시에 담아 내는 새콤짭짤한 오이 절임입니다.",
      ru: "Тарелка солёно-кислых маринованных огурцов.",
      en: "A plate of tangy pickled cucumbers.",
    },
    price: null,
    photo: photos.tuzlanganBodring,
    keywords: ["tuzlangan bodring", "pickled cucumber", "ogurtsy", "오이 절임"],
  },

  // ─── Bread & pastries ────────────────────────────────────────────────
  {
    id: "tandir-non",
    category: "bread",
    name: { uz: "Tandir non", ko: "탄디르 논", ru: "Тандырная лепёшка", en: "Tandoor Bread" },
    ingredients: {
      uz: "Bugʻdoy uni, xamirturush, kunjut, sedana",
      ko: "밀가루, 효모, 참깨, 니겔라 씨",
      ru: "Пшеничная мука, дрожжи, кунжут, чернушка",
      en: "Wheat flour, yeast, sesame, nigella seeds",
    },
    description: {
      uz: "Loy tandirda yopiladigan dumaloq oʻzbek noni — qobigʻi qarsildoq, oʻrtasi yumshoq.",
      ko: "진흙 화덕 벽에 붙여 굽는 둥근 우즈베크 빵으로, 겉은 바삭하고 속은 부드럽습니다.",
      ru: "Круглая узбекская лепёшка из глиняного тандыра — хрустящая корочка, мягкая середина.",
      en: "Round Uzbek bread baked on the walls of a clay tandoor — crisp crust, soft centre.",
    },
    price: null,
    photo: photos.tandirNon,
    keywords: ["non", "nan", "naan", "bread", "lepyoshka", "lepeshka", "리뾰시까", "빵"],
  },
  {
    id: "non-yarimta",
    category: "bread",
    name: { uz: "Non (yarimta)", ko: "논 (반 개)", ru: "Лепёшка (половинка)", en: "Bread (Half)" },
    ingredients: {
      uz: "Bugʻdoy uni, xamirturush, kunjut, sedana",
      ko: "밀가루, 효모, 참깨, 니겔라 씨",
      ru: "Пшеничная мука, дрожжи, кунжут, чернушка",
      en: "Wheat flour, yeast, sesame, nigella seeds",
    },
    description: {
      uz: "Tandirda yopilgan yangi non — yarimta qilib beriladi.",
      ko: "화덕에 구운 신선한 논을 반 개로 드립니다.",
      ru: "Свежая тандырная лепёшка — половинка.",
      en: "Fresh tandoor bread, served as a half loaf.",
    },
    price: null,
    photo: photos.nonYarimta,
    keywords: ["non", "nan", "naan", "yarimta", "half", "bread", "lepyoshka", "빵"],
  },
  {
    id: "patir",
    category: "bread",
    name: { uz: "Patir", ko: "파티르", ru: "Патыр", en: "Patir Bread" },
    ingredients: {
      uz: "Un, sut, sariyogʻ, kunjut",
      ko: "밀가루, 우유, 버터, 참깨",
      ru: "Мука, молоко, сливочное масло, кунжут",
      en: "Flour, milk, butter, sesame",
    },
    description: {
      uz: "Sut va sariyogʻ qoʻshib tayyorlanadigan qatlamli, mayin patir — tandirda yopiladi.",
      ko: "우유와 버터를 넣어 겹겹이 만든 부드러운 빵으로, 화덕에 구워 냅니다.",
      ru: "Слоёная сдобная лепёшка на молоке и сливочном масле из тандыра.",
      en: "Rich, flaky layered bread made with milk and butter, baked in the tandoor.",
    },
    price: null,
    photo: photos.patir,
    keywords: ["patir", "patyr", "bread", "lepyoshka", "빵"],
  },
  {
    id: "duxovka-somsa-tovuq",
    category: "bread",
    name: {
      uz: "Duxovka somsa — tovuq",
      ko: "오븐 삼사 — 닭고기",
      ru: "Самса из духовки — курица",
      en: "Oven Samsa — Chicken",
    },
    ingredients: {
      uz: "Qatlama xamir, tovuq goʻshti, piyoz, ziravorlar",
      ko: "페이스트리, 닭고기, 양파, 향신료",
      ru: "Слоёное тесто, курица, лук, специи",
      en: "Flaky pastry, chicken, onion, spices",
    },
    description: {
      uz: "Duxovkada pishirilgan qatlama somsa, tovuq goʻshti va piyoz bilan.",
      ko: "닭고기와 양파를 넣어 오븐에 구운 바삭한 페이스트리입니다.",
      ru: "Слоёная самса из духовки с курицей и луком.",
      en: "Flaky oven-baked samsa filled with chicken and onion.",
    },
    price: null,
    photo: photos.duxovkaSomsaTovuq,
    keywords: [...SAMSA_WORDS, "duxovka", "dukhovka", "oven", "chicken", "tovuq", "닭고기"],
  },
  {
    id: "duxovka-somsa-mol",
    category: "bread",
    name: {
      uz: "Duxovka somsa — mol goʻshti",
      ko: "오븐 삼사 — 소고기",
      ru: "Самса из духовки — говядина",
      en: "Oven Samsa — Beef",
    },
    ingredients: {
      uz: "Qatlama xamir, mol goʻshti, piyoz, zira",
      ko: "페이스트리, 소고기, 양파, 커민",
      ru: "Слоёное тесто, говядина, лук, зира",
      en: "Flaky pastry, beef, onion, cumin",
    },
    description: {
      uz: "Duxovkada pishirilgan qatlama somsa, mol goʻshti va piyoz bilan.",
      ko: "소고기와 양파를 넣어 오븐에 구운 바삭한 페이스트리입니다.",
      ru: "Слоёная самса из духовки с говядиной и луком.",
      en: "Flaky oven-baked samsa filled with beef and onion.",
    },
    price: null,
    photo: photos.duxovkaSomsaMol,
    keywords: [...SAMSA_WORDS, "duxovka", "dukhovka", "oven", "beef", "mol", "소고기"],
  },
  {
    id: "tandir-somsa-tovuq",
    category: "bread",
    name: {
      uz: "Tandir somsa — tovuq",
      ko: "탄디르 삼사 — 닭고기",
      ru: "Тандырная самса — курица",
      en: "Tandoor Samsa — Chicken",
    },
    ingredients: {
      uz: "Xamir, tovuq goʻshti, piyoz, kunjut",
      ko: "반죽, 닭고기, 양파, 참깨",
      ru: "Тесто, курица, лук, кунжут",
      en: "Dough, chicken, onion, sesame",
    },
    description: {
      uz: "Tandirda yopilgan somsa, tovuq goʻshti va piyoz bilan.",
      ko: "닭고기와 양파를 넣어 화덕(탄디르)에 구운 삼사입니다.",
      ru: "Самса из тандыра с курицей и луком.",
      en: "Samsa baked in the tandoor, filled with chicken and onion.",
    },
    price: null,
    photo: photos.tandirSomsaTovuq,
    keywords: [...SAMSA_WORDS, "tandir", "tandyr", "tandoor", "chicken", "tovuq", "닭고기"],
  },
  {
    id: "tandir-somsa-mol",
    category: "bread",
    name: {
      uz: "Tandir somsa — mol goʻshti",
      ko: "탄디르 삼사 — 소고기",
      ru: "Тандырная самса — говядина",
      en: "Tandoor Samsa — Beef",
    },
    ingredients: {
      uz: "Xamir, mol goʻshti, piyoz, zira, kunjut",
      ko: "반죽, 소고기, 양파, 커민, 참깨",
      ru: "Тесто, говядина, лук, зира, кунжут",
      en: "Dough, beef, onion, cumin, sesame",
    },
    description: {
      uz: "Tandirda yopilgan somsa, sersuv mol goʻshti va piyoz bilan.",
      ko: "육즙 가득한 소고기와 양파를 넣어 화덕(탄디르)에 구운 삼사입니다.",
      ru: "Самса из тандыра с сочной говядиной и луком.",
      en: "Samsa baked in the tandoor, filled with juicy beef and onion.",
    },
    price: null,
    photo: photos.tandirSomsaMol,
    tags: ["featured"],
    keywords: [...SAMSA_WORDS, "tandir", "tandyr", "tandoor", "beef", "mol", "소고기"],
  },
  {
    id: "cheburek",
    category: "bread",
    name: { uz: "Cheburek", ko: "체부레키", ru: "Чебурек", en: "Cheburek" },
    ingredients: {
      uz: "Yupqa xamir, goʻsht qiymasi, piyoz",
      ko: "얇은 반죽, 다진 고기, 양파",
      ru: "Тонкое тесто, мясной фарш, лук",
      en: "Thin dough, minced meat, onion",
    },
    description: {
      uz: "Sersuv goʻsht qiymasi solingan, qarsildoq qilib qovurilgan yarim oy shaklidagi pishiriq.",
      ko: "육즙 가득한 고기소를 넣어 바삭하게 튀긴 반달 모양 페이스트리입니다.",
      ru: "Хрустящий жареный пирожок-полумесяц с сочной мясной начинкой.",
      en: "A crisp fried half-moon pastry with a juicy meat filling.",
    },
    price: null,
    photo: photos.cheburek,
    keywords: ["cheburek", "chebureki", "chiburek", "체부렉"],
  },
  {
    id: "perashki",
    category: "bread",
    name: { uz: "Perashki", ko: "피로시키", ru: "Пирожки", en: "Pirozhki" },
    ingredients: {
      uz: "Yumshoq xamir, sho‘r qiyma",
      ko: "부드러운 반죽, 짭짤한 속",
      ru: "Мягкое тесто, несладкая начинка",
      en: "Soft dough, savoury filling",
    },
    description: {
      uz: "Ichiga sho‘r qiyma solingan kichik yumshoq pishiriqlar.",
      ko: "짭짤한 속을 넣은 작고 부드러운 빵입니다.",
      ru: "Небольшие мягкие пирожки с несладкой начинкой.",
      en: "Small soft buns with a savoury filling.",
    },
    price: null,
    photo: photos.perashki,
    keywords: ["perashki", "pirozhki", "piroshki", "pirojki", "피로시키"],
  },

  // ─── Desserts ────────────────────────────────────────────────────────
  {
    id: "paxlava",
    category: "desserts",
    name: { uz: "Paxlava", ko: "파흘라바", ru: "Пахлава", en: "Pakhlava" },
    ingredients: {
      uz: "Yupqa xamir qatlamlari, yongʻoq, asal, sariyogʻ",
      ko: "얇은 페이스트리, 호두, 꿀, 버터",
      ru: "Тонкие слои теста, грецкие орехи, мёд, сливочное масло",
      en: "Thin pastry layers, walnuts, honey, butter",
    },
    description: {
      uz: "Romb shaklida kesilgan, yongʻoqli va asal sharbatiga botirilgan qatlamli shirinlik.",
      ko: "호두를 넣은 페이스트리를 마름모꼴로 잘라 꿀 시럽에 적셨습니다.",
      ru: "Слоёная сладость с грецкими орехами, нарезанная ромбами и пропитанная медовым сиропом.",
      en: "Diamond-cut layers of pastry and walnuts, soaked in honey syrup.",
    },
    price: null,
    photo: photos.paxlava,
    keywords: ["baklava", "pakhlava", "paxlava", "바클라바"],
  },
  {
    id: "medovik",
    category: "desserts",
    name: { uz: "Medovik", ko: "메도빅", ru: "Медовик", en: "Honey Cake" },
    ingredients: {
      uz: "Asalli korj, smetana kremi, yongʻoq",
      ko: "꿀 시트, 사워크림, 호두",
      ru: "Медовые коржи, сметанный крем, грецкие орехи",
      en: "Honey sponge layers, sour-cream frosting, walnuts",
    },
    description: {
      uz: "Asalli yupqa korjlar yengil smetanali krem bilan qatlanadi.",
      ko: "꿀을 넣은 얇은 시트에 가벼운 사워크림을 층층이 바른 꿀 케이크입니다.",
      ru: "Нежные медовые коржи, прослоенные лёгким сметанным кремом.",
      en: "Delicate honey sponge layered with a light sour-cream frosting.",
    },
    price: null,
    photo: photos.medovik,
    keywords: ["honey cake", "medovik", "cake", "케이크"],
  },
  {
    id: "napoleon",
    category: "desserts",
    name: { uz: "Napoleon torti", ko: "나폴레옹 케이크", ru: "Торт «Наполеон»", en: "Napoleon Cake" },
    ingredients: {
      uz: "Qatlama xamir korjlari, qaymoqli krem",
      ko: "페이스트리 시트, 커스터드 크림",
      ru: "Слоёные коржи, заварной крем",
      en: "Puff pastry layers, custard cream",
    },
    description: {
      uz: "Yupqa qarsildoq qatlamlar va mayin qaymoqli krem.",
      ko: "얇고 바삭한 페이스트리 층에 부드러운 커스터드 크림을 채웠습니다.",
      ru: "Тонкие хрустящие слоёные коржи с нежным заварным кремом.",
      en: "Thin layers of crisp puff pastry with smooth custard cream.",
    },
    price: null,
    photo: photos.napoleon,
    keywords: ["napoleon", "mille feuille", "cake", "케이크"],
  },
  {
    id: "shokoladli-tort",
    category: "desserts",
    name: { uz: "Shokoladli tort", ko: "초콜릿 케이크", ru: "Шоколадный торт", en: "Chocolate Cake" },
    ingredients: {
      uz: "Shokoladli biskvit, shokoladli krem",
      ko: "초콜릿 스펀지, 초콜릿 크림",
      ru: "Шоколадный бисквит, шоколадный крем",
      en: "Chocolate sponge, chocolate cream",
    },
    description: {
      uz: "Shokoladli krem bilan qatlangan mayin shokoladli biskvit.",
      ko: "초콜릿 크림을 층층이 바른 촉촉한 초콜릿 케이크입니다.",
      ru: "Нежный шоколадный бисквит, прослоенный шоколадным кремом.",
      en: "Rich chocolate sponge layered with chocolate cream.",
    },
    price: null,
    photo: photos.shokoladliTort,
    keywords: ["chocolate", "shokolad", "cake", "초콜릿", "케이크"],
  },

  // ─── Drinks ──────────────────────────────────────────────────────────
  {
    id: "choy",
    category: "drinks",
    name: { uz: "Choy", ko: "차 (포트)", ru: "Чай (чайник)", en: "Tea Pot" },
    ingredients: {
      uz: "Koʻk yoki qora choy",
      ko: "녹차 또는 홍차",
      ru: "Зелёный или чёрный чай",
      en: "Green or black tea",
    },
    description: {
      uz: "Piyolaga quyib ichiladigan anʼanaviy choynakdagi choy — dasturxonning ajralmas qismi.",
      ko: "전통 찻주전자(초이나크)에 담아 피알라 잔에 따라 마시는 우즈베크식 차입니다.",
      ru: "Чай в традиционном чайнике, который разливают по пиалам, — неизменная часть дастархана.",
      en: "A traditional choynak pot of tea, poured into piala bowls — the Uzbek way to end a meal.",
    },
    price: null,
    photo: photos.choy,
    keywords: ["tea", "chai", "choy", "chay", "green tea", "black tea", "녹차", "홍차"],
  },
  {
    id: "limon-choy",
    category: "drinks",
    name: { uz: "Limon choy", ko: "레몬 홍차", ru: "Чай с лимоном", en: "Lemon Tea" },
    ingredients: {
      uz: "Qora choy, limon",
      ko: "홍차, 레몬",
      ru: "Чёрный чай, лимон",
      en: "Black tea, lemon",
    },
    description: {
      uz: "Limon boʻlakchalari solingan issiq qora choy.",
      ko: "레몬 조각을 넣은 따뜻한 홍차입니다.",
      ru: "Горячий чёрный чай с ломтиками лимона.",
      en: "Hot black tea with slices of lemon.",
    },
    price: null,
    photo: photos.limonChoy,
    keywords: ["tea", "chai", "choy", "lemon", "limon", "레몬", "홍차"],
  },
  {
    id: "sutli-choy",
    category: "drinks",
    name: { uz: "Sutli choy", ko: "밀크티", ru: "Чай с молоком", en: "Milk Tea" },
    ingredients: {
      uz: "Choy, sut",
      ko: "차, 우유",
      ru: "Чай, молоко",
      en: "Tea, milk",
    },
    description: {
      uz: "Sut qoʻshib damlangan issiq choy.",
      ko: "우유를 넣어 우린 따뜻한 차입니다.",
      ru: "Горячий чай, заваренный с молоком.",
      en: "Hot tea brewed with milk.",
    },
    price: null,
    photo: photos.sutliChoy,
    keywords: ["tea", "chai", "choy", "milk tea", "sutli", "shir choy", "밀크티"],
  },
  {
    id: "ayron",
    category: "drinks",
    name: { uz: "Ayron", ko: "아이란", ru: "Айран", en: "Ayran" },
    ingredients: {
      uz: "Sovuq qatiq, suv, tuz, yalpiz",
      ko: "차가운 요거트, 물, 소금, 민트",
      ru: "Охлаждённый катык, вода, соль, мята",
      en: "Chilled yogurt, water, salt, mint",
    },
    description: {
      uz: "Tetiklashtiruvchi sovuq ayron — kabob bilan juda mos.",
      ko: "시원하고 짭조름한 요거트 음료로, 케밥과 잘 어울립니다.",
      ru: "Освежающий солёный кисломолочный напиток — идеально к шашлыку.",
      en: "A refreshing salted yogurt drink — the perfect match for kebabs.",
    },
    price: null,
    photo: photos.ayron,
    keywords: ["ayran", "airan", "ayron", "yogurt drink", "요거트"],
  },
  {
    id: "kompot",
    category: "drinks",
    name: { uz: "Kompot", ko: "콤포트", ru: "Компот", en: "Dried Fruit Kompot" },
    ingredients: {
      uz: "Turshak, mayiz, olma, olcha",
      ko: "말린 살구, 건포도, 사과, 체리",
      ru: "Курага, изюм, яблоки, вишня",
      en: "Dried apricots, raisins, apple, sour cherry",
    },
    description: {
      uz: "Quritilgan mevalardan tayyorlanadigan anʼanaviy ichimlik — sovuq holda tortiladi.",
      ko: "말린 과일을 우려 만든 전통 음료로, 은은하게 달콤합니다.",
      ru: "Традиционный напиток из сухофруктов, слегка сладкий, подаётся охлаждённым.",
      en: "A traditional drink of steeped dried fruit, lightly sweet and served chilled.",
    },
    price: null,
    photo: photos.kompot,
    keywords: ["compote", "kompot", "juice", "주스"],
  },
  {
    id: "soft-drinks",
    category: "drinks",
    name: { uz: "Gazli ichimliklar", ko: "탄산음료", ru: "Газированные напитки", en: "Soft Drinks" },
    ingredients: {
      uz: "Turli gazli ichimliklar",
      ko: "여러 가지 탄산음료",
      ru: "Газированные напитки в ассортименте",
      en: "Assorted soft drinks",
    },
    description: {
      uz: "Sovuq holda tortiladi.",
      ko: "시원하게 제공됩니다.",
      ru: "Подаются охлаждёнными.",
      en: "Served chilled.",
    },
    price: null,
    photo: photos.gazliIchimlik,
    keywords: ["cola", "coke", "soda", "gazirovka", "콜라", "사이다"],
  },
  {
    id: "anor-fresh",
    category: "drinks",
    name: { uz: "Anor fresh", ko: "석류 생과일주스", ru: "Гранатовый фреш", en: "Fresh Pomegranate Juice" },
    ingredients: {
      uz: "Yangi siqilgan anor sharbati",
      ko: "갓 짜낸 석류즙",
      ru: "Свежевыжатый гранатовый сок",
      en: "Freshly squeezed pomegranate juice",
    },
    description: {
      uz: "Yangi siqilgan anor sharbati.",
      ko: "갓 짜낸 석류 생과일주스입니다.",
      ru: "Свежевыжатый сок из спелого граната.",
      en: "Freshly squeezed juice of ripe pomegranates.",
    },
    price: null,
    photo: photos.anorFresh,
    keywords: ["anor", "anar", "pomegranate", "granat", "fresh", "juice", "석류", "주스"],
  },
  {
    id: "xurmo-fresh",
    category: "drinks",
    name: { uz: "Xurmo fresh", ko: "감 생과일주스", ru: "Фреш из хурмы", en: "Fresh Persimmon Juice" },
    ingredients: {
      uz: "Yangi siqilgan xurmo sharbati",
      ko: "갓 갈아 만든 감 주스",
      ru: "Свежевыжатый сок хурмы",
      en: "Freshly pressed persimmon juice",
    },
    description: {
      uz: "Pishgan xurmodan tayyorlangan shirin fresh.",
      ko: "잘 익은 감으로 만든 달콤한 생과일주스입니다.",
      ru: "Сладкий фреш из спелой хурмы.",
      en: "A sweet fresh juice of ripe persimmons.",
    },
    price: null,
    photo: photos.xurmoFresh,
    keywords: ["xurmo", "khurmo", "hurma", "persimmon", "fresh", "juice", "감", "주스"],
  },
  {
    id: "mojito",
    category: "drinks",
    name: { uz: "Mojito", ko: "모히토 (무알코올)", ru: "Мохито", en: "Mojito" },
    ingredients: {
      uz: "Laym, yalpiz, gazli suv, muz — alkogolsiz",
      ko: "라임, 민트, 탄산수, 얼음 — 무알코올",
      ru: "Лайм, мята, газированная вода, лёд — без алкоголя",
      en: "Lime, mint, soda water, ice — alcohol-free",
    },
    description: {
      uz: "Laym va yalpizli tetiklantiruvchi alkogolsiz mojito.",
      ko: "라임과 민트로 만든 상큼한 무알코올 모히토입니다.",
      ru: "Освежающий безалкогольный мохито с лаймом и мятой.",
      en: "A refreshing alcohol-free mojito with lime and mint.",
    },
    price: null,
    photo: photos.mojito,
    keywords: ["mojito", "mohito", "mint", "lime", "lemonade", "모히토"],
  },
  {
    id: "flavis",
    category: "drinks",
    name: { uz: "Flavis", ko: "플라비스", ru: "Flavis", en: "Flavis" },
    ingredients: {
      uz: "Gazli ichimlik — taʼmlari mavjudligiga qarab",
      ko: "탄산음료 — 맛은 재고에 따라 다름",
      ru: "Газированный напиток — вкусы в наличии",
      en: "Carbonated soft drink — flavours as available",
    },
    description: {
      uz: "Flavis gazli ichimligi — sovuq holda tortiladi.",
      ko: "플라비스 탄산음료로, 시원하게 제공됩니다.",
      ru: "Газированный напиток Flavis, подаётся охлаждённым.",
      en: "Flavis soft drink, served chilled.",
    },
    price: null,
    photo: photos.flavis,
    keywords: ["flavis", "soda", "lemonade", "gazli", "탄산"],
  },
  {
    id: "b-fresh",
    category: "drinks",
    name: { uz: "B fresh", ko: "비 프레시", ru: "B fresh", en: "B Fresh" },
    ingredients: {
      uz: "Mevali ichimlik — taʼmlari mavjudligiga qarab",
      ko: "과일 음료 — 맛은 재고에 따라 다름",
      ru: "Фруктовый напиток — вкусы в наличии",
      en: "Fruit drink — flavours as available",
    },
    description: {
      uz: "B fresh mevali ichimligi — sovuq holda tortiladi.",
      ko: "비 프레시 과일 음료로, 시원하게 제공됩니다.",
      ru: "Фруктовый напиток B fresh, подаётся охлаждённым.",
      en: "B Fresh fruit drink, served chilled.",
    },
    price: null,
    photo: photos.bFresh,
    keywords: ["b fresh", "bfresh", "be fresh", "fruit drink", "juice", "주스"],
  },
  {
    id: "qatiq-stakan",
    category: "drinks",
    alsoIn: [{ category: "salads", before: "tuzlangan-bodring" }],
    name: { uz: "Qatiq (stakanli)", ko: "카티크 (컵)", ru: "Катык (стакан)", en: "Qatiq (Glass)" },
    ingredients: {
      uz: "Tabiiy qatiq",
      ko: "천연 카티크(우즈베크식 요구르트)",
      ru: "Натуральный катык",
      en: "Natural qatiq (Uzbek yogurt)",
    },
    description: {
      uz: "Bir stakan tabiiy qatiq — har qanday taomga juda mos.",
      ko: "천연 카티크 한 컵 — 어떤 요리와도 잘 어울립니다.",
      ru: "Стакан натурального катыка — отлично дополняет любое блюдо.",
      en: "A glass of natural qatiq — goes well with any dish.",
    },
    price: null,
    portion: { uz: "1 stakan", ko: "1컵", ru: "1 стакан", en: "1 glass" },
    photo: photos.qatiqStakan,
    keywords: ["qatiq", "katyk", "katik", "yogurt", "stakan", "glass", "카티크", "요거트"],
  },
  {
    id: "qatiq-05",
    category: "drinks",
    name: { uz: "Qatiq 0,5 L", ko: "카티크 0.5L", ru: "Катык 0,5 л", en: "Qatiq 0.5 L" },
    ingredients: {
      uz: "Tabiiy qatiq, 0,5 litr",
      ko: "천연 카티크, 0.5리터",
      ru: "Натуральный катык, 0,5 литра",
      en: "Natural qatiq, 0.5 litre",
    },
    description: {
      uz: "Yarim litrlik idishda tabiiy qatiq.",
      ko: "0.5리터 용기에 담은 천연 카티크입니다.",
      ru: "Натуральный катык в упаковке 0,5 литра.",
      en: "Natural qatiq in a half-litre bottle.",
    },
    price: null,
    portion: { uz: "0,5 L", ko: "0.5L", ru: "0,5 л", en: "0.5 L" },
    photo: photos.qatiqBottle,
    keywords: ["qatiq", "katyk", "katik", "yogurt", "0.5", "0,5", "카티크"],
  },
  {
    id: "qatiq-1l",
    category: "drinks",
    name: { uz: "Qatiq 1 L", ko: "카티크 1L", ru: "Катык 1 л", en: "Qatiq 1 L" },
    ingredients: {
      uz: "Tabiiy qatiq, 1 litr",
      ko: "천연 카티크, 1리터",
      ru: "Натуральный катык, 1 литр",
      en: "Natural qatiq, 1 litre",
    },
    description: {
      uz: "Bir litrlik idishda tabiiy qatiq — butun oila uchun.",
      ko: "1리터 용기에 담은 천연 카티크로, 온 가족이 함께 즐기기 좋습니다.",
      ru: "Натуральный катык в упаковке 1 литр — на всю семью.",
      en: "Natural qatiq in a one-litre bottle — enough for the whole family.",
    },
    price: null,
    portion: { uz: "1 L", ko: "1L", ru: "1 л", en: "1 L" },
    photo: photos.qatiqBottle,
    keywords: ["qatiq", "katyk", "katik", "yogurt", "1l", "litr", "카티크"],
  },
  {
    id: "kartoshka-fri",
    category: "drinks",
    name: { uz: "Kartoshka fri", ko: "감자튀김", ru: "Картофель фри", en: "French Fries" },
    ingredients: {
      uz: "Kartoshka, tuz",
      ko: "감자, 소금",
      ru: "Картофель, соль",
      en: "Potatoes, salt",
    },
    description: {
      uz: "Tillarang va qarsildoq qilib qovurilgan kartoshka fri.",
      ko: "노릇하고 바삭하게 튀긴 감자튀김입니다.",
      ru: "Золотистый хрустящий картофель фри.",
      en: "Golden, crispy French fries.",
    },
    price: null,
    photo: photos.kartoshkaFri,
    keywords: ["kartoshka", "fri", "free", "french fries", "fries", "potato", "감자튀김"],
  },
  {
    id: "mineral-suv",
    category: "drinks",
    name: { uz: "Mineral suv", ko: "생수", ru: "Минеральная вода", en: "Mineral Water" },
    ingredients: {
      uz: "Shishadagi mineral suv",
      ko: "병에 든 생수",
      ru: "Бутилированная минеральная вода",
      en: "Bottled mineral water",
    },
    description: {
      uz: "Sovuq holda tortiladi.",
      ko: "시원하게 제공됩니다.",
      ru: "Подаётся охлаждённой.",
      en: "Served chilled.",
    },
    price: null,
    photo: photos.mineralSuv,
    keywords: ["water", "suv", "voda", "mineral", "물"],
  },
  {
    id: "chortoq",
    category: "drinks",
    name: { uz: "Chortoq", ko: "초르톡 미네랄워터", ru: "Чартак", en: "Chortoq Mineral Water" },
    ingredients: {
      uz: "Chortoq mineral suvi",
      ko: "초르톡 미네랄워터",
      ru: "Минеральная вода «Чартак»",
      en: "Chortoq mineral water",
    },
    description: {
      uz: "Oʻzbekistonning Chortoq mineral suvi — sovuq holda tortiladi.",
      ko: "우즈베키스탄의 초르톡 미네랄워터로, 시원하게 제공됩니다.",
      ru: "Узбекская минеральная вода «Чартак», подаётся охлаждённой.",
      en: "Chortoq mineral water from Uzbekistan, served chilled.",
    },
    price: null,
    photo: photos.chortoq,
    keywords: ["chortoq", "chartak", "mineral", "water", "suv", "voda", "물"],
  },
  {
    id: "borjomi",
    category: "drinks",
    name: { uz: "Borjomi", ko: "보르조미 미네랄워터", ru: "Боржоми", en: "Borjomi Mineral Water" },
    ingredients: {
      uz: "Gazli mineral suv",
      ko: "탄산 미네랄워터",
      ru: "Газированная минеральная вода",
      en: "Sparkling mineral water",
    },
    description: {
      uz: "Borjomi tabiiy gazli mineral suvi — sovuq holda tortiladi.",
      ko: "보르조미 천연 탄산 미네랄워터로, 시원하게 제공됩니다.",
      ru: "Природная газированная минеральная вода «Боржоми», подаётся охлаждённой.",
      en: "Borjomi naturally sparkling mineral water, served chilled.",
    },
    price: null,
    photo: photos.borjomi,
    keywords: ["borjomi", "barjomi", "borzhomi", "mineral", "water", "sparkling", "물"],
  },
];

export const dishById = new Map(dishes.map((d) => [d.id, d]));

/** Each category's dishes in menu order, including dishes listed there via `alsoIn`. */
export const dishesByCategory = new Map<CategoryId, Dish[]>(
  categories.map((c) => {
    const list = dishes.filter((d) => d.category === c.id);
    for (const dish of dishes) {
      for (const extra of dish.alsoIn ?? []) {
        if (extra.category !== c.id) continue;
        const at = extra.before ? list.findIndex((d) => d.id === extra.before) : -1;
        list.splice(at === -1 ? list.length : at, 0, dish);
      }
    }
    return [c.id, list];
  }),
);

/** True once at least one price has been filled in. */
export const hasPrices = dishes.some((d) => d.price !== null);
