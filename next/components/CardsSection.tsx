import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { YoutubeVideo } from "../lib/youtube";
import styles from "../styles/cards-section.module.css";
import Card, { CardSizeEnum } from "./Card";
import clsx from "classnames";

export type CardsSectionProps = {
  title: string;
  cardSize: CardSizeEnum;
  videoList: YoutubeVideo[];
  wrap?: boolean;
};

enum ScrollDirection {
  left = "LEFT",
  right = "RIGHT",
}

const CardsSection: React.FC<CardsSectionProps> = (props) => {
  const { title, cardSize, videoList, wrap = false } = props;
  const scrollRef = useRef<HTMLInputElement>(null);
  const [scrollSteps, setScrollSteps] = useState([] as number[]);
  const [scrollStepIndex, setScrollStepIndex] = useState(0);

  useEffect(() => {
    if (scrollRef?.current) {
      const { scrollWidth } = scrollRef.current;

      const scrollStep = 600;

      const numSteps = 1 + Math.floor(scrollWidth / scrollStep);
      const stepsArray = Array<number>(numSteps)
        .fill(0)
        .map((value, index) => {
          return index * scrollStep;
        });
      const lastStep = stepsArray[stepsArray.length - 1];
      const threshold = 350;
      if (lastStep !== scrollWidth) {
        if (scrollWidth - lastStep < threshold) {
          stepsArray[stepsArray.length - 1] = scrollWidth;
        }
      }
      setScrollSteps(stepsArray);
    }
  }, []);

  const handleScrollClick = (direction: ScrollDirection) => {
    if (scrollRef?.current) {
      let nextStep =
        scrollStepIndex + (direction === ScrollDirection.left ? -1 : 1);

      if (nextStep >= scrollSteps.length - 1) {
        nextStep = 0;
      }
      if (nextStep < 0) {
        nextStep = scrollSteps.length - 1;
      }
      setScrollStepIndex(nextStep);

      scrollRef.current.scrollTo({
        left: scrollSteps[nextStep],
        behavior: "smooth",
      });
    }
  };

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.scrollContainer}>
        {!wrap && (
          <div
            className={styles.leftChevronContainer}
            onClick={() => handleScrollClick(ScrollDirection.left)}
          >
            <Image
              src={"/static/chevron_left.svg"}
              alt="Scroll Left"
              width="48px"
              height="48px"
            />
          </div>
        )}
        <div
          className={clsx(styles.cardWrapper, wrap ? styles.wrap : "")}
          ref={scrollRef}
        >
          {videoList?.length > 0 &&
            videoList.map((video, index) => {
              return (
                <Link key={index} href={`/video/${video.id}`}>
                  <a className={wrap ? styles.addMargins : ""}>
                    <Card
                      videoId={video.id}
                      title={video.title}
                      index={index}
                      size={cardSize}
                      imgUrls={video.imgUrls}
                    />
                  </a>
                </Link>
              );
            })}
        </div>
        {!wrap && (
          <div
            className={styles.rightChevronContainer}
            onClick={() => handleScrollClick(ScrollDirection.right)}
          >
            <Image
              src={"/static/chevron_right.svg"}
              alt="Scroll Left"
              width="48px"
              height="48px"
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default CardsSection;
