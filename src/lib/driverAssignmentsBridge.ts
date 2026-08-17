type AssignmentStatus = "pending" | "accepted" | "declined";

let driverAssignments: {
  driverId: string;
  driverName: string;
  vehicleTitle: string;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
  status: AssignmentStatus;
}[] = [];

export const addDriverAssignment = (assignment: {
  driverId: string;
  driverName: string;
  vehicleTitle: string;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
}) => {
  driverAssignments = [
    { ...assignment, status: "pending" },
    ...driverAssignments,
  ];
};

export const getDriverAssignments = (driverId: string) =>
  driverAssignments.filter((a) => a.driverId === driverId);

export const acceptDriverAssignment = (index: number) => {
  if (driverAssignments[index]?.driverId) {
    driverAssignments[index] = {
      ...driverAssignments[index],
      status: "accepted",
    };
  }
};

export const declineDriverAssignment = (index: number) => {
  if (driverAssignments[index]?.driverId) {
    driverAssignments[index] = {
      ...driverAssignments[index],
      status: "declined",
    };
  }
};

export const clearDriverAssignments = () => {
  driverAssignments = [];
};
