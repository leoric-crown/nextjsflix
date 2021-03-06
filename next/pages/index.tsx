import React, { useEffect, useRef, useState } from "react";
import type {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextPage,
} from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Banner from "../components/Banner";
import Navbar from "../components/Navbar";
import CardsSection from "../components/CardsSection";
import { getHomeSections, Section } from "../lib/sections";
import { getImgUrl, ImgQuality, YoutubeVideo } from "../lib/youtube";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/Loader";

type HomeProps = {
  sections: Section[];
  bannerVideo: YoutubeVideo | null;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<HomeProps>> => {
  try {
    const sections = await getHomeSections(context);

    // const allVideos = sections
    //   .map((section) => section.list)
    //   .reduce((acc, current) => {
    //     return [...current, ...acc];
    //   });

    const bannerVideo =
      sections[0].list[Math.floor(Math.random() * sections[0].list.length)];

    return {
      props: {
        sections,
        bannerVideo,
      },
    };
  } catch (error) {
    console.error(
      "Error in getServersiderops for index.tsx: ",
      (error as Error).message
    );
    return {
      props: {
        sections: [],
        bannerVideo: null,
      },
    };
  }
};

const Home: NextPage<HomeProps> = (props: HomeProps) => {
  const [isBannerTransparent, setIsBannerTransparent] = useState(true);
  const { loading } = useAuth();
  const { sections, bannerVideo } = props;

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
        {loading ? (
          <Loader />
        ) : (
          <>
            <Navbar gradientBackground={isBannerTransparent} />
            <Banner
              title={bannerVideo?.title as string}
              subTitle={bannerVideo?.channelTitle as string}
              imgUrl={
                bannerVideo?.imgUrls
                  ? getImgUrl(ImgQuality.maxres, bannerVideo.imgUrls)
                  : ""
              }
              videoId={bannerVideo?.id as string}
              ref={bannerRef}
            />
            <div className={styles.sectionWrapper}>
              {sections.length > 0 &&
                sections.map((section: Section, index: number) => {
                  if (section.error) {
                    console.warn(
                      `Error in index.tsx, rendering section: ${section.title}`,
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
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
