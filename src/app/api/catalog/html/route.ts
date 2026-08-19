import { catalogRows } from "@/app/data";

export const runtime = 'edge';

const instagramUrl = "https://www.instagram.com/yasinrou/";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function GET() {
  const rows = catalogRows.map((row) => `
    <tr>
      <td><strong>${escapeHtml(row.model)}</strong></td>
      <td>${escapeHtml(row.power)}</td>
      <td>${escapeHtml(row.voltage)}</td>
      <td>${escapeHtml(row.rpm)}</td>
      <td>${escapeHtml(row.torque)}</td>
      <td><span class="tag ${row.app === "صنعتی" ? "industrial" : "household"}">${escapeHtml(row.app)}</span></td>
      <td>${escapeHtml(row.use)}</td>
      <td>${escapeHtml(row.source)}</td>
      <td>${escapeHtml(row.notes)}</td>
    </tr>`).join("");

  const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="کاتالوگ عمومی موتورهای BLDC خانگی و صنعتی">
  <title>BLDC Map Signal — کاتالوگ محصولات</title>
  <style>
    :root{--ink:#172520;--muted:#66736f;--green:#173f35;--mint:#dff1ea;--paper:#f4f6f5;--line:#dfe5e2;--blue:#336f9e;--red:#b34e45;--pink:#d63872}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font-family:Tahoma,Arial,sans-serif;line-height:1.7}.page{max-width:1160px;margin:auto;padding:28px 18px 64px}
    .hero{position:relative;overflow:hidden;border-radius:28px;background:var(--green);color:#fff;padding:44px;box-shadow:0 22px 55px #173f3524}.hero:after{content:"";position:absolute;left:-70px;top:-100px;width:310px;height:310px;border:55px solid #ffffff08;border-radius:50%}.eyebrow{display:flex;align-items:center;gap:8px;color:#8ed2bb;font-size:11px;font-weight:800;letter-spacing:.08em}.eyebrow i{width:24px;height:1px;background:#8ed2bb}.hero h1{max-width:720px;margin:14px 0 8px;font-size:clamp(28px,5vw,54px);line-height:1.25}.hero p{max-width:720px;margin:0;color:#ffffffa8;font-size:13px}.brand{position:absolute;top:36px;left:40px;text-align:left;font-weight:900}.brand small{display:block;color:#ffffff70;font-size:9px;letter-spacing:.2em}.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px}.button{display:inline-flex;align-items:center;gap:8px;padding:11px 16px;border-radius:11px;background:#fff;color:var(--green);text-decoration:none;font-size:12px;font-weight:900}.button.ghost{background:#ffffff12;border:1px solid #ffffff25;color:#fff}
    .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0}.kpi,.card{border:1px solid var(--line);background:#fff;border-radius:18px}.kpi{padding:18px}.kpi b{display:block;font-size:25px}.kpi span{font-size:10px;color:var(--muted)}
    .section{margin-top:18px}.section-head{display:flex;align-items:end;justify-content:space-between;gap:15px;margin:0 2px 12px}.section-head h2{margin:0;font-size:18px}.section-head p{margin:3px 0 0;color:var(--muted);font-size:10px}.section-head code{font-size:10px;color:#36735f;background:var(--mint);padding:5px 8px;border-radius:7px}
    .models{display:grid;grid-template-columns:1fr 1fr;gap:14px}.model{padding:22px}.model-top{display:flex;align-items:center;justify-content:space-between}.model h3{margin:12px 0 2px;font-size:18px}.model p{margin:0;color:var(--muted);font-size:11px}.model ul{margin:16px 0 0;padding-right:18px;font-size:11px;color:#4e5b57}.tag{display:inline-block;border-radius:99px;padding:4px 9px;font-size:9px;font-weight:900}.household{background:#e7f0f8;color:var(--blue)}.industrial{background:#f9e8e6;color:var(--red)}
    .contact{display:grid;grid-template-columns:1fr auto;align-items:center;gap:20px;padding:24px;background:linear-gradient(125deg,#fff 50%,#fbeaf1);border-color:#efd1dd}.contact-title{display:flex;align-items:center;gap:12px}.ig-icon{display:grid;place-items:center;width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,#833ab4,#e1306c,#f77737);color:#fff;font-size:21px;font-weight:bold}.contact h3{margin:0;font-size:16px}.contact p{margin:5px 0 0;color:var(--muted);font-size:10px}.ig-link{display:inline-block;background:var(--pink);color:#fff;text-decoration:none;padding:11px 16px;border-radius:11px;font-size:11px;font-weight:900;direction:ltr}
    .table-card{overflow:hidden}.table-wrap{overflow:auto}table{width:100%;min-width:970px;border-collapse:collapse;font-size:10px}th{background:#f8faf9;color:#74807c;font-size:9px}th,td{padding:13px 14px;text-align:right;border-bottom:1px solid #e9edeb}tbody tr:hover{background:#fafcfb}.notice{display:flex;gap:8px;align-items:center;padding:13px 16px;color:var(--muted);background:#fafbfb;font-size:9px}.footer{display:flex;justify-content:space-between;gap:20px;margin-top:20px;padding:16px 4px;color:#828c88;font-size:9px}.footer a{color:#33745f}
    @media(max-width:760px){.hero{padding:30px 24px}.brand{position:static;text-align:right;margin-bottom:30px}.kpis{grid-template-columns:1fr 1fr}.models{grid-template-columns:1fr}.contact{grid-template-columns:1fr}.ig-link{text-align:center}.footer{flex-direction:column}}
    @media print{@page{size:A4 landscape;margin:10mm}body{background:#fff}.page{max-width:none;padding:0}.hero{box-shadow:none;padding:28px}.actions{display:none}.kpis{margin:10px 0}.kpi,.card{break-inside:avoid}.section{margin-top:10px}.footer{margin-top:10px}}
  </style>
</head>
<body>
  <main class="page">
    <header class="hero">
      <div class="brand">BLDC MAP SIGNAL<small>MOTORLEAD OS</small></div>
      <div class="eyebrow"><i></i> کاتالوگ عمومی و بازبینی‌شده</div>
      <h1>موتورهای BLDC خانگی و صنعتی</h1>
      <p>تجمیع مشخصات عمومی محصولات، کاربردها و منابع منتخب بازار ایران. تمام مشخصات پیش از سفارش باید مستقیماً با فروشنده تأیید شوند.</p>
      <div class="actions"><a class="button" href="#products">مشاهده مدل‌ها</a><a class="button ghost" href="${instagramUrl}" target="_blank" rel="noopener noreferrer">ارتباط در Instagram · @yasinrou</a></div>
    </header>

    <section class="kpis">
      <div class="kpi"><b>${catalogRows.length}</b><span>مدل در نسخه فعلی</span></div>
      <div class="kpi"><b>۲</b><span>دسته خانگی و صنعتی</span></div>
      <div class="kpi"><b>۱۰۰٪</b><span>نیازمند تأیید انسانی</span></div>
      <div class="kpi"><b>۰</b><span>ادعای تضمین فروش</span></div>
    </section>

    <section class="section">
      <div class="section-head"><div><h2>دامنه محصولات</h2><p>دو مسیر تخصصی با معیارهای متفاوت</p></div><code>Household / Industrial</code></div>
      <div class="models">
        <article class="card model"><div class="model-top"><span class="tag household">HOUSEHOLD</span><strong>12–48 V</strong></div><h3>BLDC خانگی</h3><p>کم‌مصرف، کم‌نویز و مناسب تولید تیراژی</p><ul><li>فن سقفی، ایستاده و هواکش EC</li><li>پمپ آب کوچک و پمپ خورشیدی</li><li>لوازم خانگی و حمل‌ونقل سبک</li></ul></article>
        <article class="card model"><div class="model-top"><span class="tag industrial">INDUSTRIAL</span><strong>220–380 V</strong></div><h3>BLDC صنعتی</h3><p>گشتاور بالا، کنترل دقیق و سفارشی‌سازی</p><ul><li>HVAC، پمپ و نوار نقاله</li><li>FOC، سنسور Hall و Encoder</li><li>رباتیک، اتوماسیون و پروژه‌های سفارشی</li></ul></article>
      </div>
    </section>

    <section class="section card contact">
      <div class="contact-title"><span class="ig-icon">◎</span><div><h3>ارتباط و صفحه اینستاگرام HTI Catalog</h3><p>پروفایل عمومی اعلام‌شده برای معرفی، ارتباط نمایشگاهی و پیگیری کاتالوگ</p></div></div>
      <a class="ig-link" href="${instagramUrl}" target="_blank" rel="noopener noreferrer">instagram.com/yasinrou ↗</a>
    </section>

    <section class="section card" style="padding:22px;background:#f0f7f4;border-color:#c8dfd8">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
        <div>
          <h3 style="margin:0;font-size:15px;color:#173f35">منبع آنالیز RAG: کاتالوگ نیان موتور (Nian Motor)</h3>
          <p style="margin:4px 0 0;font-size:11px;color:#4c625a">شامل مشخصات موتورهای BLDC اینورتردار کولری، تهویه و درایوهای FOC بومی</p>
        </div>
        <a href="https://nianmotor.ir/wp-content/uploads/2025/08/Nian-Motor-Catalog.pdf" target="_blank" rel="noopener noreferrer" style="background:#173f35;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-size:11px;font-weight:bold">دانلود فایل اصلی PDF نیان موتور ↗</a>
      </div>
    </section>

    <section class="section card table-card" id="products">
      <div class="section-head" style="padding:20px 20px 8px"><div><h2>جدول مشخصات محصولات</h2><p>آخرین نسخه تجمیع‌شده از منابع عمومی</p></div><code>${catalogRows.length} MODELS</code></div>
      <div class="table-wrap"><table><thead><tr><th>مدل</th><th>توان</th><th>ولتاژ</th><th>RPM</th><th>گشتاور</th><th>کاربرد</th><th>استفاده متداول</th><th>منبع عمومی</th><th>یادداشت</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="notice">✓ اطلاعات عمومی است — موجودی، قیمت، گواهی‌ها و مشخصات نهایی را با فروشنده بررسی کنید.</div>
    </section>

    <footer class="footer"><span>BLDC Map Signal · HTI Snap Model · نسخه ${new Date().toISOString().slice(0, 10)}</span><a href="${instagramUrl}" target="_blank" rel="noopener noreferrer">Instagram: @yasinrou</a></footer>
  </main>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="bldc-catalog-${new Date().toISOString().slice(0, 10)}.html"`,
      "Cache-Control": "no-store",
    },
  });
}
