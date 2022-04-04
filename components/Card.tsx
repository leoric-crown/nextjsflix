import React from "react";
import cls from "classnames";
import { motion } from "framer-motion";
import styles from "../styles/card.module.css";
import Image from "next/image";
import { ImgUrls, getImgUrl, ImgQuality } from "../lib/youtube";

export enum CardSizeEnum {
  small = "small",
  medium = "medium",
  large = "large",
}

const classMap = {
  small: styles.smItem,
  medium: styles.mdItem,
  large: styles.lgItem,
};

export interface CardProps {
  title: string;
  imgUrls: ImgUrls;
  size: CardSizeEnum;
  link?: string;
  index?: number;
}

const Card: React.FC<CardProps> = (props) => {
  const { index, size = CardSizeEnum.medium, imgUrls, title } = props;

  const imgSrc = getImgUrl(ImgQuality.high, imgUrls);

  const motionScale = index === 0 ? { scaleY: 1.1 } : { scale: 1.1 };

  return (
    <div className={styles.container}>
      <motion.div
        className={cls(classMap[size], styles.imageMotionWrapper)}
        whileHover={{ ...motionScale }}
      >
        <Image
          className={styles.cardImg}
          src={imgSrc}
          alt={`${title} Card Image`}
          layout="fill"
        />
      </motion.div>
    </div>
  );
};

export default Card;
