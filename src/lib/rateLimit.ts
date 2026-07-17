// حماية بسيطة من السبام بالذاكرة (in-memory) — مناسبة لحجم حركة متوسط.
// ملاحظة: لو المشروع كبر واحتاج توزيع على أكثر من سيرفر، الأفضل نقل هذا لـ Redis.

const requestLog = new Map<string, number[]>();

export function isRateLimited(
  key: string,
  maxRequests: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(key) || []).filter(
    (t) => now - t < windowMs,
  );

  if (timestamps.length >= maxRequests) {
    requestLog.set(key, timestamps);
    return true;
  }

  timestamps.push(now);
  requestLog.set(key, timestamps);

  // تنظيف دوري بسيط لمنع تسرب الذاكرة
  if (requestLog.size > 5000) {
    const cutoff = now - windowMs;
    for (const entry of Array.from(requestLog.entries())) {
      const [k, v] = entry;
      if (v.every((t) => t < cutoff)) requestLog.delete(k);
    }
  }

  return false;
}

export function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
