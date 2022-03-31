import React, { useEffect, useRef, useState } from "react";
import type { GetStaticPropsResult, NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Banner from "../components/banner";
import NavBar from "../components/navbar";
import CardsSection, { CardsSectionProps } from "../components/cardsSection";
import { CardSizeEnum } from "../components/card";

type HomeProps = {
  sections: CardsSectionProps[];
};

export const getStaticProps = async (): Promise<
  GetStaticPropsResult<HomeProps>
> => {
  return {
    props: {
      sections: [
        {
          title: "Disney",
          cardSize: CardSizeEnum.large,
          cardList: Array(15).fill({
            imgUrl: "/static/defaultImage.webp",
          }),
        },
        {
          title: "Disney",
          cardSize: CardSizeEnum.small,
          cardList: Array(15).fill({
            imgUrl: "/static/defaultImage.webp",
          }),
        },
        {
          title: "Disney",
          cardSize: CardSizeEnum.medium,
          cardList: Array(15).fill({
            imgUrl: "/static/defaultImage.webp",
          }),
        },
      ],
    },
  };
};

const scrollOptions = {
  root: null,
  threshold: [0, 1],
};

const Home: NextPage<HomeProps> = (props: HomeProps) => {
  const { sections } = props;
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  const bannerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entry) => {
      console.log({ entry });
      console.log("entry.isIntersecting", entry[0].isIntersecting);
      const { isIntersecting } = entry[0];

      if (isIntersecting !== isBannerVisible)
        setIsBannerVisible(isIntersecting);
    }, scrollOptions);
    const currentRef = bannerRef.current;
    console.log("sectionsRef.current", bannerRef.current);
    if (currentRef) observer.observe(currentRef as Element);
    console.log("observing...");

    return () => {
      console.log("unobserving...");
      if (currentRef) observer.unobserve(currentRef as Element);
    };
  });

  return (
    <div className={styles.container}>
      <Head>
        <title>NextJSflix</title>
        <meta
          name="description"
          content="Netflix clone to consume Youtube videos"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <NavBar username="Richi" gradient={isBannerVisible} />
        <Banner
          title="Harry Potter"
          subTitle="You're a wizard Harry!"
          imgUrl="/static/harry-potter.webp"
          ref={bannerRef}
        />
        <div className={styles.sectionWrapper}>
          {sections.length > 0 &&
            sections.map((section, index) => {
              return (
                <CardsSection
                  key={index}
                  title={section.title}
                  cardSize={section.cardSize}
                  cardList={section.cardList}
                />
              );
            })}
          {/* 
          <CardsSection
            title="Disney"
            cardSize={CardSizeEnum.small}
            cardList={videos}
          />
          <CardsSection
            title="Disney"
            cardSize={CardSizeEnum.medium}
            cardList={videos}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default Home;
