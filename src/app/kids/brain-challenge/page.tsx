import type { Metadata } from "next";
import BrainChallengeView from "@/components/views/BrainChallengeView";

export const metadata: Metadata = {
  title: "تحدي الذكاء المرح | Fun Brain Challenge",
  description: "تحدي ترفيهي وتعليمي يساعد الطفل على تدريب الذاكرة والتركيز والمنطق بطريقة ممتعة وآمنة.",
  alternates: { canonical: "/kids/brain-challenge" },
  openGraph: { title: "تحدي الذكاء المرح | Fun Brain Challenge", description: "تحدي ترفيهي وتعليمي يساعد الطفل على تدريب الذاكرة والتركيز والمنطق بطريقة ممتعة وآمنة.", url: "/kids/brain-challenge" },
};

export default function Page() {
  return <BrainChallengeView />;
}
