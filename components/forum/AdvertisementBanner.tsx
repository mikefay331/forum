import type { Advertisement } from "@/lib/types/database";

interface AdvertisementBannerProps {
  advertisements: Advertisement[];
}

export default function AdvertisementBanner({ advertisements }: AdvertisementBannerProps) {
  if (advertisements.length === 0) return null;

  return (
    <div className="space-y-3 mb-4">
      <div className="flex flex-wrap gap-3">
        {advertisements.map((ad) => (
          <a
            key={ad.id}
            href={ad.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded overflow-hidden border border-gray-700/50 hover:border-teal-500/50 transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ad.image_url}
              alt={ad.title}
              className="max-h-24 object-cover"
            />
            {ad.description && (
              <div className="px-2 py-1" style={{ background: "#1e2537" }}>
                <p className="text-xs text-gray-300">{ad.description}</p>
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
