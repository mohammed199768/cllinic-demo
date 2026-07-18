import type { ObjectId } from "./kidsGameObjects";

export type PatternRound = {
  sequence: ObjectId[]; // shown sequence (last hidden slot is "?")
  options: ObjectId[];
  answer: number; // index into options
};

/** 8 rounds, difficulty grows from simple ABAB to longer multi-object cycles. */
export const PATTERN_ROUNDS: PatternRound[] = [
  { sequence: ["water", "apple", "water", "apple"], options: ["water", "apple", "star"], answer: 0 },
  { sequence: ["star", "moon", "star", "moon"], options: ["moon", "star", "heart"], answer: 1 },
  { sequence: ["apple", "apple", "carrot", "apple", "apple"], options: ["carrot", "apple", "leaf"], answer: 0 },
  { sequence: ["leaf", "carrot", "leaf", "carrot", "leaf"], options: ["leaf", "carrot", "apple"], answer: 1 },
  { sequence: ["water", "star", "moon", "water", "star"], options: ["water", "moon", "star"], answer: 1 },
  { sequence: ["heart", "heart", "shield", "heart", "heart", "shield", "heart"], options: ["shield", "heart", "star"], answer: 1 },
  { sequence: ["sun", "moon", "star", "sun", "moon"], options: ["sun", "star", "moon"], answer: 1 },
  { sequence: ["apple", "water", "leaf", "carrot", "apple", "water", "leaf"], options: ["carrot", "apple", "water"], answer: 0 },
];
