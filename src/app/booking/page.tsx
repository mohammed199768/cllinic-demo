import type { Metadata } from "next";
import BookingStepper from "@/components/BookingStepper";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "احجز الآن | Book Now",
  description: "احجز موعدك مع عيادتنا عبر نموذج حجز متعدّد الخطوات للزيارات داخل المركز.",
  alternates: { canonical: "/booking" },
  openGraph: { title: "احجز الآن | Book Now", url: "/booking" },
};

export default function BookingPage() {
  return (
    <>
      <PageHeader ar="احجز موعدك" en="Book Your Appointment" subAr="خطوات بسيطة لتأكيد طلب حجزك. سنتواصل معك للتأكيد." subEn="Simple steps to submit your booking request. We'll contact you to confirm." icon="calendar" />
      <div className="container-x py-10 lg:pb-28">
        <BookingStepper />
      </div>
    </>
  );
}
