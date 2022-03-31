import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/cards-section.module.css";
import Card, { CardProps, CardSizeEnum } from "./card";

export type CardsSectionProps = {
  title: string;
  cardSize: CardSizeEnum;
  cardList: CardProps[];
};

enum ScrollDirection {
  left = "LEFT",
  right = "RIGHT",
}

const CardsSection: React.FC<CardsSectionProps> = (props) => {
  const scrollRef = useRef<HTMLInputElement>(null);
  const [scrollSteps, setScrollSteps] = useState([] as number[]);
  const [scrollStepIndex, setScrollStepIndex] = useState(0);

  useEffect(() => {
    if (scrollRef?.current) {
      const { scrollWidth } = scrollRef.current;

      const scrollStep = 800;

      const numSteps = 1 + Math.floor(scrollWidth / scrollStep);
      const stepsArray = Array<number>(numSteps)
        .fill(0)
        .map((value, index) => {
          return index * scrollStep;
        });
      const lastStep = stepsArray[stepsArray.length - 1];
      const threshold = Math.floor(scrollStep / 2);
      if (lastStep !== scrollWidth) {
        if (scrollWidth - lastStep < threshold) {
          stepsArray[stepsArray.length - 1] = scrollWidth;
        } else {
          stepsArray.push(scrollWidth);
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

  const { title, cardSize, cardList } = props;
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.scrollContainer}>
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
        <div className={styles.cardWrapper} ref={scrollRef}>
          {cardList?.length > 0 &&
            cardList.map((card, index) => (
              <Card
                key={index}
                id={index}
                size={cardSize}
                imgUrl={card.imgUrl}
              />
            ))}
        </div>
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
      </div>
    </section>
  );
};

export default CardsSection;