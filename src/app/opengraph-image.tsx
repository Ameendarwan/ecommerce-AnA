import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "@/lib/seo";

export const runtime = "nodejs";
export const alt = SITE.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Auto-generated homepage OG image — light background so WhatsApp shows the logo clearly. */
export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/brand-logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f4ee",
        }}
      >
        <img src={logoSrc} height={280} width={280} alt="" />
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: "#1a3a2a",
            marginTop: 20,
            letterSpacing: "-0.02em",
          }}
        >
          {SITE.name}
        </div>
        <div style={{ fontSize: 26, color: "#5c5c5c", marginTop: 10 }}>
          {SITE.description}
        </div>
      </div>
    ),
    { ...size },
  );
}
