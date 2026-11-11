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
    // 100% Free Mock Tariffs based on standard Jabodetabek & national rates
    const weightKg = Math.max(1, Math.ceil(params.weightGrams / 1000));
    return [
      {
        courier: "JNE",
        service: "REG",
        description: "JNE Regular Service",
        cost: 11000 * weightKg,
        etdDays: "2-3",
      },
      {
        courier: "JNE",
        service: "YES",
        description: "JNE Yakin Esok Sampai",
        cost: 22000 * weightKg,
        etdDays: "1",
      },
      {
        courier: "SiCepat",
        service: "BEST",
        description: "SiCepat Besok Sampai Tujuan",
        cost: 19000 * weightKg,
        etdDays: "1",
      },
      {
        courier: "J&T",
        service: "EZ",
        description: "J&T Regular Express",
        cost: 12000 * weightKg,
        etdDays: "2-3",
      },
    ];
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
    return calculateShippingRates({ ...params, destinationPostalCode: "12190" });
  }

  const data = await response.json();
  return (data.pricing || []).map((p: any) => ({
    courier: p.courier_name,
    service: p.courier_service_name,
    description: p.description,
    cost: p.price,
    etdDays: p.shipment_duration_range,
  }));
}

/**
 * Generates mock or sandbox waybill (resi)
 */
export function generateMockWaybill(courier: string): string {
  const timestamp = Date.now().toString().slice(-6);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `STG-${courier.toUpperCase()}-${timestamp}${randomSuffix}`;
}

