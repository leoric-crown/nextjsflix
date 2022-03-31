import Image from "next/image";
import styles from "../styles/banner.module.css";
import React from "react";
// import { NextPageContext, GetStaticPropsResult } from "next";

interface BannerProps {
  title: string;
  subTitle: string;
  imgUrl: string;
  ref?: React.RefObject<HTMLInputElement>;
}

const handleOnClickPlay = () => {
  console.log("handle click play in banner");
};

export default React.forwardRef<HTMLInputElement, BannerProps>(function Banner(props,ref) {
    const { title, subTitle, imgUrl, } = props;
    return (
      <div className={styles.container} ref={ref}>
        <div className={styles.leftWrapper}>
          <div className={styles.left}>
            <div className={styles.nseriesWrapper}>
              <p className={styles.firstLetter}>N</p>
              <p className={styles.series}>S E R I E S</p>
            </div>
            <h3 className={styles.title}>{title}</h3>
            <h4 className={styles.subTitle}>{subTitle}</h4>
            <div className={styles.playBtnWrapper}>
              <button className={styles.btnWithIcon} onClick={handleOnClickPlay}>
                <Image
                  src={"/static/play_arrow.svg"}
                  alt="play icon"
                  width="32px"
                  height="32px"
                />
                <span className={styles.playText}>Play</span>
              </button>
            </div>
          </div>
        </div>
        <div
          className={styles.bannerImg}
          style={{
            backgroundImage: `url(${imgUrl})`,
            width: "100%",
            height: "100%",
            position: "absolute",
            backgroundSize: "cover",
            backgroundPosition: "50% 50%",
          }}
        ></div>
      </div>
    );

}

)

// const Banner: React.FC<BannerProps> = (props) => {
//   const { title, subTitle, imgUrl } = props;
//   return (
//     <div className={styles.container}>
//       <div className={styles.leftWrapper}>
//         <div className={styles.left}>
//           <div className={styles.nseriesWrapper}>
//             <p className={styles.firstLetter}>N</p>
//             <p className={styles.series}>S E R I E S</p>
//           </div>
//           <h3 className={styles.title}>{title}</h3>
//           <h4 className={styles.subTitle}>{subTitle}</h4>
//           <div className={styles.playBtnWrapper}>
//             <button className={styles.btnWithIcon} onClick={handleOnClickPlay}>
//               <Image
//                 src={"/static/play_arrow.svg"}
//                 alt="play icon"
//                 width="32px"
//                 height="32px"
//               />
//               <span className={styles.playText}>Play</span>
//             </button>
//           </div>
//         </div>
//       </div>
//       <div
//         className={styles.bannerImg}
//         style={{
//           backgroundImage: `url(${imgUrl})`,
//           width: "100%",
//           height: "100%",
//           position: "absolute",
//           backgroundSize: "cover",
//           backgroundPosition: "50% 50%",
//         }}
//       ></div>
//     </div>
//   );
// };

// export default Banner;
