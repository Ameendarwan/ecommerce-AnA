import { NextResponse } from 'next/server'

/**
 * Polar webhooks disabled — orders are created via COD checkout (placeCodOrder).
 */
export async function POST() {
  return NextResponse.json(
    {
      message:
        'Polar payments are disabled. This store uses Cash on Delivery only.',
    },
    { status: 410 }
  )
}
