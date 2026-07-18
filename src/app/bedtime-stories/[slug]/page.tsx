import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BedtimeReaderView from "@/components/views/BedtimeReaderView";
import stories from "@/data/bedtimeStories.json";

export function generateStaticParams() {
  return stories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const story = stories.find((s) => s.slug === slug);
  if (!story) return { title: "حكايات المساء | Evening Stories" };
  return {
    title: `${story.title.ar} | ${story.title.en}`,
    description: `حكاية مساء: ${story.title.ar} — ${story.title.en}`,
    alternates: { canonical: `/bedtime-stories/${story.slug}` },
  };
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = stories.find((s) => s.slug === slug);
  if (!story) notFound();
  return <BedtimeReaderView story={story} />;
}
