import { FeaturedVehicle } from "@/types/explore";

const FEATURED_VEHICLES = [
  {
    id: "f1",
    title: "Toyota Hilux 2022",
    subtitle: "Double Cab · 4x4 · Ashanti",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    pricePerDay: 169,
  },
  {
    id: "f2",
    title: "Mercedes-Benz C300",
    subtitle: "Luxury sedan · Greater Accra",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    pricePerDay: 220,
  },
  {
    id: "f3",
    title: "Toyota Hiace 2021",
    subtitle: "14-seater bus · Central Region",
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80",
    pricePerDay: 180,
  },
  {
    id: "f4",
    title: "Yamaha YZF-R3",
    subtitle: "Sport motorcycle · Accra",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80",
    pricePerDay: 85,
  },
  {
    id: "f5",
    title: "Ford Ranger 2023",
    subtitle: "Pickup · 4x4 · Eastern Region",
    image: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80",
    pricePerDay: 195,
  },
  {
    id: "f6",
    title: "Honda Accord 2022",
    subtitle: "Sedan · Greater Accra",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
    pricePerDay: 140,
  },
  {
    id: "f7",
    title: "Nissan Patrol 2021",
    subtitle: "SUV · 7 seats · Northern Region",
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
    pricePerDay: 210,
  },
  {
    id: "f8",
    title: "Suzuki GSX-R750",
    subtitle: "Sport bike · Ashanti",
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80",
    pricePerDay: 95,
  },
];

export type VehiclesRepository = {
  getFeatured: () => Promise<FeaturedVehicle[]>;
};

export const vehiclesRepository: VehiclesRepository = {
  getFeatured: async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return [...FEATURED_VEHICLES];
  },
};
