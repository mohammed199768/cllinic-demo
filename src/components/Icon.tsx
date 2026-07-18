import React from "react";
import {
  Siren, Stethoscope, Baby, HeartPulse, Home, FlaskConical, Droplet, Scissors,
  MessageCircle, ShieldCheck, Phone, Clock, MapPin, Mail, Check, ArrowRight,
  Play, Search, Music, Download, Activity, TestTube, Ambulance, Calendar,
  Users, User, ChevronRight, Microscope, Syringe, Video, Quote, Plus, Headset,
  Globe, Award, BedDouble, Facebook, Instagram, Send, X, Menu, MapPinned, Brain, Smile,
  Pencil, Trash2, Upload, FileText, ClipboardList, Pill, Printer, Save, RotateCcw, CircleHelp,
  WifiOff, RefreshCw, MoreHorizontal, Smartphone, BookOpen, Navigation, type LucideIcon,
} from "lucide-react";

type Props = { name: string; className?: string };

const map: Record<string, LucideIcon> = {
  siren: Siren, stethoscope: Stethoscope, baby: Baby, "heart-pulse": HeartPulse,
  home: Home, flask: FlaskConical, droplet: Droplet, scissors: Scissors,
  message: MessageCircle, shield: ShieldCheck, shield2: ShieldCheck, phone: Phone,
  clock: Clock, pin: MapPin, mail: Mail, check: Check, arrow: ArrowRight,
  play: Play, search: Search, music: Music, download: Download,
  activity: Activity, vial: TestTube, ambulance: Ambulance, calendar: Calendar,
  users: Users, user: User, chevron: ChevronRight, microscope: Microscope,
  syringe: Syringe, video: Video, quote: Quote, plus: Plus, headset: Headset,
  globe: Globe, award: Award, bed: BedDouble, facebook: Facebook, instagram: Instagram, send: Send, close: X, menu: Menu, directions: MapPinned, brain: Brain, smile: Smile,
  pencil: Pencil, trash: Trash2, upload: Upload, "file-text": FileText,
  clipboard: ClipboardList, pill: Pill, printer: Printer, save: Save, restore: RotateCcw,
  "wifi-off": WifiOff, refresh: RefreshCw, more: MoreHorizontal, smartphone: Smartphone,
  book: BookOpen, navigation: Navigation,
};

export default function Icon({ name, className = "h-5 w-5" }: Props) {
  if (name === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.95.51 3.78 1.41 5.37L2 22l4.85-1.27a9.9 9.9 0 0 0 5.19 1.48h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.06c-.25.69-1.46 1.34-2.01 1.39-.54.05-1.05.25-3.53-.74-2.97-1.17-4.86-4.21-5.01-4.41-.15-.2-1.21-1.61-1.21-3.07 0-1.46.76-2.18 1.04-2.48.27-.3.59-.37.79-.37.2 0 .39 0 .57.01.18.01.43-.07.67.51.25.59.84 2.05.91 2.2.07.15.12.32.02.52-.1.2-.15.32-.3.49-.15.17-.31.39-.45.52-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.36 1.46.3.15.47.12.64-.07.17-.2.74-.86.94-1.16.2-.3.39-.25.66-.15.27.1 1.71.81 2.01.96.3.15.5.22.57.35.07.12.07.72-.18 1.41Z" />
      </svg>
    );
  }
  const Cmp = map[name] ?? CircleHelp;
  return <Cmp className={className} strokeWidth={1.75} aria-hidden="true" />;
}
