export type Driver = {
  id: string;
  name: string;
  role: "Driver";
  location: string;
  rating: number;
  trips: number;
  hourlyRate: string;
  image: string;
  isVerified: boolean;
  yearsOnPlatform: string;
  vehicleType: string;
  languages: string;
  about: string;
};

export type FeaturedVehicle = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  pricePerDay: number;
  location: string;
};

export type SectionConfig<T> = {
  id: string;
  title: string;
  data: T[];
  loading: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
  emptyImage?: any;
  seeAllRoute?: string;
  seeAllLabel?: string;
};

export type DriversSection = SectionConfig<Driver>;
export type VehiclesSection = SectionConfig<FeaturedVehicle>;
