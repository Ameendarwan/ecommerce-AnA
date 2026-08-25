import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { SITE } from "@/lib/seo";

/** WhatsApp skips preview images above ~300 KB. */
const MAX_OG_BYTES = 300 * 1024;

const ALLOWED_HOSTS = new Set<string>([
  new URL(SITE.url).host,
  ...(process.env.NEXT_PUBLIC_SUPABASE_URL
    ? [new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host]
    : []),
]);

async function serveBrandOgImage() {
  const filePath = path.join(process.cwd(), "public", "og-image.jpg");
  const buffer = await readFile(filePath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
}

/** Same-domain proxy so WhatsApp/Facebook can fetch product images reliably. */
export async function GET(req: NextRequest) {
  const src = req.nextUrl.searchParams.get("src");

  if (!src) return serveBrandOgImage();

  try {
    const url = new URL(src);
    if (!ALLOWED_HOSTS.has(url.host)) return serveBrandOgImage();

    const res = await fetch(src, { next: { revalidate: 86400 } });
    if (!res.ok) return serveBrandOgImage();

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) return serveBrandOgImage();

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength > MAX_OG_BYTES) return serveBrandOgImage();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
      },
    });
  } catch {
    return serveBrandOgImage();
  }
}
