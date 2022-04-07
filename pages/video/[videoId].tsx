import {
  GetStaticPathsResult,
  GetStaticPropsResult,
  NextPage,
  GetStaticPropsContext,
} from "next";
import { useRouter } from "next/router";
import React from "react";
import Modal from "react-modal";
import styles from "../../styles/Video.module.css";
import clsx from "classnames";
import { getVideoData, YoutubeEndpoint, YoutubeVideo } from "../../lib/youtube";
import { ParsedUrlQuery } from "querystring";
import Navbar from "../../components/Navbar";
import LikeDislike from "../../components/LikeDislike";
import { useAuth } from "../../hooks/useAuth";
import YoutubePlayer from "../../components/YoutubePlayer";

Modal.setAppElement("#__next");

type VideoPageProps = {
  video: YoutubeVideo | null;
};

interface RouteParams extends ParsedUrlQuery {
  videoId: string;
}

export const getStaticPaths = async (): Promise<GetStaticPathsResult> => {
  const videoIds = ["XdKzUbAiswE", "CaimKeDcudo", "9nM2vFnaBrQ"];

  const paths = videoIds.map((id) => {
    return { params: { videoId: id } };
  });
  return {
    paths,
    fallback: "blocking",
  };
};

export async function getStaticProps(
  context: GetStaticPropsContext
): Promise<GetStaticPropsResult<VideoPageProps>> {
  const { videoId } = context.params as RouteParams;
  const video = await getVideoData({
    endpoint: YoutubeEndpoint.byVideoIds,
    id: videoId,
  });
  return {
    props: {
      video: video.length > 0 ? video[0] : null,
    },
    revalidate: 10,
  };
}

const VideoPage: NextPage<VideoPageProps> = (props: VideoPageProps) => {
  const router = useRouter();
  const { video } = props;
  const videoId = router.query.videoId as string;
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <Navbar gradientBackground={false} />
      <Modal
        isOpen={true}
        contentLabel="Watch this video"
        onRequestClose={() => {
          router.back();
        }}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <YoutubePlayer videoId={videoId} />
        <div className={styles.modalBody}>
          <div className={styles.modalBodyContent}>
            <div className={styles.col1}>
              <p className={styles.publishTime}>{video?.publishTime}</p>
              <p className={styles.title}>{video?.title}</p>
              <p className={styles.description}>{video?.description}</p>
            </div>
            <div className={styles.col2}>
              {user && <LikeDislike videoId={videoId} />}
              <p className={clsx(styles.subText, styles.subTextWrapper)}>
                <span className={styles.textColor}>Channel: </span>
                <span className={styles.channelTitle}>
                  {video?.channelTitle}
                </span>
              </p>
              <p className={clsx(styles.subText, styles.subTextWrapper)}>
                <span className={styles.textColor}>View Count: </span>
                <span className={styles.channelTitle}>
                  {video?.viewCount || 0}
                </span>
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VideoPage;
