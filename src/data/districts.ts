import { StoreSettings } from '../types';

export interface DistrictInfo {
  id: string;
  name: string;
  bnName: string;
  division: string;
  defaultTier: 'dhaka' | 'suburb' | 'outside';
}

export const BANGLADESH_DISTRICTS: DistrictInfo[] = [
  // Dhaka Division
  { id: 'dhaka', name: 'Dhaka', bnName: 'ঢাকা', division: 'Dhaka', defaultTier: 'dhaka' },
  { id: 'gazipur', name: 'Gazipur', bnName: 'গাজীপুর', division: 'Dhaka', defaultTier: 'suburb' },
  { id: 'narayanganj', name: 'Narayanganj', bnName: 'নারায়ণগঞ্জ', division: 'Dhaka', defaultTier: 'suburb' },
  { id: 'savar', name: 'Savar / Keraniganj', bnName: 'সাভার / কেরানীগঞ্জ', division: 'Dhaka', defaultTier: 'suburb' },
  { id: 'faridpur', name: 'Faridpur', bnName: 'ফরিদপুর', division: 'Dhaka', defaultTier: 'outside' },
  { id: 'gopalganj', name: 'Gopalganj', bnName: 'গোপালগঞ্জ', division: 'Dhaka', defaultTier: 'outside' },
  { id: 'kishoreganj', name: 'Kishoreganj', bnName: 'কিশোরগঞ্জ', division: 'Dhaka', defaultTier: 'outside' },
  { id: 'madaripur', name: 'Madaripur', bnName: 'মাদারীপুর', division: 'Dhaka', defaultTier: 'outside' },
  { id: 'manikganj', name: 'Manikganj', bnName: 'মানিকগঞ্জ', division: 'Dhaka', defaultTier: 'outside' },
  { id: 'munshiganj', name: 'Munshiganj', bnName: 'মুন্সীগঞ্জ', division: 'Dhaka', defaultTier: 'outside' },
  { id: 'narsingdi', name: 'Narsingdi', bnName: 'নরসিংদী', division: 'Dhaka', defaultTier: 'outside' },
  { id: 'rajbari', name: 'Rajbari', bnName: 'রাজবাড়ী', division: 'Dhaka', defaultTier: 'outside' },
  { id: 'shariatpur', name: 'Shariatpur', bnName: 'শরীয়তপুর', division: 'Dhaka', defaultTier: 'outside' },
  { id: 'tangail', name: 'Tangail', bnName: 'টাঙ্গাইল', division: 'Dhaka', defaultTier: 'outside' },

  // Chittagong Division
  { id: 'chittagong', name: 'Chittagong', bnName: 'চট্টগ্রাম', division: 'Chittagong', defaultTier: 'outside' },
  { id: 'coxs-bazar', name: "Cox's Bazar", bnName: 'কক্সবাজার', division: 'Chittagong', defaultTier: 'outside' },
  { id: 'cumilla', name: 'Comilla / Cumilla', bnName: 'কুমিল্লা', division: 'Chittagong', defaultTier: 'outside' },
  { id: 'feni', name: 'Feni', bnName: 'ফেনী', division: 'Chittagong', defaultTier: 'outside' },
  { id: 'brahmanbaria', name: 'Brahmanbaria', bnName: 'ব্রাহ্মণবাড়িয়া', division: 'Chittagong', defaultTier: 'outside' },
  { id: 'chandpur', name: 'Chandpur', bnName: 'চাঁদপুর', division: 'Chittagong', defaultTier: 'outside' },
  { id: 'lakshmipur', name: 'Lakshmipur', bnName: 'লক্ষ্মীপুর', division: 'Chittagong', defaultTier: 'outside' },
  { id: 'noakhali', name: 'Noakhali', bnName: 'নোয়াখালী', division: 'Chittagong', defaultTier: 'outside' },
  { id: 'khagrachhari', name: 'Khagrachhari', bnName: 'খাগড়াছড়ি', division: 'Chittagong', defaultTier: 'outside' },
  { id: 'rangamati', name: 'Rangamati', bnName: 'রাঙ্গামাটি', division: 'Chittagong', defaultTier: 'outside' },
  { id: 'bandarban', name: 'Bandarban', bnName: 'বান্দরবান', division: 'Chittagong', defaultTier: 'outside' },

  // Rajshahi Division
  { id: 'rajshahi', name: 'Rajshahi', bnName: 'রাজশাহী', division: 'Rajshahi', defaultTier: 'outside' },
  { id: 'bogura', name: 'Bogra / Bogura', bnName: 'বগুড়া', division: 'Rajshahi', defaultTier: 'outside' },
  { id: 'pabna', name: 'Pabna', bnName: 'পাবনা', division: 'Rajshahi', defaultTier: 'outside' },
  { id: 'sirajganj', name: 'Sirajganj', bnName: 'সিরাজগঞ্জ', division: 'Rajshahi', defaultTier: 'outside' },
  { id: 'naogaon', name: 'Naogaon', bnName: 'নওগাঁ', division: 'Rajshahi', defaultTier: 'outside' },
  { id: 'natore', name: 'Natore', bnName: 'নাটোর', division: 'Rajshahi', defaultTier: 'outside' },
  { id: 'chapainawabganj', name: 'Chapai Nawabganj', bnName: 'চাঁপাইনবাবগঞ্জ', division: 'Rajshahi', defaultTier: 'outside' },
  { id: 'joypurhat', name: 'Joypurhat', bnName: 'জয়পুরহাট', division: 'Rajshahi', defaultTier: 'outside' },

  // Sylhet Division
  { id: 'sylhet', name: 'Sylhet', bnName: 'সিলেট', division: 'Sylhet', defaultTier: 'outside' },
  { id: 'moulvibazar', name: 'Moulvibazar', bnName: 'মৌলভীবাজার', division: 'Sylhet', defaultTier: 'outside' },
  { id: 'habiganj', name: 'Habiganj', bnName: 'হবিগঞ্জ', division: 'Sylhet', defaultTier: 'outside' },
  { id: 'sunamganj', name: 'Sunamganj', bnName: 'সুনামগঞ্জ', division: 'Sylhet', defaultTier: 'outside' },

  // Khulna Division
  { id: 'khulna', name: 'Khulna', bnName: 'খুলনা', division: 'Khulna', defaultTier: 'outside' },
  { id: 'jashore', name: 'Jessore / Jashore', bnName: 'যশোর', division: 'Khulna', defaultTier: 'outside' },
  { id: 'kushtia', name: 'Kushtia', bnName: 'কুষ্টিয়া', division: 'Khulna', defaultTier: 'outside' },
  { id: 'satkhira', name: 'Satkhira', bnName: 'সাতক্ষীরা', division: 'Khulna', defaultTier: 'outside' },
  { id: 'bagerhat', name: 'Bagerhat', bnName: 'বাগেরহাট', division: 'Khulna', defaultTier: 'outside' },
  { id: 'chuadanga', name: 'Chuadanga', bnName: 'চুয়াডাঙ্গা', division: 'Khulna', defaultTier: 'outside' },
  { id: 'jhenaidah', name: 'Jhenaidah', bnName: 'ঝিনাইদহ', division: 'Khulna', defaultTier: 'outside' },
  { id: 'magura', name: 'Magura', bnName: 'মাগুরা', division: 'Khulna', defaultTier: 'outside' },
  { id: 'meherpur', name: 'Meherpur', bnName: 'মেহেরপুর', division: 'Khulna', defaultTier: 'outside' },
  { id: 'narail', name: 'Narail', bnName: 'নড়াইল', division: 'Khulna', defaultTier: 'outside' },

  // Barisal Division
  { id: 'barisal', name: 'Barisal', bnName: 'বরিশাল', division: 'Barisal', defaultTier: 'outside' },
  { id: 'bhola', name: 'Bhola', bnName: 'ভোলা', division: 'Barisal', defaultTier: 'outside' },
  { id: 'barguna', name: 'Barguna', bnName: 'বরগুনা', division: 'Barisal', defaultTier: 'outside' },
  { id: 'jhalokati', name: 'Jhalokati', bnName: 'ঝালকাঠি', division: 'Barisal', defaultTier: 'outside' },
  { id: 'patuakhali', name: 'Patuakhali', bnName: 'পটুয়াখালী', division: 'Barisal', defaultTier: 'outside' },
  { id: 'pirojpur', name: 'Pirojpur', bnName: 'পিরোজপুর', division: 'Barisal', defaultTier: 'outside' },

  // Rangpur Division
  { id: 'rangpur', name: 'Rangpur', bnName: 'রংপুর', division: 'Rangpur', defaultTier: 'outside' },
  { id: 'dinajpur', name: 'Dinajpur', bnName: 'দিনাজপুর', division: 'Rangpur', defaultTier: 'outside' },
  { id: 'gaibandha', name: 'Gaibandha', bnName: 'গাইবান্ধা', division: 'Rangpur', defaultTier: 'outside' },
  { id: 'kurigram', name: 'Kurigram', bnName: 'কুড়িগ্রাম', division: 'Rangpur', defaultTier: 'outside' },
  { id: 'lalmonirhat', name: 'Lalmonirhat', bnName: 'লালমনিরহাট', division: 'Rangpur', defaultTier: 'outside' },
  { id: 'nilphamari', name: 'Nilphamari', bnName: 'নীলফামারী', division: 'Rangpur', defaultTier: 'outside' },
  { id: 'panchagarh', name: 'Panchagarh', bnName: 'পঞ্চগড়', division: 'Rangpur', defaultTier: 'outside' },
  { id: 'thakurgaon', name: 'Thakurgaon', bnName: 'ঠাকুরগাঁও', division: 'Rangpur', defaultTier: 'outside' },

  // Mymensingh Division
  { id: 'mymensingh', name: 'Mymensingh', bnName: 'ময়মনসিংহ', division: 'Mymensingh', defaultTier: 'outside' },
  { id: 'jamalpur', name: 'Jamalpur', bnName: 'জামালপুর', division: 'Mymensingh', defaultTier: 'outside' },
  { id: 'netrokona', name: 'Netrokona', bnName: 'নেত্রকোণা', division: 'Mymensingh', defaultTier: 'outside' },
  { id: 'sherpur', name: 'Sherpur', bnName: 'শেরপুর', division: 'Mymensingh', defaultTier: 'outside' },
];

/**
 * Calculates delivery fee for a specific district based on current settings.
 */
export function getDistrictDeliveryFee(
  districtNameOrId: string,
  settings?: Partial<StoreSettings> | null,
  subtotal: number = 0
): number {
  // Free delivery threshold check (ONLY if admin explicitly enabled free delivery and threshold is satisfied)
  if (
    settings?.isFreeDeliveryEnabled === true &&
    typeof settings?.freeDeliveryThreshold === 'number' &&
    settings.freeDeliveryThreshold > 0 &&
    subtotal >= settings.freeDeliveryThreshold
  ) {
    return 0;
  }

  const query = (districtNameOrId || '').toLowerCase().trim();

  const insideDhakaFee = settings?.deliveryFeeInsideDhaka ?? 60;
  const suburbFee = settings?.deliveryFeeDhakaSuburbs ?? 100;
  const outsideDhakaFee = settings?.deliveryFeeOutsideDhaka ?? 120;

  // 1. Check custom overrides from admin settings if set
  if (settings?.districtFeeOverrides) {
    for (const [key, fee] of Object.entries(settings.districtFeeOverrides)) {
      if (query.includes(key.toLowerCase()) || key.toLowerCase().includes(query)) {
        return Number(fee);
      }
    }
  }

  // 2. Identify district from master list
  const district = BANGLADESH_DISTRICTS.find(
    (d) =>
      d.id === query ||
      d.name.toLowerCase() === query ||
      query.includes(d.name.toLowerCase()) ||
      d.bnName === query ||
      query.includes(d.bnName)
  );

  const chittagongFee = settings?.deliveryFeeChittagong ?? outsideDhakaFee;
  const rajshahiFee = settings?.deliveryFeeRajshahi ?? outsideDhakaFee;
  const sylhetFee = settings?.deliveryFeeSylhet ?? outsideDhakaFee;
  const khulnaFee = settings?.deliveryFeeKhulna ?? outsideDhakaFee;
  const barisalFee = settings?.deliveryFeeBarisal ?? outsideDhakaFee;
  const rangpurFee = settings?.deliveryFeeRangpur ?? outsideDhakaFee;
  const mymensinghFee = settings?.deliveryFeeMymensingh ?? outsideDhakaFee;

  if (district) {
    if (district.id === 'dhaka') return insideDhakaFee;
    if (district.division === 'Chittagong') return chittagongFee;
    if (district.division === 'Rajshahi') return rajshahiFee;
    if (district.division === 'Sylhet') return sylhetFee;
    if (district.division === 'Khulna') return khulnaFee;
    if (district.division === 'Barisal') return barisalFee;
    if (district.division === 'Rangpur') return rangpurFee;
    if (district.division === 'Mymensingh') return mymensinghFee;
    if (district.division === 'Dhaka') return settings?.deliveryFeeDhakaSuburbs ?? suburbFee;
    return outsideDhakaFee;
  }

  // Fallback pattern matching
  if (query.includes('dhaka') || query.includes('ঢাকা')) {
    return insideDhakaFee;
  }
  if (
    query.includes('gazipur') ||
    query.includes('গাজীপুর') ||
    query.includes('narayanganj') ||
    query.includes('নারায়ণগঞ্জ') ||
    query.includes('savar') ||
    query.includes('কেরানীগঞ্জ')
  ) {
    return suburbFee;
  }
  if (query.includes('chittagong') || query.includes('চট্টগ্রাম') || query.includes('comilla') || query.includes('কুমিল্লা')) {
    return chittagongFee;
  }
  if (query.includes('rajshahi') || query.includes('রাজশাহী') || query.includes('bogra') || query.includes('বগুড়া')) {
    return rajshahiFee;
  }
  if (query.includes('sylhet') || query.includes('সিলেট')) {
    return sylhetFee;
  }
  if (query.includes('khulna') || query.includes('খুলনা') || query.includes('jashore') || query.includes('যশোর')) {
    return khulnaFee;
  }
  if (query.includes('barisal') || query.includes('বরিশাল')) {
    return barisalFee;
  }
  if (query.includes('rangpur') || query.includes('রংপুর') || query.includes('dinajpur') || query.includes('দিনাজপুর')) {
    return rangpurFee;
  }
  if (query.includes('mymensingh') || query.includes('ময়মনসিংহ')) {
    return mymensinghFee;
  }

  return outsideDhakaFee;
}
