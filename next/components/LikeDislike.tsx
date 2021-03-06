import { useMutation, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import styles from "../styles/likedislike.module.css";
import Like from "./icons/LikeIcon";
import Dislike from "./icons/DislikeIcon";
import { LikeDislikeState } from "../lib/types";
import { VideoLikeDislikeQuery, VideoLikeDislikeMutation } from "../lib/graphql";

type LikeDislikeProps = {
  videoId: string;
};
const LikeDislike: React.FC<LikeDislikeProps> = (props) => {
  const { videoId } = props;
  const user = useAuth();

  const { data, error, refetch } = useQuery(VideoLikeDislikeQuery, {
    variables: { input: { videoId } },
  });
  const fetchedStats = data ? data.video : null;

  const [likeDislike, setLikeDislike] = useState(LikeDislikeState.unset);
  const [update, setUpdate] = useState(LikeDislikeState.unset);
  const [postStats] = useMutation(VideoLikeDislikeMutation, {
    variables: { input: { videoId, likeDislike: update } },
  });

  useEffect(() => {
    if (user && error) {
      refetch();
    }
  }, [error, user, refetch]);

  useEffect(() => {
    if (fetchedStats) {
      setLikeDislike(fetchedStats.likeDislike);
    }
  }, [fetchedStats]);

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
