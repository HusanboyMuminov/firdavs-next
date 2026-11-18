import type { StaticImageData } from "next/image";

import achchiqChuchuk from "@/assets/menu/achchiq-chuchuk.jpg";
import assortiKabob from "@/assets/menu/assorti-kabob.jpg";
import ayron from "@/assets/menu/ayron.jpg";
import cheburek from "@/assets/menu/cheburek.jpg";
import choy from "@/assets/menu/choy.jpg";
import chuchvara from "@/assets/menu/chuchvara.jpg";
import dolma from "@/assets/menu/dolma.jpg";
import duxovkaSomsaMol from "@/assets/menu/duxovka-somsa-mol.jpg";
import duxovkaSomsaTovuq from "@/assets/menu/duxovka-somsa-tovuq.jpg";
import fargonaOshi from "@/assets/menu/fargona-oshi.jpg";
import gazliIchimlik from "@/assets/menu/gazli-ichimlik.jpg";
import ilikShorva from "@/assets/menu/ilk-shorva.jpg";
import kompot from "@/assets/menu/kompot.jpg";
import kuskavoyShashlik from "@/assets/menu/kuskavoy-shashlik.jpg";
import laganOsh from "@/assets/menu/lagan-osh.jpg";
import lulaKabob from "@/assets/menu/lula-kabob.jpg";
import manti from "@/assets/menu/manti.jpg";
import mastava from "@/assets/menu/mastava.jpg";
import medovik from "@/assets/menu/medovik.jpg";
import mineralSuv from "@/assets/menu/mineral-suv.jpg";
import morkovcha from "@/assets/menu/morkovcha.jpg";
import napoleon from "@/assets/menu/napoleon.jpg";
import patir from "@/assets/menu/patir.jpg";
import paxlava from "@/assets/menu/paxlava.jpg";
import perashki from "@/assets/menu/perashki.jpg";
import qanotShashlik from "@/assets/menu/qanot-shashlik.jpg";
import qiymaShashlik from "@/assets/menu/qiyma-shashlik.jpg";
import qovurmaLagmon from "@/assets/menu/qovurma-lagmon.jpg";
import qoyKabob from "@/assets/menu/qoy-kabob.jpg";
import qozonKabob from "@/assets/menu/qozon-kabob.jpg";
import shokoladliTort from "@/assets/menu/shokoladli-tort.jpg";
import shorva from "@/assets/menu/shorva.jpg";
import suyuqLagmon from "@/assets/menu/suyuq-lagmon.jpg";
import tandirNon from "@/assets/menu/tandir-non.jpg";
import tandirSomsaMol from "@/assets/menu/tandir-somsa-mol.jpg";
import tandirSomsaTovuq from "@/assets/menu/tandir-somsa-tovuq.jpg";
import tovuqKabob from "@/assets/menu/tovuq-kabob.jpg";
import toyOshi from "@/assets/menu/toy-oshi.jpg";
import uygurLagmon from "@/assets/menu/uygur-lagmon.jpg";
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
 * Flickr (not photos of this restaurant's own dishes), cropped and resized;
 * their credits are shown on the Info screen, as the licenses require.
 */
export const photos = {
  achchiqChuchuk: {
    src: achchiqChuchuk,
    credit: { author: "Shuhrataxmedov", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:%27Achchiq-chuchuk%27_-_uzbek_salad.jpg" },
  },
  assortiKabob: {
    src: assortiKabob,
    credit: { author: "BeshevI", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:14T_20240408_20.jpg" },
  },
  ayron: {
    src: ayron,
    credit: { author: "tomislavmedak", license: "CC BY 2.0", source: "https://www.flickr.com/photos/11932978@N00/4986050208" },
  },
  cheburek: {
    src: cheburek,
    credit: { author: "N509FZ", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Chebureki_at_Pushkin_Literature_Restaurant,_Zhong_Guan_Cun_No.1_(20210714185521).jpg" },
  },
  choy: {
    src: choy,
    credit: { author: "Marntzu cook", license: "CC BY 2.0", source: "https://www.flickr.com/photos/69701588@N05/8189272425" },
  },
  chuchvara: {
    src: chuchvara,
    credit: { author: "C980040", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Dushbara_in_broth.jpg" },
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
  fargonaOshi: {
    src: fargonaOshi,
    credit: { author: "Postovalov", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Plov_with_lamb_and_carrots_in_ceramic_bowl.jpg" },
  },
  gazliIchimlik: {
    src: gazliIchimlik,
    credit: { author: "pic_p_ter", license: "Public domain", source: "https://commons.wikimedia.org/wiki/File:Glass_cola.jpg" },
  },
  ilikShorva: {
    src: ilikShorva,
    credit: { author: "Nikolai Bulykin", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:%D0%A1%D0%B0%D0%BC%D0%B0%D1%80%D0%BA%D0%B0%D0%BD%D0%B4,_%D1%81%D0%BE%D1%80%D0%BF%D0%B0_%D0%B2_%D1%83%D0%BB%D0%B8%D1%87%D0%BD%D0%BE%D0%BC_%D0%BA%D0%B0%D1%84%D0%B5.jpg" },
  },
  kompot: {
    src: kompot,
    credit: { author: "Abraham", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:20221204_kompot.jpg" },
  },
  kuskavoyShashlik: {
    src: kuskavoyShashlik,
    credit: { author: "Mateus2019", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:GER_%E2%80%94_BY_%E2%80%94_Oberbayern_%E2%80%94_M%C3%BCnchen_%E2%80%94_Obergiesing_%E2%80%94_St.-Martin-Stra%C3%9Fe_38_(Lammspiess)_2020.jpg" },
  },
  laganOsh: {
    src: laganOsh,
    credit: { author: "BeshevI", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:14T_20240407_19.jpg" },
  },
  lulaKabob: {
    src: lulaKabob,
    credit: { author: "Lesya Dolyk", license: "CC BY-SA 2.0", source: "https://commons.wikimedia.org/wiki/File:Lula_kebab.jpg" },
  },
  manti: {
    src: manti,
    credit: { author: "Ji-Elle", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Ouzb%C3%A9kistan-Ravioli_(1).jpg" },
  },
  mastava: {
    src: mastava,
    credit: { author: "Olexdj", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:%D0%A1%D1%83%D0%BF_%D0%9C%D0%B0%D1%81%D1%82%D0%B0%D0%B2%D0%B0.jpg" },
  },
  medovik: {
    src: medovik,
    credit: { author: "Wotancito", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Pastel_ruso_de_miel.JPG" },
  },
  mineralSuv: {
    src: mineralSuv,
    credit: { author: "Derek Jensen (Tysto)", license: "Public domain", source: "https://commons.wikimedia.org/wiki/File:Glass-of-water.jpg" },
  },
  morkovcha: {
    src: morkovcha,
    credit: { author: "Off-shell", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Korean-style_carrot_5.jpg" },
  },
  napoleon: {
    src: napoleon,
    credit: { author: "Bin im Garten", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Mille-feuille_009.JPG" },
  },
  patir: {
    src: patir,
    credit: { author: "BeshevI", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:11T_20240408_202006.jpg" },
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
  qiymaShashlik: {
    src: qiymaShashlik,
    credit: { author: "Chaojoker", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:%D5%84%D5%BD%D5%AB_%D6%84%D5%A1%D5%A2%D5%A1%D5%A2.JPG" },
  },
  qovurmaLagmon: {
    src: qovurmaLagmon,
    credit: { author: "Orderinchaos", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Dolan_Uyghur_handmade_noodles_Adelaide.jpg" },
  },
  qoyKabob: {
    src: qoyKabob,
    credit: { author: "Muharramxon", license: "CC BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Shashlik-national_food_of_Uzbekistan.jpg" },
  },
  qozonKabob: {
    src: qozonKabob,
    credit: { author: "Shuhrataxmedov", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Qozon_kabob_(Uzbek_national_cuisine).jpg" },
  },
  shokoladliTort: {
    src: shokoladliTort,
    credit: { author: "Daria Yakovleva", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:Piece_of_chocolate_cake_on_a_white_plate_decorated_with_chocolate_sauce.jpg" },
  },
  shorva: {
    src: shorva,
    credit: { author: "Pannet", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:%D0%A8%D1%83%D1%80%D0%BF%D0%B0.jpg" },
  },
  suyuqLagmon: {
    src: suyuqLagmon,
    credit: { author: "赤猫法師", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Uzbek_lagman.jpg" },
  },
  tandirNon: {
    src: tandirNon,
    credit: { author: "Benjamin Goetzinger", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Uzbek_bread,_obi_non,_lepyoshka.jpg" },
  },
  tandirSomsaMol: {
    src: tandirSomsaMol,
    credit: { author: "N509FZ", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Samsas_at_G%C3%BClhan_Restaurant,_Beijing_(20210402171423).jpg" },
  },
  tandirSomsaTovuq: {
    src: tandirSomsaTovuq,
    credit: { author: "Fumikas Sagisavas", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:Mutton_samsa.jpg" },
  },
  tovuqKabob: {
    src: tovuqKabob,
    credit: { author: "Garrett Ziegler", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Tavuk_%C5%9Ei%C5%9F.jpg" },
  },
  toyOshi: {
    src: toyOshi,
    credit: { author: "Bestalex", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:%D0%9F%D0%BB%D0%BE%D0%B2_%D0%BD%D0%B0_%D1%80%D1%8B%D0%BD%D0%BA%D0%B5_%D0%9A%D1%83%D0%B9%D0%BB%D1%8E%D0%BA_%D0%B2_%D0%A2%D0%B0%D1%88%D0%BA%D0%B5%D0%BD%D1%82%D0%B5,_2026-05-03.jpg" },
  },
  uygurLagmon: {
    src: uygurLagmon,
    credit: { author: "Mizu basyo", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Uyghur_Lagman.jpg" },
  },
  yangiSalat: {
    src: yangiSalat,
    credit: { author: "slightly everything", license: "CC BY 2.0", source: "https://www.flickr.com/photos/51633081@N04/7685364860" },
  },
} satisfies Record<string, Photo>;
