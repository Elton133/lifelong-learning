import React from "react";
import { Card, CardContent } from "./Card";

type VideoPlayerProps = {
  url: string;
  poster?: string; // optional thumbnail for direct videos
};

export default function VideoPlayer({ url, poster }: VideoPlayerProps) {
  const isYouTube =
    url.includes("youtu.be") || url.includes("youtube.com/watch");

  let embedUrl = "";
  if (isYouTube) {
    if (url.includes("youtu.be")) {
      const videoId = url.split("/")[3].split("?")[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("youtube.com/watch")) {
      const urlParams = new URLSearchParams(url.split("?")[1]);
      const videoId = urlParams.get("v");
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="aspect-video rounded-lg overflow-hidden">
          {isYouTube ? (
            <iframe
              width="100%"
              height="100%"
              src={embedUrl}
              title="YouTube Video Player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={url}
              poster={poster}
              controls
              className="w-full h-full object-cover"
            >
              Sorry, your browser doesn’t support embedded videos.
            </video>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
