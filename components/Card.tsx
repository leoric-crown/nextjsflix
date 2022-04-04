import React, { useState } from "react";
import cls from "classnames";
// import { NextPageContext, GetStaticPropsResult } from "next";
import { motion } from "framer-motion";
import styles from "../styles/card.module.css";
import Image from "next/image";

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
  imgUrl: string;
  size: CardSizeEnum;
  link?: string;
  index?: number;
}

const Card: React.FC<CardProps> = (props) => {
  const {
    index,
    size = CardSizeEnum.medium,
    imgUrl = "/static/defaultImage.webp",
  } = props;

  const [imgSrc, setImgSrc] = useState(imgUrl);

  const handleImgError = () => {
    console.error("Handling image error", { imgUrl });
    setImgSrc("/static/defaultImage.webp");
  };

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
          alt="harry potter"
          onError={handleImgError}
          layout="fill"
        />
      </motion.div>
    </div>
  );
};

export default Card;
