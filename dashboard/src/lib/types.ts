export interface BusinessData {
  valencia: {
    status: string;
    clients: number;
    revenue: number;
    progressPercent: number;
    nextMilestone: string;
  };
  trovva: {
    status: string;
    followers: number;
    revenue: number;
    progressPercent: number;
    nextMilestone: string;
    launchDate: string;
  };
  delvrai: {
    status: string;
    clients: number;
    revenue: number;
    progressPercent: number;
    nextMilestone: string;
  };
  totalFollowers: number;
  totalRevenue: number;
  targetMonthly: number;
}
