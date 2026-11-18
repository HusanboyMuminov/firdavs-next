"use client";

import Image from "next/image";
import { useState } from "react";
import type { Photo } from "@/data/photos";
import { StarMark } from "./Ornament";
import styles from "./DishImage.module.css";

type Props = {
  photo?: Photo;
  /** Empty string when the image is decorative (name is already in the text). */
  alt: string;
  sizes: string;
  eager?: boolean;
  highPriority?: boolean;
  className?: string;
};

/**
 * Dish photo with a graceful fallback: dishes without a photo — or a photo
 * that fails to load — show a branded ornament instead of a broken image.
 */
export function DishImage({
  photo,
  alt,
  sizes,
  eager,
  highPriority,
  className,
}: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showPhoto = photo !== undefined && failedSrc !== photo.src.src;

  return (
    <div className={className ? `${styles.frame} ${className}` : styles.frame}>
      {showPhoto ? (
        <Image
          src={photo.src}
          alt={alt}
          fill
          sizes={sizes}
          placeholder="blur"
          loading={eager ? "eager" : "lazy"}
          fetchPriority={highPriority ? "high" : undefined}
          className={styles.img}
          onError={() => setFailedSrc(photo.src.src)}
        />
      ) : (
        <div
          className={styles.placeholder}
          role={alt ? "img" : undefined}
          aria-label={alt || undefined}
          aria-hidden={alt ? undefined : true}
        >
          <StarMark className={styles.placeholderStar} />
        </div>
      )}
    </div>
  );
}
