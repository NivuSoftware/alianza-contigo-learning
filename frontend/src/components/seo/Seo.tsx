import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { absoluteUrl, DEFAULT_IMAGE, SITE_NAME, SITE_URL, type JsonLd } from "@/lib/seo";

interface SeoProps {
  title: string;
  description: string;
  /** Path without domain. Defaults to the current pathname. */
  path?: string;
  image?: string | undefined;
  type?: "website" | "article";
  noindex?: boolean;
  jsonLd?: JsonLd | JsonLd[] | undefined;
}

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setLink(selector: string, rel: string, href: string, hreflang?: string) {
  let element = document.head.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    if (hreflang) element.hreflang = hreflang;
    document.head.appendChild(element);
  }
  element.href = href;
}

export function Seo({
  title,
  description,
  path,
  image,
  type = "website",
  noindex = false,
  jsonLd,
}: SeoProps) {
  const { pathname } = useLocation();
  const url = `${SITE_URL}${path ?? pathname}`;
  const fullTitle = title.includes("Alianza Contigo") ? title : `${title} | ${SITE_NAME}`;
  const imageUrl = image ? absoluteUrl(image) : DEFAULT_IMAGE;
  const serializedJsonLd = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    document.title = fullTitle;
    setMeta("name", "description", description);
    setMeta(
      "name",
      "robots",
      noindex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    );
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:type", type);
    setMeta("property", "og:image", imageUrl);
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", imageUrl);
    setLink('link[rel="canonical"]', "canonical", url);
    for (const lang of ["es-EC", "es", "x-default"]) {
      setLink(`link[rel="alternate"][hreflang="${lang}"]`, "alternate", url, lang);
    }

    const existing = document.getElementById("route-jsonld");
    if (serializedJsonLd) {
      const script = existing ?? document.createElement("script");
      script.id = "route-jsonld";
      script.setAttribute("type", "application/ld+json");
      script.textContent = serializedJsonLd;
      if (!existing) document.head.appendChild(script);
    } else {
      existing?.remove();
    }
  }, [fullTitle, description, url, type, imageUrl, noindex, serializedJsonLd]);

  return null;
}
