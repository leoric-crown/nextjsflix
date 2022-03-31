import Image from "next/image";
import React, { useRef } from "react";
import styles from "../styles/cards-section.module.css";
import Card, { CardProps, CardSizeEnum } from "./card";

export type CardsSectionProps = {
  title: string;
  cardSize: CardSizeEnum;
  cardList: CardProps[];
};

const CardsSection: React.FC<CardsSectionProps> = (props) => {
  const scrollRef = useRef<HTMLInputElement>(null);

  const handleScrollClick = (direction: string) => {
    if (scrollRef?.current) {
      const leftRightMultiplier = direction === 'LEFT' ? -1: 1
      scrollRef.current.scrollTo({
          left: scrollRef.current.scrollLeft + leftRightMultiplier * 800,
          behavior: 'smooth'
      })
    }
  };

  const { title, cardSize, cardList } = props;
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.scrollContainer}>
        <div
          className={styles.leftChevronContainer}
          onClick={() => handleScrollClick("LEFT")}
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
          onClick={() => handleScrollClick("RIGHT")}
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
