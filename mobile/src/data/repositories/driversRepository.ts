import { Driver } from "@/types/explore";
import { DRIVERS } from "@/data/drivers";
import { sortByProximity } from "@/lib/location";

export type DriversRepository = {
  getTopRated: (userRegion?: string) => Promise<Driver[]>;
};

export const driversRepository: DriversRepository = {
  getTopRated: async (userRegion?: string) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const sorted = sortByProximity([...DRIVERS], userRegion ?? "");
    return sorted as Driver[];
  },
};
