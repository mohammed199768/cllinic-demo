import services from "@/data/services.json";
import { HEALTH_ROUTES } from "@/data/healthJourneyContent";
import type { BilingualText } from "@/types/chatbot";

export type GuideRoute = { id: string; href: string; title: BilingualText; description: BilingualText; icon: string; category: string; aliases?: BilingualText };

const pages: GuideRoute[] = [
  { id: "home", href: "/", title: { ar: "الرئيسية", en: "Home" }, description: { ar: "الصفحة الرئيسية للمركز", en: "The center home page" }, icon: "home", category: "main" },
  { id: "services", href: "/services", title: { ar: "الخدمات", en: "Services" }, description: { ar: "الخدمات الطبية المتاحة", en: "Available medical services" }, icon: "stethoscope", category: "care" },
  { id: "booking", href: "/booking", title: { ar: "حجز موعد", en: "Book an appointment" }, description: { ar: "إرسال طلب حجز", en: "Send a booking request" }, icon: "calendar", category: "care" },
  { id: "contact", href: "/contact", title: { ar: "تواصل معنا", en: "Contact us" }, description: { ar: "الهاتف والموقع وطرق التواصل", en: "Phone, location, and contact options" }, icon: "headset", category: "center" },
  { id: "medical-minute", href: "/medical-minute", title: { ar: "صحتك في دقيقة", en: "Medical Minute" }, description: { ar: "محتوى صحي قصير", en: "Short health content" }, icon: "play", category: "content" },
  { id: "medical-tips", href: "/medical-tips", title: { ar: "نصائح طبية", en: "Medical Tips" }, description: { ar: "محتوى توعوي عام", en: "General educational content" }, icon: "activity", category: "content" },
  { id: "daily-stories", href: "/daily-stories", title: { ar: "قصص يومية", en: "Daily Stories" }, description: { ar: "قصص صحية يومية", en: "Everyday health stories" }, icon: "quote", category: "content" },
  { id: "videos", href: "/videos", title: { ar: "فيديوهات", en: "Videos" }, description: { ar: "محتوى مرئي", en: "Video content" }, icon: "video", category: "content" },
  { id: "faq", href: "/faq", title: { ar: "الأسئلة الشائعة", en: "FAQ" }, description: { ar: "إجابات عن أسئلة شائعة", en: "Answers to common questions" }, icon: "message", category: "content" },
  { id: "kids", href: "/kids", title: { ar: "العائلة والأطفال", en: "Family & Kids" }, description: { ar: "محتوى وأنشطة للأطفال", en: "Content and activities for children" }, icon: "users", category: "family" },
  { id: "know-yourself", href: "/know-yourself", title: { ar: "اعرف نفسك", en: "Know Yourself" }, description: { ar: "تقييمات تعليمية", en: "Educational assessments" }, icon: "brain", category: "family" },
  { id: "companion", href: HEALTH_ROUTES.hub, title: { ar: "رفيق صحتك", en: "Health Companion" }, description: { ar: "أدوات محلية لتنظيم معلوماتك", en: "Local tools to organize your information" }, icon: "heart-pulse", category: "companion" },
  { id: "blood-pressure", href: HEALTH_ROUTES.bloodPressure, title: { ar: "سجل ضغط الدم", en: "Blood Pressure Log" }, description: { ar: "تسجيل القراءات دون تفسير طبي", en: "Record readings without medical interpretation" }, icon: "heart-pulse", category: "companion" },
  { id: "blood-glucose", href: HEALTH_ROUTES.bloodGlucose, title: { ar: "سجل سكر الدم", en: "Blood Glucose Log" }, description: { ar: "تنظيم قياسات السكر", en: "Organize glucose readings" }, icon: "droplet", category: "companion" },
  { id: "medications", href: HEALTH_ROUTES.medications, title: { ar: "أدويتي", en: "My Medications" }, description: { ar: "تنظيم قائمة الأدوية", en: "Organize a medication list" }, icon: "pill", category: "companion" },
  { id: "visit", href: HEALTH_ROUTES.visit, title: { ar: "الاستعداد للزيارة", en: "Visit Preparation" }, description: { ar: "ترتيب ما تريد مناقشته", en: "Organize what you want to discuss" }, icon: "clipboard", category: "companion" },
  { id: "report", href: HEALTH_ROUTES.report, title: { ar: "ملخص للطبيب", en: "Doctor Summary" }, description: { ar: "ملخص واضح قابل للطباعة", en: "A clear printable summary" }, icon: "file-text", category: "companion" },
  { id: "downloads", href: HEALTH_ROUTES.downloads, title: { ar: "مكتبة النماذج", en: "Resource Library" }, description: { ar: "نماذج وسجلات قابلة للطباعة", en: "Printable forms and logs" }, icon: "download", category: "companion" },
];

export const SERVICE_ROUTES: GuideRoute[] = services.map((service) => ({ id: `service-${service.id}`, href: `/services#${service.id}`, title: service.title, description: service.desc, icon: service.icon, category: "services" }));
export const GUIDE_ROUTES = [...pages, ...SERVICE_ROUTES];
export const routeById = (id: string) => GUIDE_ROUTES.find((route) => route.id === id);
