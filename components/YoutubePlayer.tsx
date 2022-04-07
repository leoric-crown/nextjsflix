import React, { useRef, useEffect, useState } from "react";
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
};

type InternalPlayer = {
  getDuration: () => Promise<number>;
  getCurrentTime: () => Promise<number>;
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

const YoutubePlayer: React.FC<YoutubePlayerProps> = (props) => {
  const { videoId } = props;

  const [playbackState, setPlaybackState] = useState(PlaybackStates.unstarted);
  const [duration, setDuration] = useState(1);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(
    setInterval(() => {
      return;
    })
  );
  const playerRef = useRef(null);

  const handlePlay = async (internalPlayer: InternalPlayer) => {
    const videoLength = await internalPlayer.getDuration();
    setDuration(Math.floor(videoLength));
  };

  useEffect(() => {
    const getProgress = async (internalPlayer: InternalPlayer) => {
      const currentTime = await internalPlayer.getCurrentTime();
      setProgress(Math.floor(currentTime));
    };

    if (playbackState === PlaybackStates.playing) {
      if (playerRef?.current) {
        const current: CurrentRef = playerRef.current;
        const internalPlayer = current.getInternalPlayer();
        handlePlay(internalPlayer);
        const interval = setInterval(() => {
          getProgress(internalPlayer);
        }, 1000);
        intervalRef.current = interval;

        return () => clearInterval(interval);
      }
    } else {
      clearInterval(intervalRef.current);
      if (playbackState === PlaybackStates.ended) setProgress(duration);
    }
  }, [playbackState, duration, progress]);

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
