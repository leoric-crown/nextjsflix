import { gql, useMutation, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import styles from "../styles/likedislike.module.css";
import Like from "./icons/LikeIcon";
import Dislike from "./icons/DislikeIcon";

enum LikeDislikeState {
  like = "LIKE",
  dislike = "DISLIKE",
  none = "NONE",
  unset = "UNSET",
}

const GET_VIDEO_STATS = gql`
  query GetVideoStats($input: StatsInput) {
    video(input: $input) {
      likeDislike
    }
  }
`;

const MUTATE_VIDEO_STATS = gql`
  mutation MutateVideoStats($input: StatsInput) {
    video(input: $input) {
      likeDislike
    }
  }
`;

type LikeDislikeProps = {
  videoId: string;
};
const LikeDislike: React.FC<LikeDislikeProps> = (props) => {
  const { videoId } = props;
  const user = useAuth();
  const [likeDislike, setLikeDislike] = useState(LikeDislikeState.unset);
  const [update, setUpdate] = useState(LikeDislikeState.unset);
  const { data, error, refetch } = useQuery(GET_VIDEO_STATS, {
    variables: { input: { videoId: videoId } },
  });
  const [postStats] = useMutation(MUTATE_VIDEO_STATS, {
    variables: { input: { videoId: videoId, likeDislike: update } },
  });

  useEffect(() => {
    if (user && error) {
      refetch();
    }
  }, [error, user, refetch]);

  useEffect(() => {
    if (data && data.stats) {
      setLikeDislike(data.stats.likeDislike);
    }
  }, [data]);

  useEffect(() => {
    if (update !== LikeDislikeState.unset) {
      postStats();
    }
  }, [update, postStats]);

  const handleLikeDislike = (action: LikeDislikeState) => {
    const newLikeDislike =
      action === likeDislike ? LikeDislikeState.none : action;
    setLikeDislike(newLikeDislike);
    setUpdate(newLikeDislike);
  };

  return (
    <div className={styles.likeDislikeBtnWrapper}>
      <button
        onClick={() => handleLikeDislike(LikeDislikeState.like)}
        className={styles.btnWrapper}
      >
        <div>
          <Like
            fill={
              likeDislike === LikeDislikeState.like ? "var(--green10)" : "white"
            }
            selected={likeDislike === LikeDislikeState.like}
          />
        </div>
      </button>
      <button
        onClick={() => handleLikeDislike(LikeDislikeState.dislike)}
        className={styles.btnWrapper}
      >
        <div>
          <Dislike
            fill={
              likeDislike === LikeDislikeState.dislike
                ? "var(--red10)"
                : "white"
            }
            selected={likeDislike === LikeDislikeState.dislike}
          />
        </div>
      </button>
    </div>
  );
};

export default LikeDislike;
