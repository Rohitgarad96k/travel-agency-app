import { useState, useMemo } from 'react';
import { IndianRupee, TrendingUp, TrendingDown, Wallet, Map, Activity, Calendar } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useAppContext } from '../store/AppContext';

const Dashboard = () => {
  const { trips, expenses } = useAppContext();
  
  const [chartView, setChartView] = useState('monthly');

  const totals = useMemo(() => {
    let totalRev = 0;
    let totalDist = 0;
    let totalExp = 0;

    trips.forEach(trip => {
      totalRev += trip.revenue;
      totalDist += trip.totalKm;
    });

    expenses.forEach(exp => {
      totalExp += exp.totalExpense;
    });

    return {
      revenue: totalRev,
      expenses: totalExp,
      distance: totalDist,
      tripsCount: trips.length
    };
  }, [trips, expenses]);

  const netProfit = totals.revenue - totals.expenses;
  const profitMargin = totals.revenue > 0 ? ((netProfit / totals.revenue) * 100).toFixed(1) : 0;

  const chartData = useMemo(() => {
    const dataMap = {};

    const getGroupInfo = (dateStr, view) => {
      const d = new Date(dateStr);
      const year = d.getFullYear();
      const month = d.getMonth(); 
      const date = d.getDate();

      if (view === 'daily') {
        const sortKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
        const label = d.toLocaleDateString('default', { day: 'numeric', month: 'short' });
        return { sortKey, label };
      }

      if (view === 'weekly') {
        const dayOfWeek = d.getDay();
        const startOfWeek = new Date(d);
        startOfWeek.setDate(date - dayOfWeek);
        const sortKey = `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, '0')}-${String(startOfWeek.getDate()).padStart(2, '0')}`;
        const label = `Week of ${startOfWeek.toLocaleDateString('default', { day: 'numeric', month: 'short' })}`;
        return { sortKey, label };
      }

      if (view === 'quarterly') {
        const quarter = Math.floor(month / 3) + 1;
        const sortKey = `${year}-Q${quarter}`;
        const label = `Q${quarter} ${year}`;
        return { sortKey, label };
      }

      if (view === 'yearly') {
        const sortKey = `${year}`;
        const label = `${year}`;
        return { sortKey, label };
      }

      const sortKey = `${year}-${String(month + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      return { sortKey, label };
    };

    trips.forEach(trip => {
      const { sortKey, label } = getGroupInfo(trip.date, chartView);
      if (!dataMap[sortKey]) {
        dataMap[sortKey] = { sortKey, timeLabel: label, revenue: 0, expenses: 0 };
      }
      dataMap[sortKey].revenue += trip.revenue;
    });

    expenses.forEach(exp => {
      const { sortKey, label } = getGroupInfo(exp.date, chartView);
      if (!dataMap[sortKey]) {
        dataMap[sortKey] = { sortKey, timeLabel: label, revenue: 0, expenses: 0 };
      }
      dataMap[sortKey].expenses += exp.totalExpense;
    });

    return Object.values(dataMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [trips, expenses, chartView]);

  const recentTrips = useMemo(() => {
    return [...trips]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [trips]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 sm:p-3 bg-blue-100 text-blue-600 rounded-lg">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Fleet Overview</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 sm:p-4 bg-indigo-50 text-indigo-600 rounded-full shrink-0">
            <Map className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">Total Distance</p>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{totals.distance} km</h3>
            <p className="text-xs text-gray-400 mt-1 truncate">Across {totals.tripsCount} trips</p>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 sm:p-4 bg-green-50 text-green-600 rounded-full shrink-0">
            <IndianRupee className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">Total Revenue</p>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">₹{totals.revenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 sm:p-4 bg-red-50 text-red-600 rounded-full shrink-0">
            <TrendingDown className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">Total Expenses</p>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">₹{totals.expenses.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 sm:p-4 bg-blue-50 text-blue-600 rounded-full shrink-0">
            <Wallet className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">Net Profit</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">₹{netProfit.toLocaleString()}</h3>
            </div>
            <span className={`text-xs font-medium mt-1 inline-block truncate ${profitMargin >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {profitMargin}% margin
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700">Income & Expense Trends</h2>
            <div className="flex items-center gap-2 w-full sm:w-auto bg-gray-50 p-1 sm:p-0 sm:bg-transparent rounded-lg sm:rounded-none border sm:border-none border-gray-200">
              <Calendar size={18} className="text-gray-500 ml-2 sm:ml-0 shrink-0" />
              <select 
                className="w-full sm:w-auto p-2 border-none sm:border sm:border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-transparent sm:bg-white text-sm cursor-pointer"
                value={chartView}
                onChange={(e) => setChartView(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="h-64 sm:h-80 w-full overflow-hidden shrink-0">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="timeLabel" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                    tickFormatter={(value) => `₹${value}`} 
                    width={60}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '14px' }}
                    formatter={(value) => [`₹${value}`, undefined]}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-center text-gray-400 px-4">
                No data available to display chart. Add some trips!
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6">
            <Activity size={20} className="text-blue-500 shrink-0" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700">Recent Trips</h2>
          </div>
          
          <div className="space-y-3 flex-1">
            {recentTrips.length > 0 ? (
              recentTrips.map((trip) => (
                <div key={trip.id} className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <span className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight">
                      {trip.startLoc} → {trip.endLoc}
                    </span>
                    <span className="text-sm font-semibold text-green-600 shrink-0">
                      +₹{trip.revenue}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                    <span className="shrink-0">{new Date(trip.date).toLocaleDateString()}</span>
                    <span className="truncate ml-2 text-right">{trip.carName.split('(')[0].trim()}</span> 
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400 py-8">
                No recent activity.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;