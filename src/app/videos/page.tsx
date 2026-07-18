import type { Metadata } from "next";
import VideosView from "@/components/views/VideosView";

const DESCRIPTION =
  "جولة بصرية قصيرة ومعرض صور محايد لمساحات عيادة تجريبية. A short visual tour and neutral gallery of a demonstration clinic.";

export const metadata: Metadata = {
  title: "شاهد معنا | Watch With Us",
  description: DESCRIPTION,
  alternates: { canonical: "/videos" },
  openGraph: { title: "شاهد معنا | Watch With Us", description: DESCRIPTION, url: "/videos" },
};

export default function Page() {
  return <VideosView />;
}
