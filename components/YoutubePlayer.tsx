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
  const intervalRef = useRef(
    setInterval(() => {
      return;
    })
  );
  const playerRef = useRef(null);
  const getPlayerData = async (internalPlayer: InternalPlayer) => {
    const duration = await internalPlayer.getDuration();
    const currentTime = await internalPlayer.getCurrentTime();
    const percentage = currentTime / duration;
    return {
      currentTime,
      duration,
      percentage,
    };
  };

  useEffect(() => {
    if (playbackState === PlaybackStates.playing) {
      const interval = setInterval(() => {
        if (playerRef?.current) {
          const current: CurrentRef = playerRef.current;
          getPlayerData(current.getInternalPlayer());
        }
      }, 1000);
      intervalRef.current = interval;

      return () => clearInterval(interval);
    } else {
      clearInterval(intervalRef.current);
    }
  }, [playbackState]);

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
