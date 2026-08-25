import { Driver } from "@/types/explore";
import { DRIVERS } from "@/data/drivers";

export type DriversRepository = {
  getTopRated: () => Promise<Driver[]>;
};

export const driversRepository: DriversRepository = {
  getTopRated: async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return [...DRIVERS].sort((a, b) => b.rating - a.rating) as Driver[];
  },
};
