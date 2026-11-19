"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type TouchEvent } from "react";
import { gallery } from "@/data/gallery";
import { isOverlayEntry, pushOverlay } from "@/lib/history";
import { useApp } from "./AppContext";
import { ArrowIcon, CloseIcon, PlayIcon } from "./icons";
import styles from "./GalleryView.module.css";

/** Photos and videos of the restaurant: a grid, and a full-screen viewer on tap. */
export function GalleryView() {
  const { t } = useApp();
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const item = index === null ? null : gallery[index];

  // Mirror the open state onto the native <dialog>.
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (index !== null && !el.open) el.showModal();
    else if (index === null && el.open) el.close();
  }, [index]);

  // The viewer has its own history entry: the phone's Back button (and Escape) close it.
  useEffect(() => {
    const el = dialogRef.current;
    const onPop = () => {
      if (!isOverlayEntry()) setIndex(null);
    };
    const onCancel = (e: Event) => {
      e.preventDefault();
      if (isOverlayEntry()) window.history.back();
      else setIndex(null);
    };
    window.addEventListener("popstate", onPop);
    el?.addEventListener("cancel", onCancel);
    return () => {
      window.removeEventListener("popstate", onPop);
      el?.removeEventListener("cancel", onCancel);
    };
  }, []);

  const open = (i: number) => {
    pushOverlay();
    setIndex(i);
  };
  const close = () => {
    if (isOverlayEntry()) window.history.back();
    else setIndex(null);
  };
  const step = (delta: number) =>
    setIndex((i) => (i === null ? i : (i + delta + gallery.length) % gallery.length));

  const onTouchEnd = (e: TouchEvent) => {
    const start = touchX.current;
    touchX.current = null;
    if (start === null || item?.kind !== "photo") return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  };

  return (
    <div className={styles.gallery}>
      <ul className={styles.grid}>
        {gallery.map((g, i) => (
          <li key={i}>
            <button type="button" className={styles.tile} onClick={() => open(i)} aria-label={g.caption}>
              {g.kind === "photo" ? (
                <Image
                  src={g.src}
                  alt=""
                  placeholder="blur"
                  sizes="(max-width: 520px) 50vw, 180px"
                  className={styles.thumb}
                />
              ) : (
                <>
                  <video src={`${g.src}#t=0.1`} poster={g.poster} muted playsInline preload="metadata" className={styles.thumb} />
                  <span className={styles.play} aria-hidden="true">
                    <PlayIcon size={22} />
                  </span>
                </>
              )}
              <span className={styles.label}>{g.caption}</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className={styles.viewer}
        aria-label={item?.caption}
        onClick={(e) => {
          if (e.target === e.currentTarget) close(); // tap outside the photo
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          else if (e.key === "ArrowLeft") step(-1);
        }}
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={onTouchEnd}
      >
        {item && index !== null && (
          <>
            <figure className={styles.stage} onClick={(e) => e.target === e.currentTarget && close()}>
              {item.kind === "photo" ? (
                <Image key={index} src={item.src} alt={item.caption} sizes="100vw" className={styles.full} />
              ) : (
                <video key={index} src={item.src} poster={item.poster} controls autoPlay playsInline className={styles.full} />
              )}
              <figcaption className={styles.caption}>
                {item.caption} · {index + 1} / {gallery.length}
              </figcaption>
            </figure>
            <button type="button" className={styles.close} onClick={close} aria-label={t.close}>
              <CloseIcon size={22} />
            </button>
            {gallery.length > 1 && (
              <>
                <button type="button" className={styles.prev} onClick={() => step(-1)} aria-label={t.gallery.prev}>
                  <ArrowIcon size={22} />
                </button>
                <button type="button" className={styles.next} onClick={() => step(1)} aria-label={t.gallery.next}>
                  <ArrowIcon size={22} />
                </button>
              </>
            )}
          </>
        )}
      </dialog>
    </div>
  );
}
