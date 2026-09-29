import type { Course } from "@/types";

export const SITE_URL = "https://alianzacontigoeducacion.com";
export const SITE_NAME = "Alianza Contigo Educación";
export const DEFAULT_IMAGE = `${SITE_URL}/assets/og-alianza-contigo.jpg`;
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export type JsonLd = Record<string, unknown>;

export function absoluteUrl(value: string) {
  if (!value) return DEFAULT_IMAGE;
  if (/^https?:\/\//.test(value)) return value;
  return `${SITE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

function courseUrl(course: Course) {
  return `${SITE_URL}/courses/${course.slug}`;
}

function courseMode(modality: string) {
  const value = modality.toLowerCase();
  if (value.includes("presencial")) return "Onsite";
  if (value.includes("híbrid") || value.includes("hibrid") || value.includes("semi"))
    return "Blended";
  return "Online";
}

/** Converts free-text durations like "40 horas" into ISO 8601 (PT40H) when possible. */
function workload(duration: string) {
  const hours = duration.match(/(\d+(?:[.,]\d+)?)\s*(h\b|hora)/i);
  if (hours?.[1]) return `PT${Math.round(Number(hours[1].replace(",", ".")))}H`;
  const weeks = duration.match(/(\d+)\s*semana/i);
  if (weeks) return `P${weeks[1]}W`;
  const months = duration.match(/(\d+)\s*mes/i);
  if (months) return `P${months[1]}M`;
  return undefined;
}

export function courseDescription(course: Course) {
  const base = (course.shortDescription || course.fullDescription || "").trim();
  const suffix = `Curso ${course.modality.toLowerCase()} de ${course.trainingArea.name} con certificado en Alianza Contigo Educación.`;
  const text = base ? `${base} ${suffix}` : suffix;
  return text.length > 300 ? `${text.slice(0, 297).trimEnd()}…` : text;
}

export function courseJsonLd(course: Course) {
  const price = course.currentPrice ?? course.originalPrice;
  const courseWorkload = workload(course.duration);
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${courseUrl(course)}#course`,
    url: courseUrl(course),
    name: course.name,
    description: course.fullDescription || course.shortDescription,
    image: course.image ? absoluteUrl(course.image) : undefined,
    inLanguage: "es",
    about: course.trainingArea.name,
    educationalLevel: "Educación continua",
    educationalCredentialAwarded: course.certification,
    provider: {
      "@id": ORGANIZATION_ID,
      "@type": "EducationalOrganization",
      name: "Alianza Contigo Educación Continua",
      sameAs: SITE_URL,
    },
    syllabusSections: course.modules.map((module) => ({
      "@type": "Syllabus",
      name: module.subtitle || module.title,
      description: module.description || undefined,
    })),
    offers:
      price !== undefined
        ? {
            "@type": "Offer",
            category: price > 0 ? "Paid" : "Free",
            price: price.toFixed(2),
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: courseUrl(course),
          }
        : undefined,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: courseMode(course.modality),
      ...(courseWorkload ? { courseWorkload } : {}),
      inLanguage: "es",
      location:
        courseMode(course.modality) === "Online"
          ? { "@type": "VirtualLocation", url: courseUrl(course) }
          : undefined,
    },
  };
}

export function coursesItemListJsonLd(courses: Course[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Programas de educación continua y cursos en línea",
    itemListElement: courses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: courseUrl(course),
      name: course.name,
    })),
  };
}
