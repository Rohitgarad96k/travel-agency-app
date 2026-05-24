import { useState, useMemo } from 'react';
import { Plus, Trash2, Receipt, Fuel, Pencil, X, Search, Navigation, IndianRupee } from 'lucide-react';
import { useAppContext } from '../store/AppContext';

const Expenses = () => {
  // Pull currentUser to access the custom driver allowance
  const { trips, expenses, addExpense, deleteExpense, updateExpense, currentUser } = useAppContext();

  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Use the custom driver allowance from the profile, default to 300
  const driverAllowanceRate = currentUser?.driverAllowance ?? 300;

  const [newExpense, setNewExpense] = useState({
    tripId: '',
    date: new Date().toISOString().split('T')[0],
    fuel: '',
    tolls: '',
    other: '', // <-- NEW: Other expenses field
    driverPaid: false
  });

  // 1. Live form calculation
  const totalExpense = useMemo(() => {
    const fuelCost = Number(newExpense.fuel || 0);
    const tollsCost = Number(newExpense.tolls || 0);
    const otherCost = Number(newExpense.other || 0);
    const driverCost = newExpense.driverPaid ? driverAllowanceRate : 0;
    return fuelCost + tollsCost + otherCost + driverCost;
  }, [newExpense.fuel, newExpense.tolls, newExpense.other, newExpense.driverPaid, driverAllowanceRate]);

  // 2. Quick Stats for the top of the page (Updated with 'Other')
  const stats = useMemo(() => {
    return expenses.reduce((acc, exp) => {
      acc.fuel += exp.fuel || 0;
      acc.tolls += exp.tolls || 0;
      acc.other += exp.other || 0;
      acc.driver += exp.driverCharge || 0;
      acc.total += exp.totalExpense || 0;
      return acc;
    }, { fuel: 0, tolls: 0, other: 0, driver: 0, total: 0 });
  }, [expenses]);

  // 3. Search Filtering & Smart Sorting
  const filteredAndSortedExpenses = useMemo(() => {
    return expenses
      .filter(exp => exp.tripDetails.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, searchTerm]);

  const handleAddOrUpdateExpense = (e) => {
    e.preventDefault();
    if (!newExpense.tripId) return;

    const selectedTrip = trips.find(t => t.id === Number(newExpense.tripId));

    const expenseData = {
      id: editingId ? editingId : Date.now(), 
      tripId: selectedTrip.id,
      tripDetails: `${selectedTrip.startLoc} → ${selectedTrip.endLoc} (${selectedTrip.carName})`,
      date: newExpense.date,
      fuel: Number(newExpense.fuel || 0),
      tolls: Number(newExpense.tolls || 0),
      other: Number(newExpense.other || 0), // Save to DB
      driverPaid: newExpense.driverPaid,
      driverCharge: newExpense.driverPaid ? driverAllowanceRate : 0,
      totalExpense: totalExpense
    };

    if (editingId) {
      updateExpense(expenseData);
      setEditingId(null);
    } else {
      addExpense(expenseData);
    }
    
    setNewExpense({
      tripId: '',
      date: new Date().toISOString().split('T')[0],
      fuel: '',
      tolls: '',
      other: '',
      driverPaid: false
    });
  };

  const handleEditClick = (expense) => {
    setEditingId(expense.id);
    setNewExpense({
      tripId: expense.tripId,
      date: expense.date,
      fuel: expense.fuel,
      tolls: expense.tolls,
      other: expense.other || '', // Load existing 'other' data safely
      driverPaid: expense.driverPaid
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewExpense({
      tripId: '',
      date: new Date().toISOString().split('T')[0],
      fuel: '',
      tolls: '',
      other: '',
      driverPaid: false
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-red-100 text-red-600 rounded-lg shrink-0">
            <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Expense Tracking</h1>
        </div>
      </div>

      {/* Quick Stats Row - Now 5 Columns */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Fuel</p>
          <p className="text-lg sm:text-xl font-bold text-gray-800">₹{stats.fuel.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Tolls</p>
          <p className="text-lg sm:text-xl font-bold text-gray-800">₹{stats.tolls.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">Misc / Other</p>
          <p className="text-lg sm:text-xl font-bold text-gray-800">₹{stats.other.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">Driver Payouts</p>
          <p className="text-lg sm:text-xl font-bold text-gray-800">₹{stats.driver.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl shadow-sm border border-red-100">
          <p className="text-xs sm:text-sm text-red-600 font-medium mb-1">Overall Expenses</p>
          <p className="text-lg sm:text-xl font-bold text-red-700">₹{stats.total.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Add/Edit Expense Form */}
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 h-fit lg:sticky lg:top-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
              {editingId ? 'Edit Trip Expense' : 'Log Trip Expense'}
            </h2>
            {editingId && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-md">
                Editing
              </span>
            )}
          </div>

          <form onSubmit={handleAddOrUpdateExpense} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Select Trip</label>
              <select 
                className="w-full p-2.5 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none bg-white text-sm"
                value={newExpense.tripId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedTrip = trips.find(t => t.id === Number(selectedId));
                  
                  setNewExpense({
                    ...newExpense, 
                    tripId: selectedId,
                    date: selectedTrip ? selectedTrip.date : new Date().toISOString().split('T')[0]
                  });
                }}
                required
              >
                <option value="">-- Choose a trip --</option>
                {[...trips].sort((a,b) => new Date(b.date) - new Date(a.date)).map(trip => (
                  <option key={trip.id} value={trip.id}>
                    {new Date(trip.date).toLocaleDateString()} | {trip.startLoc} → {trip.endLoc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Expense Date</label>
              <input 
                type="date" 
                readOnly
                className="w-full p-2.5 sm:p-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed outline-none text-sm"
                value={newExpense.date}
                title="Date is locked to match the selected trip"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <Fuel size={14} /> Fuel (₹)
                </label>
                <input 
                  type="number" 
                  placeholder="0"
                  className="w-full p-2.5 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                  value={newExpense.fuel}
                  onChange={(e) => setNewExpense({...newExpense, fuel: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Tolls (₹)</label>
                <input 
                  type="number" 
                  placeholder="0"
                  className="w-full p-2.5 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                  value={newExpense.tolls}
                  onChange={(e) => setNewExpense({...newExpense, tolls: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Misc / Other (₹)</label>
                <input 
                  type="number" 
                  placeholder="0"
                  className="w-full p-2.5 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                  value={newExpense.other}
                  onChange={(e) => setNewExpense({...newExpense, other: e.target.value})}
                />
              </div>
            </div>

            {/* Driver Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 mt-2">
              <div className="pr-2">
                <p className="text-sm font-medium text-gray-700">Driver Allowance</p>
                <p className="text-xs text-gray-500 leading-tight mt-0.5">Add ₹{driverAllowanceRate} daily charge</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={newExpense.driverPaid}
                  onChange={(e) => setNewExpense({...newExpense, driverPaid: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>

            {/* Live Calculation Box */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-100 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 font-medium">Total Expense:</span>
                <span className="font-bold text-red-600 text-xl">₹{totalExpense}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button 
                type="submit" 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 sm:py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {editingId ? <><Pencil size={18} /> Update</> : <><Plus size={20} /> Save</>}
              </button>
              
              {editingId && (
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-2.5 sm:py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <X size={18} /> Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Expense List Table */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
            <Search size={18} className="text-gray-400 ml-2" />
            <input 
              type="text" 
              placeholder="Search by route or vehicle..." 
              className="w-full p-2 bg-transparent border-none focus:ring-0 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap">Trip Details</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap">Breakdown</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap">Driver</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap">Total</th>
                    <th className="p-4 font-semibold text-gray-600 text-center text-sm whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedExpenses.map((exp) => (
                    <tr key={exp.id} className={`border-b hover:bg-gray-50 transition-colors ${editingId === exp.id ? 'bg-yellow-50 border-yellow-100' : 'border-gray-50'}`}>
                      <td className="p-4">
                        <div className="font-medium text-gray-800 text-sm line-clamp-2">{exp.tripDetails}</div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(exp.date).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-1"><Fuel size={12} className="text-gray-400"/> ₹{exp.fuel}</div>
                        <div className="flex items-center gap-1 mt-1"><Navigation size={12} className="text-gray-400"/> ₹{exp.tolls}</div>
                        {exp.other > 0 && (
                          <div className="flex items-center gap-1 mt-1"><Plus size={12} className="text-gray-400"/> ₹{exp.other}</div>
                        )}
                      </td>
                      <td className="p-4 text-sm">
                        {exp.driverPaid ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 whitespace-nowrap">
                            Paid (₹{exp.driverCharge})
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 whitespace-nowrap">
                            N/A
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-red-600 font-semibold whitespace-nowrap">₹{exp.totalExpense}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => handleEditClick(exp)}
                            className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Edit Expense"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => deleteExpense(exp.id)}
                            className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Expense"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAndSortedExpenses.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <Receipt size={48} className="mb-3 opacity-20" />
                          <p className="text-base font-medium text-gray-500">No expenses found</p>
                          <p className="text-sm mt-1">Try adjusting your search or add a new log.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;