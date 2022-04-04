import React, { useEffect, useRef, useState } from "react";
import type { GetServerSidePropsResult, NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Banner from "../components/Banner";
import Navbar from "../components/Navbar";
import CardsSection from "../components/CardsSection";
import { getSections, Section } from "../lib/sections";

type HomeProps = {
  sections: Section[];
};

export const getServerSideProps = async (): Promise<
  GetServerSidePropsResult<HomeProps>
> => {
  try {
    const sections = await getSections();
    return {
      props: {
        sections,
      },
    };
  } catch (error) {
    console.error(
      "Error in getStaticProps for index.tsx: ",
      (error as Error).message
    );
    return {
      props: {
        sections: [],
      },
    };
  }
};

const Home: NextPage<HomeProps> = (props: HomeProps) => {
  const [isBannerTransparent, setIsBannerTransparent] = useState(true);
  const { sections } = props;

  const bannerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const { intersectionRatio } = entries[0];

        if (intersectionRatio !== 1 && isBannerTransparent) {
          setIsBannerTransparent(false);
          return;
        }
        if (intersectionRatio === 1 && !isBannerTransparent) {
          setIsBannerTransparent(true);
          return;
        }
      },
      {
        root: null,
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
      }
    );
    const currentRef = bannerRef.current;
    if (currentRef) observer.observe(currentRef as Element);

    return () => {
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
        <Navbar gradientBackground={isBannerTransparent} />
        <Banner
          title="Harry Potter"
          subTitle="You're a wizard Harry!"
          imgUrl="/static/harry-potter.webp"
          videoId="XdKzUbAiswE"
          ref={bannerRef}
        />
        <div className={styles.sectionWrapper}>
          {sections.length > 0 &&
            sections.map((section: Section, index: number) => {
              if (section.error) {
                console.warn(
                  `Error in section: ${section.title}`,
                  section.error
                );
                return false;
              }
              return (
                <CardsSection
                  key={index}
                  title={section.title}
                  cardSize={section.cardSize}
                  videoList={section.list}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Home;
