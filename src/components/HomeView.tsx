"use client";

import { categories, dishes, dishesByCategory, type Dish } from "@/data/menu";
import { contactUrls, mapUrls, restaurant } from "@/data/restaurant";
import { formatPrice } from "@/lib/format";
import { isPlainClick, useApp } from "./AppContext";
import { AddToCartButton } from "./Cart";
import { FavoriteButton, otherNames } from "./DishCard";
import { DishImage } from "./DishImage";
import { ArrowIcon, PhoneIcon, PinIcon, ScooterIcon } from "./icons";
import { OpenStatus } from "./OpenStatus";
import { MenuFooter, SectionHeading } from "./Sections";
import styles from "./HomeView.module.css";

const featuredDishes = dishes.filter((d) => d.tags?.includes("featured"));

export function HomeView() {
  const { t, lang, href, goTo } = useApp();

  return (
    <div className={styles.home}>
      <section className={styles.section} aria-labelledby="home-menu">
        <SectionHeading
          id="home-menu"
          title={t.nav.menu}
          action={
            <a
              href={href("menu")}
              className={styles.viewAll}
              onClick={(e) => {
                if (!isPlainClick(e)) return;
                e.preventDefault();
                goTo("menu");
              }}
            >
              {t.viewAll}
              <ArrowIcon size={16} />
            </a>
          }
        />
        <ul className={styles.tiles}>
          {categories.map((c, i) => {
            const wide = i === categories.length - 1 && categories.length % 2 === 1; // spans the row
            return (
              <li key={c.id}>
                <a
                  href={href("menu", c.id)}
                  className={styles.tile}
                  onClick={(e) => {
                    if (!isPlainClick(e)) return;
                    e.preventDefault();
                    goTo("menu", c.id);
                  }}
                >
                  <DishImage
                    photo={c.cover}
                    alt=""
                    sizes={wide ? "(max-width: 520px) 92vw, 480px" : "(max-width: 520px) 46vw, 240px"}
                    eager={i < 4}
                    highPriority={i < 2}
                    className={styles.tileImage}
                  />
                  <span className={styles.tileText}>
                    <span className={styles.tileName}>{c.label[lang]}</span>
                    <span className={styles.tileCount}>{t.dishCount(dishesByCategory.get(c.id)?.length ?? 0)}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="home-featured">
        <SectionHeading id="home-featured" title={t.featured} />
        <ul className={styles.carousel}>
          {featuredDishes.map((dish) => (
            <li key={dish.id} className={styles.slide}>
              <SignatureCard dish={dish} />
            </li>
          ))}
        </ul>
      </section>

      <InfoTeaser />
      <MenuFooter />
    </div>
  );
}

function SignatureCard({ dish }: { dish: Dish }) {
  const { lang, dishHref, openDish } = useApp();
  const [second, third] = otherNames(lang);
  return (
    <article className={styles.sig}>
      <div className={styles.sigMedia}>
        <DishImage photo={dish.photo} alt="" sizes="(max-width: 520px) 70vw, 300px" className={styles.sigImage} />
        <span className={styles.sigAdd}>
          <AddToCartButton dishId={dish.id} variant="icon" />
        </span>
      </div>
      <div className={styles.sigBody}>
        <h3 className={styles.sigName} lang="uz">
          <a
            href={dishHref(dish.id)}
            className={styles.sigLink}
            onClick={(e) => {
              if (!isPlainClick(e)) return;
              e.preventDefault();
              openDish(dish.id);
            }}
          >
            {dish.name.uz}
          </a>
        </h3>
        <p className={styles.sigAlt} lang={second}>
          {dish.name[second]}
        </p>
        <p className={styles.sigAlt3} lang={third}>
          {dish.name[third]}
        </p>
        {dish.price !== null && <p className={styles.sigPrice}>{formatPrice(dish.price)}</p>}
      </div>
      <FavoriteButton dishId={dish.id} className={styles.sigFav} />
    </article>
  );
}

function InfoTeaser() {
  const { t, lang, href, goTo } = useApp();
  const maps = mapUrls();
  return (
    <section className={styles.teaser} aria-label={t.info.title}>
      {restaurant.hours && (
        <div className={styles.teaserTop}>
          <OpenStatus tone="light" />
        </div>
      )}
      <p className={styles.teaserRow}>
        <PinIcon size={18} />
        <span>{restaurant.address[lang]}</span>
      </p>
      {restaurant.delivery && (
        <p className={styles.teaserRow}>
          <ScooterIcon size={18} />
          <span>{t.info.deliveryNote}</span>
        </p>
      )}
      <div className={styles.teaserActions}>
        <a href={contactUrls().call} className={styles.primaryBtn}>
          <PhoneIcon size={18} />
          {t.info.call}
        </a>
        <a href={maps.naver} target="_blank" rel="noopener noreferrer" className={styles.secondaryBtn}>
          <PinIcon size={18} />
          {t.info.maps}
        </a>
      </div>
      <a
        href={href("info")}
        className={styles.teaserMore}
        onClick={(e) => {
          if (!isPlainClick(e)) return;
          e.preventDefault();
          goTo("info");
        }}
      >
        {t.moreInfo}
        <ArrowIcon size={16} />
      </a>
    </section>
  );
}
