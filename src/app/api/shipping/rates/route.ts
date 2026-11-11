import { NextRequest, NextResponse } from "next/server";
import { calculateShippingRates } from "@/lib/shipping";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const destinationPostalCode = body.destinationPostalCode || "12190";
    const weightGrams = body.weightGrams || 500;

    const rates = await calculateShippingRates({
      destinationPostalCode,
      weightGrams,
    });

    return NextResponse.json({
      success: true,
      originPostalCode: process.env.ORIGIN_POSTAL_CODE || "12190",
      destinationPostalCode,
      weightGrams,
      rates,
    });
  } catch (error) {
    console.error("[ShippingRates] Error calculating rates:", error);
    return NextResponse.json({ error: "Failed to calculate shipping rates" }, { status: 500 });
  }
}

