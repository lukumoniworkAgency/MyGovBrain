export type CenterPreview = {
  id: string;
  name: string;
  address: string;
  area: string;
  city: string;
  district: string;
  pincode: string;
  phone: string;
  whatsapp: string;
  rating: number;
  reviewCount: number;
  distance: string;
  status: "Open" | "Closed";
  services: string[];
  hours: Array<{ day: string; time: string }>;
  reviews: Array<{ name: string; rating: number; comment: string }>;
};

/**
 * Presentation-only directory records for the Phase 2 UI.
 * Replace these with a public Supabase center query when the profile API is
 * connected; keeping the data typed now prevents the directory and profile
 * routes from depending on different shapes.
 */
export const centerPreviews: CenterPreview[] = [
  {
    id: "central-assam",
    name: "Central Assam Digital Seva",
    address: "1st Floor, Main Road",
    area: "Uzan Bazar",
    city: "Guwahati",
    district: "Kamrup Metropolitan",
    pincode: "781001",
    phone: "+91 12345 67890",
    whatsapp: "911234567890",
    rating: 4.8,
    reviewCount: 126,
    distance: "0.8 km",
    status: "Open",
    services: [
      "Aadhaar",
      "PAN",
      "Income Certificate",
      "Birth Certificate",
      "Voter ID",
    ],
    hours: [
      { day: "Monday – Friday", time: "9:00 AM – 7:00 PM" },
      { day: "Saturday", time: "9:00 AM – 4:00 PM" },
      { day: "Sunday", time: "Closed" },
    ],
    reviews: [
      {
        name: "Ritumoni B.",
        rating: 5,
        comment:
          "Quick document verification and clear guidance throughout the application.",
      },
      {
        name: "Arjun S.",
        rating: 4,
        comment:
          "Helpful staff and the center kept me updated while my certificate was processed.",
      },
    ],
  },
  {
    id: "city-point",
    name: "City Point e-Mitra",
    address: "Shop 8, Station Road",
    area: "Uzan Bazar",
    city: "Guwahati",
    district: "Kamrup Metropolitan",
    pincode: "781001",
    phone: "+91 12345 67891",
    whatsapp: "911234567891",
    rating: 4.6,
    reviewCount: 84,
    distance: "2.1 km",
    status: "Open",
    services: [
      "Voter ID",
      "Land Records",
      "Banking",
      "PAN",
      "Exam Applications",
    ],
    hours: [
      { day: "Monday – Saturday", time: "9:30 AM – 6:30 PM" },
      { day: "Sunday", time: "Closed" },
    ],
    reviews: [
      {
        name: "Moushumi D.",
        rating: 5,
        comment:
          "The staff explained the land record process and documents very patiently.",
      },
      {
        name: "Rahul D.",
        rating: 4,
        comment:
          "Reliable service and a convenient location near the railway station.",
      },
    ],
  },
  {
    id: "east-link",
    name: "East Link Service Point",
    address: "Ground Floor, East Link Road",
    area: "Uzan Bazar",
    city: "Guwahati",
    district: "Kamrup Metropolitan",
    pincode: "781001",
    phone: "+91 12345 67892",
    whatsapp: "911234567892",
    rating: 4.4,
    reviewCount: 51,
    distance: "3.4 km",
    status: "Closed",
    services: [
      "Aadhaar",
      "Scholarship",
      "Exam Applications",
      "Certificates",
      "e-Shram",
    ],
    hours: [
      { day: "Monday – Friday", time: "10:00 AM – 6:00 PM" },
      { day: "Saturday", time: "10:00 AM – 2:00 PM" },
      { day: "Sunday", time: "Closed" },
    ],
    reviews: [
      {
        name: "Puja M.",
        rating: 4,
        comment: "Helpful for scholarship applications and document guidance.",
      },
      {
        name: "Imtiaz A.",
        rating: 5,
        comment: "Good service experience and a smooth application process.",
      },
    ],
  },
];

export function getCenterPreview(id: string) {
  return centerPreviews.find((center) => center.id === id);
}
