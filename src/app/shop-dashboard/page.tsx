import { DashboardStats } from "./dashboard-stats";

export default function ShopDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <h2 className="text-3xl font-bold font-headline">Welcome back, Shop Manager!</h2>
      </div>
      <DashboardStats />
    </div>
  )
}
