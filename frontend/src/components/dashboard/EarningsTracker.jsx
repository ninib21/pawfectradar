import { Card as CardIcon, CardContent as CardContentIcon, CardHeader as CardHeaderIcon, CardTitle as CardTitleIcon, CheckCircle as CheckCircleIcon, DollarSign as DollarSignIcon, TrendingUp as TrendingUpIcon } from '@/lib/icons.js';

export default function EarningsTracker({ bookings }) {
  const calculateEarnings = () => {
    let total = 0;
    let pending = 0;
    let completedLast30Days = 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    bookings.forEach(b => {
      if (b.status === 'completed') {
        total += b.total_amount;
        if (new Date(b.end_date) > thirtyDaysAgo) {
          completedLast30Days += b.total_amount;
        }
      } else if (b.status === 'accepted' || b.status === 'in_progress') {
        pending += b.total_amount;
      }
    });

    return { total, pending, completedLast30Days };
  };

  const { total, pending, completedLast30Days } = calculateEarnings();

  return (
    <CardIcon className="shadow-lg border-0 bg-gradient-to-br from-[#A2D4F5]/10 to-[#FBC3D2]/10">
      <CardHeaderIcon>
        <CardTitleIcon className="flex items-center gap-2 text-xl">
          <DollarSignIcon className="w-5 h-5" />
          My Earnings
        </CardTitleIcon>
      </CardHeaderIcon>
      <CardContentIcon className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
            <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Total Completed</span>
            </div>
            <span className="font-bold text-lg text-green-800">${total.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
            <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Pending Bookings</span>
            </div>
            <span className="font-bold text-lg text-blue-800">${pending.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
            <div className="flex items-center gap-2">
                <TrendingUpIcon className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Last 30 Days</span>
            </div>
            <span className="font-bold text-lg text-yellow-800">${completedLast30Days.toFixed(2)}</span>
        </div>
      </CardContentIcon>
    </CardIcon>
  );
}