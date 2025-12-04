import { useEffect, useRef, useState } from "react";

interface YouTubePlayerProps {
  videoId: string;
  onTimeUpdate?: (time: number) => void;
  startTime?: number;
  endTime?: number;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const YouTubePlayer = ({ videoId, onTimeUpdate, startTime, endTime }: YouTubePlayerProps) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isReady, setIsReady] = useState(false);
  const endTimeRef = useRef<number | undefined>(endTime);

  useEffect(() => {
    endTimeRef.current = endTime;
  }, [endTime]);

  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (!window.YT) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
    };

    loadYouTubeAPI();

    const initPlayer = () => {
      if (containerRef.current && window.YT && window.YT.Player) {
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: () => {
              setIsReady(true);
              intervalRef.current = setInterval(() => {
                if (playerRef.current?.getCurrentTime) {
                  const currentTime = playerRef.current.getCurrentTime();
                  onTimeUpdate?.(currentTime);
                  
                  // Stop at endTime
                  if (endTimeRef.current && currentTime >= endTimeRef.current) {
                    playerRef.current.pauseVideo();
                  }
                }
              }, 100);
            },
          },
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current?.destroy) playerRef.current.destroy();
    };
  }, [videoId]);

  useEffect(() => {
    if (isReady && playerRef.current?.seekTo && startTime !== undefined) {
      playerRef.current.seekTo(startTime, true);
      playerRef.current.playVideo();
    }
  }, [startTime, isReady]);

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
