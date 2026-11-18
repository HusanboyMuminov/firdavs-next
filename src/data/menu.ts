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
  | "kebabs"
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
  /** Extra search terms: alternative spellings, transliterations, etc. */
  keywords?: string[];
};

/** Order here = order of the tabs and sections. `cover` is the Home tile photo. */
export const categories: { id: CategoryId; label: Localized; cover?: Photo }[] = [
  { id: "soups", label: { uz: "Shoʻrvalar", ko: "수프", ru: "Супы", en: "Soups" }, cover: photos.shorva },
  { id: "mains", label: { uz: "Asosiy taomlar", ko: "메인 요리", ru: "Основные блюда", en: "Main dishes" }, cover: photos.manti },
  { id: "plov", label: { uz: "Palov", ko: "플롭", ru: "Плов", en: "Plov" }, cover: photos.toyOshi },
  { id: "kebabs", label: { uz: "Kaboblar", ko: "케밥", ru: "Шашлыки", en: "Kebabs" }, cover: photos.assortiKabob },
  { id: "salads", label: { uz: "Salatlar", ko: "샐러드", ru: "Салаты", en: "Salads" }, cover: photos.achchiqChuchuk },
  { id: "bread", label: { uz: "Non va pishiriqlar", ko: "빵 · 페이스트리", ru: "Хлеб и выпечка", en: "Bread" }, cover: photos.tandirNon },
  { id: "desserts", label: { uz: "Shirinliklar", ko: "디저트", ru: "Десерты", en: "Desserts" }, cover: photos.napoleon },
  { id: "drinks", label: { uz: "Ichimliklar", ko: "음료", ru: "Напитки", en: "Drinks" }, cover: photos.choy },
];

const PLOV_WORDS = ["plov", "pilaf", "pilau", "palov", "osh", "필라프"];
const KEBAB_WORDS = ["kebab", "kabob", "shashlik", "shashlyk", "꼬치"];
const SAMSA_WORDS = ["samsa", "somsa", "samosa", "삼사"];

export const dishes: Dish[] = [
  // ─── Soups ────────────────────────────────────────────────────────────
  {
    id: "shorva",
    category: "soups",
    name: { uz: "Shoʻrva", ko: "쇼르바", ru: "Шурпа", en: "Shurpa" },
    ingredients: {
      uz: "Qoʻy goʻshti, kartoshka, sabzi, noʻxat, koʻkat",
      ko: "양고기, 감자, 당근, 병아리콩, 허브",
      ru: "Баранина, картофель, морковь, нут, зелень",
      en: "Lamb, potato, carrot, chickpeas, fresh herbs",
    },
    description: {
      uz: "Yirik goʻsht boʻlaklari va sabzavotlar solingan tiniq qoʻy goʻshti shoʻrvasi — oʻzbek dasturxonining mumtoz taomi.",
      ko: "양고기와 큼직한 채소가 들어간 맑은 국물 — 우즈베키스탄 가정식을 대표하는 수프입니다.",
      ru: "Прозрачный бульон из баранины с крупными кусками мяса и овощами — классика узбекской домашней кухни.",
      en: "A clear lamb broth with generous pieces of meat and vegetables — a classic of Uzbek home cooking.",
    },
    price: null,
    photo: photos.shorva,
    keywords: ["shurpa", "shorpa", "shurva", "chorba", "lamb soup", "양고기"],
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
    id: "suyuq-lagmon",
    category: "soups",
    name: { uz: "Suyuq lagʻmon", ko: "라그만 수프", ru: "Суюк лагман", en: "Lagman Soup" },
    ingredients: {
      uz: "Lagʻmon, mol goʻshti, bolgar qalampiri, kartoshka, pomidor",
      ko: "라그만 면, 소고기, 피망, 감자, 토마토",
      ru: "Лапша для лагмана, говядина, сладкий перец, картофель, помидоры",
      en: "Lagman noodles, beef, bell pepper, potato, tomato",
    },
    description: {
      uz: "Goʻshtli va sabzavotli quyuq shoʻrvadagi lagʻmon.",
      ko: "라그만 면을 진한 소고기 채소 국물에 담은 수프입니다.",
      ru: "Лапша для лагмана в насыщенном мясном бульоне с овощами.",
      en: "Lagman noodles in a rich beef and vegetable broth.",
    },
    price: null,
    photo: photos.suyuqLagmon,
    keywords: ["lagman", "laghman", "lagmon", "noodle soup", "국수"],
  },
  {
    id: "uygur-lagmon",
    category: "soups",
    name: { uz: "Uygur lagʻmon", ko: "위구르 라그만", ru: "Уйгурский лагман", en: "Uyghur Lagman" },
    ingredients: {
      uz: "Lagʻmon, mol goʻshti, bolgar qalampiri, pomidor, sarimsoq",
      ko: "라그만 면, 소고기, 피망, 토마토, 마늘",
      ru: "Лапша для лагмана, говядина, сладкий перец, помидоры, чеснок",
      en: "Lagman noodles, beef, bell pepper, tomato, garlic",
    },
    description: {
      uz: "Uygʻurcha lagʻmon: choʻziluvchan lagʻmon ustiga goʻsht va sabzavotli vaju quyiladi.",
      ko: "위구르식 라그만 — 쫄깃한 면 위에 소고기와 채소로 만든 소스를 얹었습니다.",
      ru: "Лагман по-уйгурски: упругая лапша с соусом из говядины и овощей.",
      en: "Uyghur-style lagman: chewy noodles with a savoury sauce of beef and vegetables.",
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
    id: "ilik-shorva",
    category: "soups",
    name: { uz: "Ilik shoʻrva", ko: "일크 쇼르바", ru: "Илк шурпа", en: "Ilik Shurpa" },
    ingredients: {
      uz: "Goʻsht, sho‘rva, sabzavotlar, koʻkat",
      ko: "고기, 육수, 채소, 허브",
      ru: "Мясо, бульон, овощи, зелень",
      en: "Meat, broth, vegetables, herbs",
    },
    description: {
      uz: "Goʻsht va sabzavotlar bilan tayyorlanadigan toʻyimli oʻzbekcha shoʻrva.",
      ko: "고기와 채소로 끓인 든든한 우즈베키스탄식 수프입니다.",
      ru: "Сытная узбекская шурпа с мясом и овощами.",
      en: "A hearty Uzbek soup of meat and vegetables in a rich broth.",
    },
    price: null,
    photo: photos.ilikShorva,
    keywords: ["shurpa", "shorva", "shurva", "ilk", "ilik"],
  },

  // ─── Main dishes ──────────────────────────────────────────────────────
  {
    id: "qovurma-lagmon",
    category: "mains",
    name: { uz: "Qovurma lagʻmon", ko: "볶음 라그만", ru: "Ковурма лагман", en: "Fried Lagman" },
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
      uz: "Sersuv goʻsht va piyozli, bugʻda pishirilgan yirik manti.",
      ko: "육즙 가득한 고기와 양파 소를 넣어 쪄 낸 큼직한 만두입니다.",
      ru: "Крупные манты на пару с сочной мясной начинкой и луком.",
      en: "Large steamed dumplings filled with juicy minced meat and onion.",
    },
    price: null,
    photo: photos.manti,
    tags: ["featured"],
    keywords: ["manty", "mantu", "dumplings", "만두", "찐만두"],
  },
  {
    id: "qozon-kabob",
    category: "mains",
    name: { uz: "Qozon kabob", ko: "카잔 케밥", ru: "Казан-кебаб", en: "Kazan Kebab" },
    ingredients: {
      uz: "Qoʻy qovurgʻasi, kartoshka, piyoz, zira",
      ko: "양갈비, 감자, 양파, 커민",
      ru: "Бараньи рёбрышки, картофель, лук, зира",
      en: "Lamb ribs, potatoes, onion, cumin",
    },
    description: {
      uz: "Qoʻy qovurgʻasi va kartoshka qozonda tilla rang tusga kirguncha qovuriladi.",
      ko: "양갈비와 감자를 카잔(무쇠솥)에서 노릇하게 익힌 요리입니다.",
      ru: "Бараньи рёбрышки и картофель, обжаренные в казане до золотистой корочки.",
      en: "Lamb ribs and potatoes fried in a kazan until golden.",
    },
    price: null,
    photo: photos.qozonKabob,
    tags: ["featured"],
    keywords: ["kazan kabob", "kazan kebab", "qozon", "lamb ribs", "양갈비"],
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
    name: { uz: "Kuskavoy shashlik", ko: "덩어리 고기 샤슬릭", ru: "Кусковой шашлык", en: "Meat Chunk Shashlik" },
    ingredients: {
      uz: "Marinadlangan goʻsht boʻlaklari, piyoz, ziravorlar",
      ko: "양념한 고기 덩어리, 양파, 향신료",
      ru: "Маринованные куски мяса, лук, специи",
      en: "Marinated meat chunks, onion, spices",
    },
    description: {
      uz: "Marinadlangan sersuv goʻsht boʻlaklari sixda pishiriladi.",
      ko: "양념에 재운 큼직한 고기를 꼬치에 끼워 구웠습니다.",
      ru: "Сочные куски маринованного мяса, приготовленные на шампурах.",
      en: "Juicy pieces of marinated meat grilled on skewers.",
    },
    price: null,
    photo: photos.kuskavoyShashlik,
    keywords: [...KEBAB_WORDS, "kuskavoy", "kuskovoy", "chunks"],
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

  // ─── Plov ─────────────────────────────────────────────────────────────
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
    id: "fargona-oshi",
    category: "plov",
    name: { uz: "Fargʻona oshi", ko: "페르가나 플롭", ru: "Ферганский плов", en: "Fergana Plov" },
    ingredients: {
      uz: "Guruch, qoʻy goʻshti, sabzi, butun sarimsoq",
      ko: "쌀, 양고기, 당근, 통마늘",
      ru: "Рис, баранина, морковь, целые головки чеснока",
      en: "Rice, lamb, carrot, whole garlic",
    },
    description: {
      uz: "Fargʻona vodiysining toʻyimli, toʻq rangli oshi — butun sarimsoq bilan.",
      ko: "페르가나 계곡식의 진한 플롭으로, 통마늘을 넣어 짓습니다.",
      ru: "Насыщенный, более тёмный плов Ферганской долины с целыми головками чеснока.",
      en: "A rich, darker plov from the Fergana Valley, cooked with whole garlic.",
    },
    price: null,
    photo: photos.fargonaOshi,
    keywords: [...PLOV_WORDS, "fergana", "fargona"],
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

  // ─── Kebabs ───────────────────────────────────────────────────────────
  {
    id: "qoy-kabob",
    category: "kebabs",
    name: { uz: "Qoʻy goʻshti kabobi", ko: "양고기 샤슬릭", ru: "Шашлык из баранины", en: "Lamb Shashlik" },
    ingredients: {
      uz: "Qoʻy goʻshti, piyoz, zira, kashnich",
      ko: "양고기, 양파, 커민, 고수",
      ru: "Баранина, лук, зира, кориандр",
      en: "Lamb, onion, cumin, coriander",
    },
    description: {
      uz: "Marinadlangan qoʻy goʻshti sixda pishiriladi.",
      ko: "양념한 양고기를 꼬치에 끼워 구웠습니다.",
      ru: "Маринованная баранина, приготовленная на шампурах.",
      en: "Marinated lamb grilled on skewers.",
    },
    price: null,
    photo: photos.qoyKabob,
    tags: ["featured"],
    keywords: [...KEBAB_WORDS, "lamb", "baranina", "양꼬치"],
  },
  {
    id: "lula-kabob",
    category: "kebabs",
    name: { uz: "Qiyma kabob", ko: "룰라 케밥", ru: "Люля-кебаб", en: "Lula Kebab" },
    ingredients: {
      uz: "Qoʻy goʻshti qiymasi, piyoz, koʻkat",
      ko: "다진 양고기, 양파, 허브",
      ru: "Фарш из баранины, лук, зелень",
      en: "Minced lamb, onion, herbs",
    },
    description: {
      uz: "Qoʻy goʻshti qiymasidan tayyorlanib, sixda pishiriladigan kabob.",
      ko: "다진 양고기를 꼬치에 감아 구운 케밥입니다.",
      ru: "Кебаб из бараньего фарша, приготовленный на шампуре.",
      en: "Minced lamb kebab grilled on a skewer.",
    },
    price: null,
    photo: photos.lulaKabob,
    keywords: [...KEBAB_WORDS, "lula", "lyulya", "qiyma"],
  },
  {
    id: "tovuq-kabob",
    category: "kebabs",
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
    category: "kebabs",
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

  // ─── Salads ───────────────────────────────────────────────────────────
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

  // ─── Bread & pastries ─────────────────────────────────────────────────
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
    id: "patir",
    category: "bread",
    name: { uz: "Patir non", ko: "파티르", ru: "Патир", en: "Patir Flatbread" },
    ingredients: {
      uz: "Un, sariyogʻ, sut, kunjut",
      ko: "밀가루, 버터, 우유, 참깨",
      ru: "Мука, сливочное масло, молоко, кунжут",
      en: "Flour, butter, milk, sesame",
    },
    description: {
      uz: "Sariyogʻ bilan qatlab tayyorlanadigan, qavat-qavat patir — choy bilan juda mos.",
      ko: "버터를 넣어 겹겹이 만든 고소한 빵으로, 차와 잘 어울립니다.",
      ru: "Слоёная сдобная лепёшка на сливочном масле — отлично к чаю.",
      en: "Rich, flaky layered bread made with butter — perfect with a pot of tea.",
    },
    price: null,
    photo: photos.patir,
    keywords: ["patyr", "patir", "bread", "빵"],
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

  // ─── Desserts ─────────────────────────────────────────────────────────
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

  // ─── Drinks ───────────────────────────────────────────────────────────
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
];

export const dishById = new Map(dishes.map((d) => [d.id, d]));

/** True once at least one price has been filled in. */
export const hasPrices = dishes.some((d) => d.price !== null);
