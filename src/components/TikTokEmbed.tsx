interface TikTokEmbedProps {
  url: string;
  className?: string;
}

export const tiktokVideoId = (url: string) => {
  const match = url.match(/video\/(\d+)/) || url.match(/\/(\d{15,})/);
  return match ? match[1] : null;
};

const TikTokEmbed = ({ url, className }: TikTokEmbedProps) => {
  const id = tiktokVideoId(url);
  if (!id) return null;

  return (
    <div className={className}>
      <iframe
        title="TikTok video"
        src={`https://www.tiktok.com/embed/v2/${id}`}
        className="w-full rounded-xl border border-border"
        style={{ height: 740, maxHeight: '80vh' }}
        allow="encrypted-media; fullscreen"
        loading="lazy"
      />
    </div>
  );
};

export default TikTokEmbed;
