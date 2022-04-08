import { gql, useMutation, useQuery } from "@apollo/client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import YouTube, { Options } from "react-youtube";
import styles from "../styles/youtube-player.module.css";

const youtubeOptions: Options = {
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
    autoplay: 1,
    controls: 1,
  },
};

type YoutubePlayerProps = {
  videoId: string;
  isAuth: boolean;
};

type InternalPlayer = {
  getDuration: () => Promise<number>;
  getCurrentTime: () => Promise<number>;
  seekTo: (seconds: number, allowSeekAhead: boolean) => Promise<void>;
  playVideo: () => Promise<void>;
};

type CurrentRef = { getInternalPlayer: () => InternalPlayer };

enum PlaybackStates {
  unstarted = -1,
  ended = 0,
  playing = 1,
  paused = 2,
  buffering = 3,
  videoCued = 5,
}

const emptyInterval = setInterval(() => {
  return;
});

const GET_VIDEO_PROGRESSWATCHED = gql`
  query GetVideoProgressWatched($input: VideoStatsQueryInput) {
    video(input: $input) {
      id
      progress
      watched
    }
  }
`;

const MUTATE_PROGRESS = gql`
  mutation MutateProgress($input: StatsInput) {
    video(input: $input) {
      id
      progress
    }
  }
`;

const MUTATE_WATCHED = gql`
  mutation MutateWatched($input: StatsInput) {
    video(input: $input) {
      id
      watched
    }
  }
`;

const progressPollingRate = 1000;
const postRate = 5000;
const watchedThreshold = 0.85;

const YoutubePlayer: React.FC<YoutubePlayerProps> = (props) => {
  const { videoId, isAuth } = props;

  const { data: queryData, loading: loadingStats } = useQuery(
    GET_VIDEO_PROGRESSWATCHED,
    {
      variables: { input: { videoId } },
      fetchPolicy: "network-only",
      nextFetchPolicy: "standby",
    }
  );

  const [playbackState, setPlaybackState] = useState(PlaybackStates.unstarted);
  const [duration, setDuration] = useState(1);
  const [progress, setProgress] = useState(0);
  const [watched, setWatched] = useState(false);
  const pollIntervalRef = useRef(emptyInterval);
  const postIntervalRef = useRef(emptyInterval);
  const playerRef = useRef(null);

  const [postProgress] = useMutation(MUTATE_PROGRESS, {
    variables: { input: { videoId, progress } },
  });
  const [postWatched, { data: postedData }] = useMutation(MUTATE_WATCHED, {
    variables: { input: { videoId, watched } },
  });

  useEffect(() => {
    const handleSetDuration = async (internalPlayer: InternalPlayer) => {
      const videoLength = await internalPlayer.getDuration();
      if (duration !== videoLength) {
        setDuration(videoLength);
      }
    };
    if (playerRef?.current) {
      const current: CurrentRef = playerRef.current;
      const internalPlayer = current.getInternalPlayer();

      handleSetDuration(internalPlayer);
    }
  }, [duration, playerRef]);

  useEffect(() => {
    const handleSetProgress = async (internalPlayer: InternalPlayer) => {
      const currentTime = await internalPlayer.getCurrentTime();
      setProgress(currentTime / duration);
    };

    if (playbackState === PlaybackStates.playing && playerRef?.current) {
      const current: CurrentRef = playerRef.current;
      const internalPlayer = current.getInternalPlayer();
      const interval = setInterval(() => {
        handleSetProgress(internalPlayer);
      }, progressPollingRate);
      pollIntervalRef.current = interval;

      return () => clearInterval(interval);
    } else {
      clearInterval(pollIntervalRef.current);
      if (playbackState === PlaybackStates.ended) {
        setProgress(1);
        if (isAuth && progress === 1) postProgress();
      }
    }
  }, [isAuth, playbackState, duration, progress, postProgress]);

  useEffect(() => {
    if (isAuth) {
      if (playbackState === PlaybackStates.playing) {
        const interval = setInterval(() => {
          postProgress();
        }, postRate);
        postIntervalRef.current = interval;

        return () => clearInterval(interval);
      } else {
        clearInterval(postIntervalRef.current);
        if (playbackState === PlaybackStates.paused) postProgress();
      }
    }
  }, [isAuth, playbackState, postProgress]);

  useEffect(() => {
    if (!watched && progress > watchedThreshold) {
      setWatched(true);
    }
  }, [duration, progress, watched]);

  useEffect(() => {
    if (isAuth && watched && !postedData) {
      postWatched();
    }
  }, [isAuth, postedData, watched, postWatched]);

  const fetchedStats = queryData ? queryData.video : null;

  const getProgressInSeconds = useCallback(() => {
    const seconds = fetchedStats?.progress * duration;
    if (duration - seconds < 2) return 0;
    if (seconds < 20) return 0;
    return seconds;
  }, [duration, fetchedStats]);

  const seekVideoPlayer = useCallback(
    (seconds) => {
      const handleSeekVideo = async (internalPlayer: InternalPlayer) => {
        if (seconds > 0) {
          await internalPlayer.seekTo(Math.floor(seconds), true);
        }
        internalPlayer.playVideo();
      };

      if (playerRef?.current) {
        const current: CurrentRef = playerRef.current;
        const internalPlayer = current.getInternalPlayer();
        handleSeekVideo(internalPlayer);
      }
    },
    [playerRef]
  );

  useEffect(() => {
    if (!loadingStats && duration > 1) {
      const seconds = getProgressInSeconds();
      seekVideoPlayer(seconds);
    }
  }, [getProgressInSeconds, loadingStats, duration, seekVideoPlayer]);

  return (
    <YouTube
      ref={playerRef}
      containerClassName={styles.youtubePlayerWrapper}
      className={styles.youtubePlayer}
      videoId={videoId}
      opts={youtubeOptions}
      onStateChange={(event) => setPlaybackState(event.data)}
    />
  );
};

export default YoutubePlayer;
