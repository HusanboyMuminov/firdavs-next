import type { StaticImageData } from "next/image";
import non from "@/assets/gallery/non.jpg";
import palov from "@/assets/gallery/palov.jpg";
import somsa from "@/assets/gallery/somsa.jpg";
import tovuq from "@/assets/gallery/tovuq.jpg";
import { photos } from "./photos";

/**
 * Gallery screen: the restaurant's own photos (and videos). To add a video, put
 * the file in public/gallery/ and add { kind: "video", src: "/gallery/name.mp4", caption }.
 */
export type GalleryItem =
  | { kind: "photo"; src: StaticImageData; caption: string }
  | { kind: "video"; src: string; poster?: string; caption: string };

export const gallery: GalleryItem[] = [
  { kind: "photo", src: palov, caption: "Palov" },
  { kind: "photo", src: somsa, caption: "Somsa" },
  { kind: "photo", src: non, caption: "Tandir non" },
  { kind: "photo", src: tovuq, caption: "Qarsildoq tovuq" },
  { kind: "photo", src: photos.qozonKabob.src, caption: "Qozon kabob" },
  { kind: "photo", src: photos.tabaka.src, caption: "Tabaka" },
  { kind: "photo", src: photos.bifshteks.src, caption: "Bifshteks" },
  { kind: "photo", src: photos.shorva.src, caption: "Shoʻrva" },
  { kind: "photo", src: photos.ilikShorva.src, caption: "Ilik shoʻrva" },
  { kind: "photo", src: photos.xonim.src, caption: "Xonim" },
  { kind: "photo", src: photos.qovurdoq.src, caption: "Qovurdoq" },
];
