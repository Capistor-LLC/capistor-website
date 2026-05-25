import { Helmet } from "react-helmet-async";

interface SeoProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  tags?: string[];
}

const SITE_NAME = "Capistor Technologies";
const SITE_URL = "https://capistor.com";
const DEFAULT_DESCRIPTION =
  "Custom embedded systems, PCB design, and industrial technology solutions — engineered for production.";
const DEFAULT_IMAGE = `${SITE_URL}/og-default.jpg`;

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  publishedTime,
  tags,
}: SeoProps) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
  const fullUrl = url
    ? url.startsWith("http")
      ? url
      : `${SITE_URL}${url}`
    : typeof window !== "undefined"
      ? window.location.href
      : SITE_URL;
  const fullImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />

      {publishedTime && type === "article" && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {tags?.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
    </Helmet>
  );
}
