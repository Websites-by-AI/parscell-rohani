import type { Seller } from "./data";

/**
 * Sample pricing & cost analysis (public-approximation, demo only).
 * Prices are heuristic estimates per watt based on the seller's region and
 * class — not real quotes. Always verify with the seller.
 */

export interface PriceInfo {
  perWatt: string;
  unitEstimate: string;
  savingPct: number;
  bulkNote: string;
  tier: "low" | "mid" | "high";
}

function isChina(s: Seller): boolean {
  return (
    (s.country ?? "").includes("چین") ||
    /[\u4e00-\u9fff]/.test(s.name) ||
    ["Shenzhen", "Dongguan", "Guangzhou", "Foshan", "Zhongshan", "Zhuhai", "Huizhou",
      "Shantou", "Xiamen", "Fuzhou", "Quanzhou", "Hangzhou", "Ningbo", "Wenzhou",
      "Taizhou", "Jinhua", "Jiaxing", "Shaoxing", "Huzhou", "Suzhou", "Wuxi",
      "Changzhou", "Nanjing", "Nantong", "Yangzhou", "Shanghai", "Qingdao", "Jinan",
      "Yantai", "Weihai", "Weifang", "Tianjin", "Beijing", "Shijiazhuang", "Baoding",
      "Zhengzhou", "Luoyang", "Wuhan", "Changsha", "Zhuzhou", "Hefei", "Wuhu",
      "Nanchang", "Chengdu", "Chongqing", "Xi'an", "Lanzhou", "Shenyang", "Dalian",
      "Harbin", "Changchun", "Kunming", "Guiyang", "Nanning", "Taiyuan", "Hohhot",
      "Urumqi"].includes(s.city.split(" ")[0])
  );
}

const PREMIUM_COUNTRIES = ["United States", "Germany", "Switzerland", "United Kingdom", "France", "Netherlands", "Italy", "Japan"];

export function priceInfo(s: Seller): PriceInfo {
  const kw = Math.max(0.02, s.powerMax / 1000);
  let perW: [number, number];
  let savingPct: number;
  let tier: PriceInfo["tier"];

  if (isChina(s)) {
    perW = [0.55, 0.95];
    savingPct = 24 + (s.score % 14);
    tier = "low";
  } else if ((s.country ?? "ایران") === "ایران") {
    perW = [0.9, 1.55];
    savingPct = 12 + (s.score % 10);
    tier = "mid";
  } else if (PREMIUM_COUNTRIES.includes(s.country ?? "")) {
    perW = [2.2, 3.8];
    savingPct = 8 + (s.score % 8);
    tier = "high";
  } else {
    perW = [1.1, 2.0];
    savingPct = 15 + (s.score % 9);
    tier = "mid";
  }

  const unitLow = Math.round(perW[0] * kw * 1000);
  const unitHigh = Math.round(perW[1] * kw * 1000);
  const bulkNote =
    tier === "low"
      ? `خرید عمده از ${s.country ?? "منطقه"} تا ${savingPct}٪ کاهش هزینه نسبت به تولید اروپا`
      : tier === "high"
        ? "کیفیت/گارانتی بالا — صرفه با سفارش سری و قرارداد بلندمدت"
        : `تولید محلی — تا ${savingPct}٪ صرفه‌جویی با سفارش عمده`;

  return {
    perWatt: `$${perW[0]}–${perW[1]} / W`,
    unitEstimate: unitLow === unitHigh ? `$${unitLow}` : `$${unitLow}–${unitHigh}`,
    savingPct,
    bulkNote,
    tier,
  };
}

export function tierLabel(tier: PriceInfo["tier"]): string {
  return tier === "low" ? "قیمت رقابتی" : tier === "high" ? "پریمیوم" : "متوسط";
}
