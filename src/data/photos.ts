import type { StaticImageData } from "next/image";

import achchiqChuchuk from "@/assets/menu/achchiq-chuchuk.jpg";
import achchiqGosht from "@/assets/menu/achchiq-gosht.jpg";
import anorFresh from "@/assets/menu/anor-fresh.jpg";
import assortiKabob from "@/assets/menu/assorti-kabob.jpg";
import ayron from "@/assets/menu/ayron.jpg";
import bFresh from "@/assets/menu/b-fresh.jpg";
import beshbarmoq from "@/assets/menu/beshbarmoq.jpg";
import bifshteksTabaka from "@/assets/menu/bifshteks-tabaka.jpg";
import borjomi from "@/assets/menu/borjomi.jpg";
import cheburek from "@/assets/menu/cheburek.jpg";
import chortoq from "@/assets/menu/chortoq.jpg";
import choy from "@/assets/menu/choy.jpg";
import chuchvara from "@/assets/menu/chuchvara.jpg";
import dolma from "@/assets/menu/dolma.jpg";
import duxovkaSomsaMol from "@/assets/menu/duxovka-somsa-mol.jpg";
import duxovkaSomsaTovuq from "@/assets/menu/duxovka-somsa-tovuq.jpg";
import flavis from "@/assets/menu/flavis.jpg";
import gazliIchimlik from "@/assets/menu/gazli-ichimlik.jpg";
import jiz from "@/assets/menu/jiz.jpg";
import kartoshkaFri from "@/assets/menu/kartoshka-fri.jpg";
import kompot from "@/assets/menu/kompot.jpg";
import kuskavoyShashlik from "@/assets/menu/kuskavoy-shashlik.jpg";
import laganOsh from "@/assets/menu/lagan-osh.jpg";
import limonChoy from "@/assets/menu/limon-choy.jpg";
import manti from "@/assets/menu/manti.jpg";
import mastava from "@/assets/menu/mastava.jpg";
import medovik from "@/assets/menu/medovik.jpg";
import milliyLagmon from "@/assets/menu/milliy-lagmon.jpg";
import mineralSuv from "@/assets/menu/mineral-suv.jpg";
import mojito from "@/assets/menu/mojito.jpg";
import morkovcha from "@/assets/menu/morkovcha.jpg";
import namanganOshi from "@/assets/menu/namangan-oshi.jpg";
import napoleon from "@/assets/menu/napoleon.jpg";
import nonYarimta from "@/assets/menu/non-yarimta.jpg";
import oliviya from "@/assets/menu/oliviya.jpg";
import patir from "@/assets/menu/patir.jpg";
import paxlava from "@/assets/menu/paxlava.jpg";
import perashki from "@/assets/menu/perashki.jpg";
import qanotShashlik from "@/assets/menu/qanot-shashlik.jpg";
import qatiqBottle from "@/assets/menu/qatiq-bottle.jpg";
import qatiqStakan from "@/assets/menu/qatiq-stakan.jpg";
import qiymaShashlik from "@/assets/menu/qiyma-shashlik.jpg";
import qovurdoq from "@/assets/menu/qovurdoq.jpg";
import qovurmaLagmon from "@/assets/menu/qovurma-lagmon.jpg";
import qoyOyoqShorva from "@/assets/menu/qoy-oyoq-shorva.jpg";
import qozonKabob from "@/assets/menu/qozon-kabob.jpg";
import qurtoba from "@/assets/menu/qurtoba.jpg";
import salyonniyAssorti from "@/assets/menu/salyonniy-assorti.jpg";
import shokoladliTort from "@/assets/menu/shokoladli-tort.jpg";
import shorva from "@/assets/menu/shorva.jpg";
import sutliChoy from "@/assets/menu/sutli-choy.jpg";
import tandirNon from "@/assets/menu/tandir-non.jpg";
import tandirSomsaMol from "@/assets/menu/tandir-somsa-mol.jpg";
import tandirSomsaTovuq from "@/assets/menu/tandir-somsa-tovuq.jpg";
import tovuqKabob from "@/assets/menu/tovuq-kabob.jpg";
import toyOshi from "@/assets/menu/toy-oshi.jpg";
import tuzlanganBodring from "@/assets/menu/tuzlangan-bodring.jpg";
import uygurLagmon from "@/assets/menu/uygur-lagmon.jpg";
import xurmoFresh from "@/assets/menu/xurmo-fresh.jpg";
import yangiSalat from "@/assets/menu/yangi-salat.jpg";

export type PhotoCredit = { author: string; license: string; source: string };
export type Photo = { src: StaticImageData; credit?: PhotoCredit };

/**
 * Dish photos (static imports: a missing file fails the build instead of
 * showing a broken image, and Next.js generates blur placeholders and serves
 * AVIF/WebP in the sizes each screen needs).
 *
 * Use your own photo: replace the file in src/assets/menu/ with the same name
 * (4:3, at least 1200×900 looks best) and delete its `credit`.
 * Add a photo to a new dish: import it here, then set `photo` in menu.ts.
 *
 * The current images are openly licensed photos from Wikimedia Commons and
 * Flickr — not photos of this restaurant's own dishes (some show a close
 * relative of the dish, e.g. tortellini in broth for chuchvara) — cropped and
 * resized; their credits are shown on the Info screen, as the licenses require.
 */
export const photos = {
  achchiqChuchuk: {
    src: achchiqChuchuk,
    credit: { author: "Shuhrataxmedov", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:%27Achchiq-chuchuk%27_-_uzbek_salad.jpg" },
  },
  achchiqGosht: {
    src: achchiqGosht,
    credit: { author: "PattayaPatrol", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:DFC_6132_Crispy_spicy_stir-fried_beef_with_fresh_basil_and_chili_-_a_savory_Thai_favorite_from_Sattahip.jpg" },
  },
  anorFresh: {
    src: anorFresh,
    credit: { author: "Augustus Binu", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Pomegranate_Juice_(2019).jpg" },
  },
  assortiKabob: {
    src: assortiKabob,
    credit: { author: "BeshevI", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:14T_20240408_20.jpg" },
  },
  ayron: {
    src: ayron,
    credit: { author: "tomislavmedak", license: "CC BY 2.0", source: "https://www.flickr.com/photos/11932978@N00/4986050208" },
  },
  bFresh: {
    src: bFresh,
    credit: { author: "Contrapunctus-1", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Mango_juice_at_Agasi,_Lajpat_Nagar,_Delhi_(2025-10-04).jpg" },
  },
  beshbarmoq: {
    src: beshbarmoq,
    credit: { author: "NataAllice", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:%D0%91%D0%B5%D1%88%D0%B1%D0%B0%D1%80%D0%BC%D0%B0%D0%BA_-_%D0%BA%D0%B0%D0%B7%D0%B0%D1%85%D1%81%D0%BA%D0%BE%D0%B5_%D0%BD%D0%B0%D1%86%D0%B8%D0%BE%D0%BD%D0%B0%D0%BB%D1%8C%D0%BD%D0%BE%D0%B5_%D0%B1%D0%BB%D1%8E%D0%B4%D0%BE.jpg" },
  },
  bifshteksTabaka: {
    src: bifshteksTabaka,
    credit: { author: "Davidwbaker", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Steak_Frites_with_Bordelaise,_July_2020.jpg" },
  },
  borjomi: {
    src: borjomi,
    credit: { author: "Ninuca1212", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:0.5_GL_Borjomi_Glass_Bottle.jpg" },
  },
  cheburek: {
    src: cheburek,
    credit: { author: "N509FZ", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Chebureki_at_Pushkin_Literature_Restaurant,_Zhong_Guan_Cun_No.1_(20210714185521).jpg" },
  },
  chortoq: {
    src: chortoq,
    credit: { author: "Tony Webster", license: "CC BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Sparkling_Water_with_Mint_in_Glass_Cup.jpg" },
  },
  choy: {
    src: choy,
    credit: { author: "Marntzu cook", license: "CC BY 2.0", source: "https://www.flickr.com/photos/69701588@N05/8189272425" },
  },
  chuchvara: {
    src: chuchvara,
    credit: { author: "Marica Massaro", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Tortellini_nel_brodo.jpg" },
  },
  dolma: {
    src: dolma,
    credit: { author: "Irada", license: "CC BY 3.0", source: "https://commons.wikimedia.org/wiki/File:Azerbaijani_dolma_pepper_tomato.jpg" },
  },
  duxovkaSomsaMol: {
    src: duxovkaSomsaMol,
    credit: { author: "Ji-Elle", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Ouzb%C3%A9kistan-Samsas.jpg" },
  },
  duxovkaSomsaTovuq: {
    src: duxovkaSomsaTovuq,
    credit: { author: "Mizu basyo", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Uyghur_samsa.jpg" },
  },
  flavis: {
    src: flavis,
    credit: { author: "Ubcule", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Raspberryade.jpg" },
  },
  gazliIchimlik: {
    src: gazliIchimlik,
    credit: { author: "pic_p_ter", license: "Public domain", source: "https://commons.wikimedia.org/wiki/File:Glass_cola.jpg" },
  },
  jiz: {
    src: jiz,
    credit: { author: "E4024", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Kavurma_(lamb).jpg" },
  },
  kartoshkaFri: {
    src: kartoshkaFri,
    credit: { author: "Tony Webster", license: "CC BY-SA 2.0", source: "https://commons.wikimedia.org/wiki/File:Truffle_oil_french_fries_(33024792848).jpg" },
  },
  kompot: {
    src: kompot,
    credit: { author: "Abraham", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:20221204_kompot.jpg" },
  },
  kuskavoyShashlik: {
    src: kuskavoyShashlik,
    credit: { author: "N509FZ", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Lamb_kebabs_on_grill_at_Ancient_City_of_Kashi_(20230923224509).jpg" },
  },
  laganOsh: {
    src: laganOsh,
    credit: { author: "BeshevI", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:14T_20240407_19.jpg" },
  },
  limonChoy: {
    src: limonChoy,
    credit: { author: "mincus", license: "CC BY-SA 2.0", source: "https://www.flickr.com/photos/79708992@N00/25328076" },
  },
  manti: {
    src: manti,
    credit: { author: "Sterilgutassistentin", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Manti_20100213_011.JPG" },
  },
  mastava: {
    src: mastava,
    credit: { author: "Olexdj", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:%D0%A1%D1%83%D0%BF_%D0%9C%D0%B0%D1%81%D1%82%D0%B0%D0%B2%D0%B0.jpg" },
  },
  medovik: {
    src: medovik,
    credit: { author: "Wotancito", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Pastel_ruso_de_miel.JPG" },
  },
  milliyLagmon: {
    src: milliyLagmon,
    credit: { author: "赤猫法師", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Uzbek_lagman.jpg" },
  },
  mineralSuv: {
    src: mineralSuv,
    credit: { author: "Derek Jensen (Tysto)", license: "Public domain", source: "https://commons.wikimedia.org/wiki/File:Glass-of-water.jpg" },
  },
  mojito: {
    src: mojito,
    credit: { author: "Alkemieug", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:MelissA_Mojito.jpg" },
  },
  morkovcha: {
    src: morkovcha,
    credit: { author: "Off-shell", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Korean-style_carrot_5.jpg" },
  },
  namanganOshi: {
    src: namanganOshi,
    credit: { author: "Mizu basyo", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Polu.jpg" },
  },
  napoleon: {
    src: napoleon,
    credit: { author: "Bin im Garten", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Mille-feuille_009.JPG" },
  },
  nonYarimta: {
    src: nonYarimta,
    credit: { author: "Sinchalak Musulmon", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Bread_in_Uzbek_kitchen.jpg" },
  },
  oliviya: {
    src: oliviya,
    credit: { author: "Carlosdisogra", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Ensalada_rusa_argentina.JPG" },
  },
  patir: {
    src: patir,
    credit: { author: "Shuhrataxmedov", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:%D0%9F%D0%B0%D1%82%D0%B8%D1%80-%D0%BD%D0%BE%D0%BD-01.jpg" },
  },
  paxlava: {
    src: paxlava,
    credit: { author: "Valentina Dyptan", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Baklava._Azerbaijan.jpg" },
  },
  perashki: {
    src: perashki,
    credit: { author: "Pannet", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:%D0%9F%D0%B8%D1%80%D0%BE%D0%B6%D0%BA%D0%B8_03.jpg" },
  },
  qanotShashlik: {
    src: qanotShashlik,
    credit: { author: "Augapfel", license: "CC BY 2.0", source: "https://www.flickr.com/photos/47038415@N00/296424771" },
  },
  qatiqBottle: {
    src: qatiqBottle,
    credit: { author: "Consell Comarcal del Baix Empordà", license: "CC BY-SA 2.0", source: "https://commons.wikimedia.org/wiki/File:Producte_L%C3%A0ctics_1.jpg" },
  },
  qatiqStakan: {
    src: qatiqStakan,
    credit: { author: "Consell Comarcal del Baix Empordà", license: "CC BY-SA 2.0", source: "https://commons.wikimedia.org/wiki/File:Producte_L%C3%A0ctics_1.jpg" },
  },
  qiymaShashlik: {
    src: qiymaShashlik,
    credit: { author: "Chaojoker", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:%D5%84%D5%BD%D5%AB_%D6%84%D5%A1%D5%A2%D5%A1%D5%A2.JPG" },
  },
  qovurdoq: {
    src: qovurdoq,
    credit: { author: "E4024", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Kavurma_(close_up).jpg" },
  },
  qovurmaLagmon: {
    src: qovurmaLagmon,
    credit: { author: "Orderinchaos", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Dolan_Uyghur_handmade_noodles_Adelaide.jpg" },
  },
  qoyOyoqShorva: {
    src: qoyOyoqShorva,
    credit: { author: "Benreis", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Kelle_pa%C3%A7a_Hof.jpg" },
  },
  qozonKabob: {
    src: qozonKabob,
    credit: { author: "Mike Cowlishaw", license: "CC BY 3.0", source: "https://commons.wikimedia.org/wiki/File:Chuletillas-El-Mazuco.jpg" },
  },
  qurtoba: {
    src: qurtoba,
    credit: { author: "Schokifaktor", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Qurutob_-_Nationalgericht_Tadschikistan.jpg" },
  },
  salyonniyAssorti: {
    src: salyonniyAssorti,
    credit: { author: "Raimond Spekking", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Mixed_Pickles_(9370-72).jpg" },
  },
  shokoladliTort: {
    src: shokoladliTort,
    credit: { author: "Kskhh", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Brown_Chocolate_Cake.jpg" },
  },
  shorva: {
    src: shorva,
    credit: { author: "Daderot", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:Vegetable_beef_soup_-_Arlington,_MA.jpg" },
  },
  sutliChoy: {
    src: sutliChoy,
    credit: { author: "Gaurav Dhwaj Khadka", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Milk_Tea_3.jpg" },
  },
  tandirNon: {
    src: tandirNon,
    credit: { author: "Benjamin Goetzinger", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Uzbek_bread,_obi_non,_lepyoshka.jpg" },
  },
  tandirSomsaMol: {
    src: tandirSomsaMol,
    credit: { author: "N509FZ", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Samsa_at_G%C3%BClhan_Restaurant,_Beijing_(20210402171539).jpg" },
  },
  tandirSomsaTovuq: {
    src: tandirSomsaTovuq,
    credit: { author: "Xkmvch", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:Somsa_1.jpg" },
  },
  tovuqKabob: {
    src: tovuqKabob,
    credit: { author: "Garrett Ziegler", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Tavuk_%C5%9Ei%C5%9F.jpg" },
  },
  toyOshi: {
    src: toyOshi,
    credit: { author: "Bestalex", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:%D0%9F%D0%BB%D0%BE%D0%B2_%D0%BD%D0%B0_%D1%80%D1%8B%D0%BD%D0%BA%D0%B5_%D0%9A%D1%83%D0%B9%D0%BB%D1%8E%D0%BA_%D0%B2_%D0%A2%D0%B0%D1%88%D0%BA%D0%B5%D0%BD%D1%82%D0%B5,_2026-05-03.jpg" },
  },
  tuzlanganBodring: {
    src: tuzlanganBodring,
    credit: { author: "Horacio Cambeiro", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Whole_pickled_cucumbers_in_a_glass_bowl.jpg" },
  },
  uygurLagmon: {
    src: uygurLagmon,
    credit: { author: "К.Артём.1", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Laghman,_Novosibirsk_01.jpg" },
  },
  xurmoFresh: {
    src: xurmoFresh,
    credit: { author: "U.S. Department of Agriculture", license: "Public domain", source: "https://commons.wikimedia.org/wiki/File:Orange_juice_1_edit1.jpg" },
  },
  yangiSalat: {
    src: yangiSalat,
    credit: { author: "slightly everything", license: "CC BY 2.0", source: "https://www.flickr.com/photos/51633081@N04/7685364860" },
  },
} satisfies Record<string, Photo>;
