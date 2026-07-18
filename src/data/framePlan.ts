/**
 * Bridge between the generated frame manifest and the clinic-tour engine.
 * The manifest is the single source of truth for which frames ship; no
 * component reads the JSON directly — they all go through this module.
 */
import manifest from "../../public/clinic-media/manifest/frame-manifest.json";

export interface WalkthroughPlan {
  id: string;
  startFrame: number;
  endFrame: number;
  scrollHeight: string;
  priorityFrameCount: number;
}

export const walkthroughFrames: string[] = manifest.frames;

export const walkthroughPlan: WalkthroughPlan = manifest.walkthrough;

export const TOTAL_FRAMES: number = manifest.totalFrames;
