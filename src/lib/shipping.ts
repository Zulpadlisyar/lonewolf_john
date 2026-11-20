export interface ShippingRateOption {
  courier: string;
  service: string;
  description: string;
  cost: number;
  etdDays: string;
}

export interface CalculateShippingParams {
  destinationPostalCode: string;
  weightGrams: number;
}

interface BiteshipPricing {
  courier_name: string;
  courier_service_name: string;
  description: string;
  price: number;
  shipment_duration_range: string;
}

interface BiteshipCouriersResponse {
  pricing?: BiteshipPricing[];
}

/**
 * Standard Jabodetabek & national tariffs, used when no live API key is configured
 * or when the live API is unavailable.
 */
function mockShippingRates(weightGrams: number): ShippingRateOption[] {
  const weightKg = Math.max(1, Math.ceil(weightGrams / 1000));
  return [
    { courier: "JNE", service: "REG", description: "JNE Regular Service", cost: 11000 * weightKg, etdDays: "2-3" },
    { courier: "JNE", service: "YES", description: "JNE Yakin Esok Sampai", cost: 22000 * weightKg, etdDays: "1" },
    { courier: "SiCepat", service: "BEST", description: "SiCepat Besok Sampai Tujuan", cost: 19000 * weightKg, etdDays: "1" },
    { courier: "J&T", service: "EZ", description: "J&T Regular Express", cost: 12000 * weightKg, etdDays: "2-3" },
  ];
}

/**
 * Calculates shipping rates.
 * In free staging or when API key is not yet set, returns realistic Indonesian courier tariffs (JNE, SiCepat, J&T).
 */
export async function calculateShippingRates(
  params: CalculateShippingParams
): Promise<ShippingRateOption[]> {
  const apiKey = process.env.BITESHIP_API_KEY;
  const isMock = !apiKey || apiKey.includes("your-sandbox");

  if (isMock) {
    return mockShippingRates(params.weightGrams);
  }

  // Real Biteship Sandbox API call
  const response = await fetch("https://api.biteship.com/v1/rates/couriers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      origin_postal_code: parseInt(process.env.ORIGIN_POSTAL_CODE || "12190", 10),
      destination_postal_code: parseInt(params.destinationPostalCode, 10),
      couriers: "jne,sicepat,jnt",
      items: [
        {
          name: "Sportswear Apparel",
          value: 350000,
          weight: params.weightGrams,
          quantity: 1,
        },
      ],
    }),
  });

  if (!response.ok) {
    console.warn("[Shipping] Biteship API returned non-200, falling back to mock rates.");
    return mockShippingRates(params.weightGrams);
  }

  const data = (await response.json()) as BiteshipCouriersResponse;
  return (data.pricing ?? []).map((p) => ({
    courier: p.courier_name,
    service: p.courier_service_name,
    description: p.description,
    cost: p.price,
    etdDays: p.shipment_duration_range,
  }));
}
