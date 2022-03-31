import React from "react";
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

const Home: NextPage<HomeProps> = (props: HomeProps) => {
  const { sections } = props;

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
        <NavBar username="Richi" />
        <Banner
          title="Harry Potter"
          subTitle="You're a wizard Harry!"
          imgUrl="/static/harry-potter.webp"
        />
        <div className={styles.sectionWrapper}>
          {sections.length > 0 &&
            sections.map((section, index) => {
              return <CardsSection
                key={index}
                title={section.title}
                cardSize={section.cardSize}
                cardList={section.cardList}
              />;
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
