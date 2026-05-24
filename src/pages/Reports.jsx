import { useState, useMemo } from 'react';
import { BarChart3, Filter, Car, Printer, FileSpreadsheet, CalendarDays, Map, FileSearch } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import * as XLSX from 'xlsx';

const Reports = () => {
  const { vehicles, trips, expenses } = useAppContext();

  // State for our filters
  const [timeFilter, setTimeFilter] = useState('all_time');
  const [carFilter, setCarFilter] = useState('all');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const isWithinTimeframe = (dateString, timeframe) => {
    if (timeframe === 'all_time') return true;
    
    const itemDate = new Date(dateString);
    const today = new Date();

    if (timeframe === 'daily') {
      return itemDate.toDateString() === today.toDateString();
    }
    if (timeframe === 'monthly') {
      return itemDate.getMonth() === today.getMonth() && 
             itemDate.getFullYear() === today.getFullYear();
    }
    if (timeframe === 'yearly') {
      return itemDate.getFullYear() === today.getFullYear();
    }
    
    if (timeframe === 'custom') {
      if (!startDate || !endDate) return true; 
      const itemTime = itemDate.getTime();
      const startTime = new Date(startDate).getTime();
      const endTime = new Date(endDate).getTime();
      return itemTime >= startTime && itemTime <= endTime;
    }
    return true;
  };

  // 1. CAR-WISE AGGREGATION
  const aggregatedReports = useMemo(() => {
    const filteredTrips = trips.filter(t => isWithinTimeframe(t.date, timeFilter));
    const filteredExpenses = expenses.filter(e => isWithinTimeframe(e.date, timeFilter));

    let reports = vehicles.map(car => {
      const carTrips = filteredTrips.filter(t => t.carId === car.id);
      const tripIds = carTrips.map(t => t.id);
      const carExpenses = filteredExpenses.filter(e => tripIds.includes(e.tripId));

      const totalTrips = carTrips.length;
      const totalKm = carTrips.reduce((sum, t) => sum + t.totalKm, 0);
      const totalRevenue = carTrips.reduce((sum, t) => sum + t.revenue, 0);
      const totalExpenses = carExpenses.reduce((sum, e) => sum + e.totalExpense, 0);

      return {
        id: car.id,
        name: car.name,
        trips: totalTrips,
        totalKm: totalKm,
        revenue: totalRevenue,
        expenses: totalExpenses
      };
    });

    if (carFilter !== 'all') {
      reports = reports.filter(car => car.id === Number(carFilter));
    }

    if (timeFilter !== 'all_time' && carFilter === 'all') {
      reports = reports.filter(car => car.trips > 0);
    }

    return reports;
  }, [vehicles, trips, expenses, timeFilter, carFilter, startDate, endDate]);

  // 2. INDIVIDUAL TRIP DETAILS AGGREGATION
  const detailedTrips = useMemo(() => {
    let filtered = trips.filter(t => isWithinTimeframe(t.date, timeFilter));
    
    if (carFilter !== 'all') {
      filtered = filtered.filter(t => t.carId === Number(carFilter));
    }

    return filtered.map(trip => {
      const tripExpenses = expenses.filter(e => e.tripId === trip.id);
      const totalTripExpense = tripExpenses.reduce((sum, e) => sum + e.totalExpense, 0);
      
      return {
        ...trip,
        totalExpense: totalTripExpense,
        netProfit: trip.revenue - totalTripExpense
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [trips, expenses, timeFilter, carFilter, startDate, endDate]);


  // Calculate totals for the top summary cards
  const totals = useMemo(() => {
    return aggregatedReports.reduce((acc, car) => {
      acc.trips += car.trips;
      acc.km += car.totalKm;
      acc.revenue += car.revenue;
      acc.expenses += car.expenses;
      return acc;
    }, { trips: 0, km: 0, revenue: 0, expenses: 0 });
  }, [aggregatedReports]);

  const totalProfit = totals.revenue - totals.expenses;

  // EXCEL EXPORT 
  const handleExportExcel = () => {
    const carExcelData = aggregatedReports.map(car => ({
      'Vehicle Details': car.name,
      'Trips Run': car.trips,
      'Total KM': `${car.totalKm} km`,
      'Revenue (₹)': car.revenue,
      'Expenses (₹)': car.expenses,
      'Net Profit (₹)': car.revenue - car.expenses
    }));

    carExcelData.push({
      'Vehicle Details': 'GRAND TOTAL',
      'Trips Run': totals.trips,
      'Total KM': `${totals.km} km`,
      'Revenue (₹)': totals.revenue,
      'Expenses (₹)': totals.expenses,
      'Net Profit (₹)': totalProfit
    });

    const tripExcelData = detailedTrips.map(trip => ({
      'Date': new Date(trip.date).toLocaleDateString(),
      'Vehicle': trip.carName,
      'Route': `${trip.startLoc} → ${trip.endLoc}`,
      'Distance': `${trip.totalKm} km`,
      'Revenue (₹)': trip.revenue,
      'Expenses (₹)': trip.totalExpense,
      'Net Profit (₹)': trip.netProfit
    }));

    const workbook = XLSX.utils.book_new();
    const carWorksheet = XLSX.utils.json_to_sheet(carExcelData);
    const tripWorksheet = XLSX.utils.json_to_sheet(tripExcelData);
    
    XLSX.utils.book_append_sheet(workbook, carWorksheet, "Car Summary");
    XLSX.utils.book_append_sheet(workbook, tripWorksheet, "Trip Details"); 
    
    XLSX.writeFile(workbook, `Travel_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 print:m-0 print:p-0 print:max-w-full print:w-full">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-purple-100 text-purple-600 rounded-lg shrink-0">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Financial Reports</h1>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleExportExcel}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 sm:py-2.5 rounded-lg hover:bg-green-100 transition-colors shadow-sm text-sm sm:text-base font-medium"
          >
            <FileSpreadsheet size={18} /> <span className="hidden sm:inline">Export</span> Excel
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 sm:py-2.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm sm:text-base font-medium"
          >
            <Printer size={18} /> Print <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Print-Only Header */}
      <div className="hidden print:block mb-8 pb-4 border-b-2 border-gray-800">
        <h1 className="text-3xl font-bold text-gray-800">Travel Agency - Financial Report</h1>
        <p className="text-gray-500 mt-2">
          {timeFilter === 'custom' && startDate && endDate 
            ? `Report Period: ${startDate} to ${endDate}`
            : `Generated on: ${new Date().toLocaleDateString()}`
          }
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-4 sm:gap-6 print:hidden">
        <div className="flex items-center gap-2 text-gray-600 font-medium shrink-0 hidden sm:flex">
          <Filter size={18} /> Filters:
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1 sm:flex-none">
          <label className="text-xs sm:text-sm text-gray-500 font-medium sm:font-normal">Timeframe:</label>
          <select 
            className="w-full sm:w-auto p-2.5 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white text-sm"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="all_time">All Time</option>
            <option value="daily">Today (Daily)</option>
            <option value="monthly">This Month</option>
            <option value="yearly">This Year</option>
            <option value="custom">Custom Date Range</option>
          </select>
        </div>

        {timeFilter === 'custom' && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-gray-50 p-2 sm:p-1 rounded-lg border border-gray-200 flex-1 sm:flex-none w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-gray-400 shrink-0 hidden sm:block ml-2" />
              <input 
                type="date" 
                className="w-full sm:w-auto p-1.5 bg-transparent border sm:border-none border-gray-300 rounded sm:rounded-none focus:ring-1 focus:ring-purple-500 text-sm text-gray-700 outline-none"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <span className="text-gray-400 text-sm font-medium text-center hidden sm:inline">to</span>
            <input 
              type="date" 
              className="w-full sm:w-auto p-1.5 bg-transparent border sm:border-none border-gray-300 rounded sm:rounded-none focus:ring-1 focus:ring-purple-500 text-sm text-gray-700 outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 sm:ml-auto flex-1 sm:flex-none w-full sm:w-auto">
          <label className="text-xs sm:text-sm text-gray-500 font-medium sm:font-normal">Vehicle:</label>
          <select 
            className="w-full sm:w-auto p-2.5 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white text-sm"
            value={carFilter}
            onChange={(e) => setCarFilter(e.target.value)}
          >
            <option value="all">All Vehicles (Fleet)</option>
            {vehicles.map(car => (
              <option key={car.id} value={car.id}>{car.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Aggregate Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 print:mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 print:border-gray-400 print:shadow-none flex flex-col justify-center">
          <p className="text-xs sm:text-sm text-gray-500 mb-1 print:text-black">Total Trips</p>
          <p className="text-lg sm:text-xl font-bold text-gray-800 print:text-black truncate">{totals.trips}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 print:border-gray-400 print:shadow-none flex flex-col justify-center">
          <p className="text-xs sm:text-sm text-gray-500 mb-1 print:text-black">Total Distance</p>
          <p className="text-lg sm:text-xl font-bold text-gray-800 print:text-black truncate">{totals.km} km</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 print:border-gray-400 print:shadow-none flex flex-col justify-center">
          <p className="text-xs sm:text-sm text-gray-500 mb-1 print:text-black">Generated Revenue</p>
          <p className="text-lg sm:text-xl font-bold text-green-600 print:text-black truncate">₹{totals.revenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 print:border-gray-400 print:shadow-none flex flex-col justify-center">
          <p className="text-xs sm:text-sm text-gray-500 mb-1 print:text-black">Net Profit</p>
          <p className="text-lg sm:text-xl font-bold text-blue-600 print:text-black truncate">₹{totalProfit.toLocaleString()}</p>
        </div>
      </div>

      {/* TABLE 1: Car-wise Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:border-none print:shadow-none print:mb-8">
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-2 print:hidden">
          <Car size={18} className="text-gray-500 shrink-0" />
          <h2 className="font-semibold text-gray-700 text-sm sm:text-base">Car-wise Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse print:border print:border-gray-400">
            <thead>
              <tr className="border-b border-gray-200 text-xs sm:text-sm text-gray-500 print:bg-gray-100 print:text-black print:border-b-2 print:border-gray-800">
                <th className="p-4 font-medium whitespace-nowrap print:py-2">Vehicle Details</th>
                <th className="p-4 font-medium whitespace-nowrap print:py-2">Trips Run</th>
                <th className="p-4 font-medium whitespace-nowrap print:py-2">Total KM</th>
                <th className="p-4 font-medium whitespace-nowrap print:py-2">Revenue</th>
                <th className="p-4 font-medium whitespace-nowrap print:py-2">Expenses</th>
                <th className="p-4 font-medium whitespace-nowrap print:py-2">Net Profit</th>
              </tr>
            </thead>
            <tbody>
              {aggregatedReports.map((car) => {
                const profit = car.revenue - car.expenses;
                return (
                  <tr key={car.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors print:border-gray-300 print:border-b">
                    <td className="p-4 font-medium text-gray-800 text-sm sm:text-base whitespace-nowrap print:text-black print:py-2">{car.name}</td>
                    <td className="p-4 text-gray-600 text-sm sm:text-base print:text-black print:py-2">{car.trips}</td>
                    <td className="p-4 text-gray-600 text-sm sm:text-base print:text-black print:py-2">{car.totalKm} km</td>
                    <td className="p-4 text-gray-800 text-sm sm:text-base print:text-black print:py-2">₹{car.revenue.toLocaleString()}</td>
                    <td className="p-4 text-red-500 text-sm sm:text-base print:text-black print:py-2">₹{car.expenses.toLocaleString()}</td>
                    <td className="p-4 font-bold text-green-600 text-sm sm:text-base print:text-black print:py-2">₹{profit.toLocaleString()}</td>
                  </tr>
                );
              })}
              {aggregatedReports.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center print:text-black">
                    <div className="flex flex-col items-center justify-center text-gray-400 print:hidden">
                      <FileSearch size={48} className="mb-3 opacity-20" />
                      <p className="text-base font-medium text-gray-500">No data found</p>
                      <p className="text-sm mt-1">Try adjusting your filters.</p>
                    </div>
                    <span className="hidden print:inline">No data available for the selected dates.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLE 2: Detailed Trip Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:border-none print:shadow-none print:mt-12">
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-2 print:hidden">
          <Map size={18} className="text-gray-500 shrink-0" />
          <h2 className="font-semibold text-gray-700 text-sm sm:text-base">Detailed Trip Breakdown</h2>
        </div>
        
        <div className="hidden print:block mb-4">
          <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-800 pb-2">Detailed Trip Breakdown</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse print:border print:border-gray-400">
            <thead>
              <tr className="border-b border-gray-200 text-xs sm:text-sm text-gray-500 print:bg-gray-100 print:text-black print:border-b-2 print:border-gray-800">
                <th className="p-4 font-medium whitespace-nowrap print:py-2">Date</th>
                <th className="p-4 font-medium whitespace-nowrap min-w-[150px] print:py-2">Route</th>
                <th className="p-4 font-medium whitespace-nowrap print:py-2">Vehicle</th>
                <th className="p-4 font-medium whitespace-nowrap print:py-2">Revenue</th>
                <th className="p-4 font-medium whitespace-nowrap print:py-2">Expenses</th>
                <th className="p-4 font-medium whitespace-nowrap print:py-2">Net Profit</th>
              </tr>
            </thead>
            <tbody>
              {detailedTrips.map((trip) => (
                <tr key={trip.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors print:border-gray-300 print:border-b">
                  <td className="p-4 text-gray-800 text-sm sm:text-base whitespace-nowrap print:text-black print:py-2">
                    {new Date(trip.date).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-gray-800 font-medium text-sm sm:text-base print:text-black print:py-2">
                    {trip.startLoc} → {trip.endLoc}
                    <div className="text-xs text-gray-500 font-normal">{trip.totalKm} km</div>
                  </td>
                  <td className="p-4 text-gray-600 text-sm sm:text-base whitespace-nowrap print:text-black print:py-2">
                    {trip.carName.split('(')[0].trim()}
                  </td>
                  <td className="p-4 text-gray-800 text-sm sm:text-base print:text-black print:py-2">₹{trip.revenue.toLocaleString()}</td>
                  <td className="p-4 text-red-500 text-sm sm:text-base print:text-black print:py-2">₹{trip.totalExpense.toLocaleString()}</td>
                  <td className="p-4 font-bold text-green-600 text-sm sm:text-base print:text-black print:py-2">₹{trip.netProfit.toLocaleString()}</td>
                </tr>
              ))}
              {detailedTrips.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center print:text-black">
                    <div className="flex flex-col items-center justify-center text-gray-400 print:hidden">
                      <Map size={48} className="mb-3 opacity-20" />
                      <p className="text-base font-medium text-gray-500">No trips logged</p>
                      <p className="text-sm mt-1">Try expanding your timeframe filter.</p>
                    </div>
                    <span className="hidden print:inline">No trips found for the selected filters.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Reports;