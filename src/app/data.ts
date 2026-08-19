export type SellerType = "household" | "industrial" | "both";
export type ProductionType = "تولید محلی" | "مونتاژ" | "واردات + مونتاژ";

export type Seller = {
  id: number;
  name: string;
  shortName: string;
  city: string;
  zone: string;
  type: SellerType;
  production: ProductionType;
  products: string[];
  power: string;
  powerMax: number;
  voltage: string;
  voltageClass: "low" | "high";
  score: number;
  catalog: boolean;
  verified: boolean;
  lat: number;
  lng: number;
  mapX: number;
  mapY: number;
  contact: string;
  updated: string;
  source: string;
};

export const sellers: Seller[] = [
  { id: 1, name: "توسعه حرکت HTI", shortName: "HTI", city: "تهران", zone: "شهرک صنعتی شمس‌آباد", type: "industrial", production: "تولید محلی", products: ["موتور گشتاور بالا", "درایو FOC", "سیم‌پیچی سفارشی"], power: "0.75–15 kW", powerMax: 15000, voltage: "220–380 V", voltageClass: "high", score: 92, catalog: true, verified: true, lat: 35.31, lng: 51.43, mapX: 54, mapY: 56, contact: "hti-motors.example", updated: "۲ ساعت پیش", source: "وب‌سایت و کاتالوگ عمومی" },
  { id: 2, name: "پارس فن هوشمند", shortName: "PF", city: "تهران", zone: "جاده مخصوص کرج", type: "household", production: "مونتاژ", products: ["فن سقفی BLDC", "فن ایستاده", "کنترلر کم‌نویز"], power: "25–120 W", powerMax: 120, voltage: "24–48 V", voltageClass: "low", score: 87, catalog: true, verified: true, lat: 35.72, lng: 51.12, mapX: 48, mapY: 50, contact: "parsfan.example", updated: "امروز", source: "دایرکتوری صنعتی عمومی" },
  { id: 3, name: "موتور دقیق آذربایجان", shortName: "MD", city: "تبریز", zone: "شهرک صنعتی شهید سلیمی", type: "industrial", production: "تولید محلی", products: ["موتور صنعتی", "پمپ", "درایو سفارشی"], power: "0.5–7.5 kW", powerMax: 7500, voltage: "220–380 V", voltageClass: "high", score: 84, catalog: true, verified: true, lat: 37.94, lng: 46.12, mapX: 22, mapY: 30, contact: "public listing", updated: "دیروز", source: "نمایشگاه صنعت تبریز" },
  { id: 4, name: "سپاهان درایو", shortName: "SD", city: "اصفهان", zone: "شهرک صنعتی محمودآباد", type: "industrial", production: "واردات + مونتاژ", products: ["درایو صنعتی", "HVAC", "پمپ خورشیدی"], power: "1.1–11 kW", powerMax: 11000, voltage: "220–380 V", voltageClass: "high", score: 81, catalog: true, verified: true, lat: 32.72, lng: 51.63, mapX: 47, mapY: 69, contact: "sepahandrive.example", updated: "۳ روز پیش", source: "صفحه محصول عمومی" },
  { id: 5, name: "توان‌گستر البرز", shortName: "TA", city: "کرج", zone: "شهرک صنعتی بهارستان", type: "both", production: "مونتاژ", products: ["اسکوتر", "پمپ کوچک", "موتور سفارشی"], power: "80 W–2 kW", powerMax: 2000, voltage: "24–220 V", voltageClass: "low", score: 76, catalog: false, verified: false, lat: 35.83, lng: 50.89, mapX: 45, mapY: 49, contact: "شماره عمومی ثبت‌شده", updated: "۶ روز پیش", source: "دایرکتوری کسب‌وکار" },
  { id: 6, name: "کاوه پمپ براشلس", shortName: "KP", city: "ساوه", zone: "شهر صنعتی کاوه", type: "both", production: "واردات + مونتاژ", products: ["پمپ خورشیدی", "پمپ کشاورزی", "کنترلر MPPT"], power: "250 W–5.5 kW", powerMax: 5500, voltage: "48–380 V", voltageClass: "high", score: 79, catalog: true, verified: true, lat: 35.02, lng: 50.36, mapX: 43, mapY: 57, contact: "kavehpump.example", updated: "۴ روز پیش", source: "کاتالوگ عمومی نمایشگاه" },
  { id: 7, name: "قزوین کنترل موتور", shortName: "QC", city: "قزوین", zone: "شهرک صنعتی کاسپین", type: "industrial", production: "تولید محلی", products: ["کنترلر FOC", "اتوماسیون", "برد سنسور هال"], power: "0.37–4 kW", powerMax: 4000, voltage: "48–220 V", voltageClass: "high", score: 88, catalog: true, verified: true, lat: 36.21, lng: 50.04, mapX: 40, mapY: 46, contact: "qazvincontrol.example", updated: "امروز", source: "وب‌سایت فنی عمومی" },
  { id: 8, name: "الکترو فن مرکزی", shortName: "EF", city: "اراک", zone: "شهرک صنعتی خیرآباد", type: "household", production: "مونتاژ", products: ["موتور هواکش", "فن کم‌مصرف", "پمپ خانگی"], power: "20–400 W", powerMax: 400, voltage: "12–48 V", voltageClass: "low", score: 73, catalog: false, verified: true, lat: 34.01, lng: 49.71, mapX: 42, mapY: 63, contact: "public listing", updated: "هفته پیش", source: "اطلاعات عمومی اتحادیه" },
  { id: 9, name: "نقش‌جهان مکاترونیک", shortName: "NM", city: "اصفهان", zone: "شهرک علمی و تحقیقاتی", type: "industrial", production: "تولید محلی", products: ["رباتیک", "سروو BLDC", "انکودر"], power: "200 W–3 kW", powerMax: 3000, voltage: "48–220 V", voltageClass: "high", score: 90, catalog: true, verified: true, lat: 32.71, lng: 51.53, mapX: 50, mapY: 71, contact: "naghshe-mechatronic.example", updated: "امروز", source: "وب‌سایت و پروژه‌های عمومی" },
  { id: 10, name: "آریا حرکت شرق", shortName: "AH", city: "مشهد", zone: "شهرک صنعتی توس", type: "household", production: "واردات + مونتاژ", products: ["دوچرخه برقی", "موتور هاب", "شارژر"], power: "250–750 W", powerMax: 750, voltage: "36–48 V", voltageClass: "low", score: 69, catalog: true, verified: false, lat: 36.45, lng: 59.48, mapX: 78, mapY: 44, contact: "صفحه فروش عمومی", updated: "۹ روز پیش", source: "فروشگاه آنلاین عمومی" },
  { id: 11, name: "پمپ انرژی یزد", shortName: "PE", city: "یزد", zone: "شهرک صنعتی یزد", type: "both", production: "مونتاژ", products: ["پمپ خورشیدی", "بوستر پمپ", "درایو"], power: "400 W–7.5 kW", powerMax: 7500, voltage: "48–380 V", voltageClass: "high", score: 78, catalog: true, verified: true, lat: 31.95, lng: 54.29, mapX: 60, mapY: 73, contact: "pumpenergy.example", updated: "۵ روز پیش", source: "کاتالوگ عمومی" },
  { id: 12, name: "گیلان تهویه سبز", shortName: "GT", city: "رشت", zone: "شهر صنعتی رشت", type: "household", production: "مونتاژ", products: ["فن کویل", "هواکش EC", "فن کم‌صدا"], power: "35–350 W", powerMax: 350, voltage: "24–220 V", voltageClass: "low", score: 82, catalog: true, verified: true, lat: 37.28, lng: 49.58, mapX: 39, mapY: 34, contact: "gilanhvac.example", updated: "۲ روز پیش", source: "وب‌سایت عمومی" },
  { id: 13, name: "نیان موتور (Nian Motor)", shortName: "NIAN", city: "مشهد", zone: "پارک علم و فناوری / توس", type: "both", production: "تولید محلی", products: ["موتور BLDC کولری", "درایو اینورتر FOC", "فن و تهویه کم‌مصرف IE4/IE5"], power: "150 W–1.5 kW", powerMax: 1500, voltage: "180–265 VAC / 48V", voltageClass: "high", score: 95, catalog: true, verified: true, lat: 36.42, lng: 59.51, mapX: 79, mapY: 43, contact: "nianmotor.ir", updated: "ممیزی RAG کاتالوگ 2025", source: "https://nianmotor.ir/wp-content/uploads/2025/08/Nian-Motor-Catalog.pdf" },
];

export const catalogRows = [
  { model: "HF-48/90", power: "90 W", voltage: "48 VDC", rpm: "180–320", torque: "2.8 Nm", app: "خانگی", use: "فن سقفی کم‌نویز", source: "پارس فن هوشمند", notes: "Hall · نمونه مونتاژ محلی" },
  { model: "WP-24/180", power: "180 W", voltage: "24 VDC", rpm: "1,200–2,800", torque: "0.62 Nm", app: "خانگی", use: "پمپ آب کوچک", source: "الکترو فن مرکزی", notes: "IP44 · مشخصات اولیه" },
  { model: "EB-48/500", power: "500 W", voltage: "48 VDC", rpm: "350–520", torque: "9.2 Nm", app: "خانگی", use: "دوچرخه برقی", source: "آریا حرکت شرق", notes: "موتور هاب · وارداتی" },
  { model: "NIAN-550", power: "550 W", voltage: "220 VAC (Inverter)", rpm: "300–1,400", torque: "4.2 Nm", app: "خانگی", use: "کولر آبی کم‌مصرف BLDC", source: "نیان موتور (Nian)", notes: "85%+ Energy Save · FOC Integrated" },
  { model: "NIAN-750", power: "750 W", voltage: "220 VAC (Inverter)", rpm: "300–1,500", torque: "5.8 Nm", app: "خانگی / تهویه", use: "فن صنعتی و کولر BLDC", source: "نیان موتور (Nian)", notes: "IE4/IE5 Level · Sensorless FOC" },
  { model: "HTI-075", power: "0.75 kW", voltage: "220 VAC", rpm: "500–3,000", torque: "7.1 Nm", app: "صنعتی", use: "نوار نقاله", source: "HTI", notes: "FOC · سیم‌پیچی سفارشی" },
  { model: "HTI-550", power: "5.5 kW", voltage: "380 VAC", rpm: "300–2,500", torque: "35 Nm", app: "صنعتی", use: "پمپ و HVAC", source: "HTI", notes: "IP54 · نیازمند تأیید سازنده" },
  { model: "SP-4K", power: "4 kW", voltage: "310 VDC", rpm: "800–3,000", torque: "18 Nm", app: "صنعتی", use: "پمپ خورشیدی", source: "سپاهان درایو", notes: "MPPT · کاتالوگ عمومی" },
];
