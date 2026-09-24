import Link from "next/link";
import { Reveal } from "@/components/home/reveal";
import { SectionHeading, SectionShell } from "@/components/home/section";
import { HomeIcon } from "@/components/home/home-icon";
import { categoryShowcase } from "@/config/home";
import type { Category } from "@/lib/data";

/**
 * Category grid. Database categories render first (real links); showcase-only
 * entries render as search deep-links so all 12 spec categories always show.
 */
export function CategoriesSection({
  categories,
  languageCode,
}: {
  categories: Category[];
  languageCode: string;
}) {
  const used = new Set<string>();
  const cards: {
    key: string;
    title: string;
    blurb: string;
    icon: string;
    href: string;
  }[] = [];

  for (const category of categories) {
    const match = categoryShowcase.find((item) => {
      const name = category.name.toLowerCase();
      return name.includes(item.match) && !used.has(item.match);
    });
    if (match) used.add(match.match);
    cards.push({
      key: category.id,
      title: category.name,
      blurb: match?.blurb ?? "Browse available services",
      icon: match?.icon ?? "Compass",
      href: `/services?category=${category.id}&lang=${languageCode}`,
    });
  }
  for (const item of categoryShowcase) {
    if (used.has(item.match)) continue;
    const title = `${item.match.charAt(0).toUpperCase()}${item.match.slice(1)} Services`;
    cards.push({
      key: `showcase-${item.match}`,
      title,
      blurb: item.blurb,
      icon: item.icon,
      href: `/services?lang=${languageCode}&q=${encodeURIComponent(item.match)}`,
    });
  }

  return (
    <SectionShell id="categories" labelledBy="categories-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          id="categories-heading"
          kicker="Service categories"
          title="Browse by category"
          lead="Twelve life-event categories. Pick one to see verified services, documents, and official sources."
        />
        <Reveal delay={0.05}>
          <Link
            href={`/services?lang=${languageCode}`}
            className="text-sm font-semibold text-teal-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            View all services
          </Link>
        </Reveal>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.slice(0, 12).map((card, index) => (
          <Reveal key={card.key} delay={Math.min(index, 7) * 0.05}>
            <Link
              href={card.href}
              className="card-hover group flex h-full flex-col rounded-xl border border-slate-200/80 bg-white p-5 shadow-md ring-1 ring-teal-900/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-700/10 text-teal-800 transition-colors group-hover:bg-teal-700 group-hover:text-white">
                <HomeIcon name={card.icon} />
              </span>
              <span className="mt-4 text-base font-bold text-slate-900 group-hover:text-teal-800">
                {card.title}
              </span>
              <span className="mt-1 text-sm leading-6 text-slate-600">
                {card.blurb}
              </span>
              <span className="mt-3 text-xs font-bold tracking-widest text-teal-700 uppercase">
                Explore →
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
