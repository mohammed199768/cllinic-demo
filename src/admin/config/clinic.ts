export const CLINIC = {
  nameAr: 'عيادتنا',
  nameEn: 'OurClinic',
  phoneDisplay: '0779667168',
  phoneE164: '+962779667168',
  email: 'mohammed.aldomi68@gmail.com',
  cityAr: 'عمّان',
  cityEn: 'Amman',
  countryAr: 'الأردن',
  countryEn: 'Jordan',
  timezone: 'Asia/Amman',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Amman%2C%20Jordan',
} as const;

export type ClinicIdentity = typeof CLINIC;
