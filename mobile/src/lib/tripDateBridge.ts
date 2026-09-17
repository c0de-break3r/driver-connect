let pendingVehicleTripDates: {
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
  vehicleId?: string;
  vehicleTitle?: string;
  driverId?: string;
  driverName?: string;
} | null = null;

export const setPendingVehicleTripDates = (dates: {
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
  vehicleId?: string;
  vehicleTitle?: string;
  driverId?: string;
  driverName?: string;
}) => {
  pendingVehicleTripDates = dates;
};

export const getPendingVehicleTripDates = () => pendingVehicleTripDates;

export const clearPendingVehicleTripDates = () => {
  pendingVehicleTripDates = null;
};
