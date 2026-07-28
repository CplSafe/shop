import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/revalidate?secret=...
 *
 * Purges the storefront cache (all pages + their data) so admin-side catalog
 * changes show up immediately. Called by the Medusa backend subscriber on
 * product events — see backend src/subscribers/storefront-revalidate.ts.
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")

  if (!process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { revalidated: false, message: "REVALIDATE_SECRET not configured." },
      { status: 500 }
    )
  }

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { revalidated: false, message: "Invalid secret." },
      { status: 401 }
    )
  }

  // Root layout revalidation invalidates every route and its data cache.
  revalidatePath("/", "layout")

  return NextResponse.json({ revalidated: true, at: new Date().toISOString() })
}
