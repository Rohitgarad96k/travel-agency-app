import { useState, useMemo } from 'react';
import { Plus, Trash2, Map, Pencil, X, Search, Navigation, IndianRupee } from 'lucide-react';
import { useAppContext } from '../store/AppContext';

const Trips = () => {
  const { vehicles, trips, addTrip, deleteTrip, updateTrip } = useAppContext();

  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newTrip, setNewTrip] = useState({
    carId: '',
    date: new Date().toISOString().split('T')[0],
    startLoc: '',
    endLoc: '',
    startKm: '',
    endKm: '',
    pricePerKm: ''
  });

  // 1. Live Calculations
  const totalKm = useMemo(() => {
    const start = Number(newTrip.startKm);
    const end = Number(newTrip.endKm);
    return (end > start && start >= 0) ? end - start : 0;
  }, [newTrip.startKm, newTrip.endKm]);

  const projectedRevenue = useMemo(() => {
    return totalKm * Number(newTrip.pricePerKm || 0);
  }, [totalKm, newTrip.pricePerKm]);

  // 2. Quick Stats for the Top Row
  const stats = useMemo(() => {
    return trips.reduce((acc, trip) => {
      acc.count += 1;
      acc.distance += trip.totalKm;
      acc.revenue += trip.revenue;
      return acc;
    }, { count: 0, distance: 0, revenue: 0 });
  }, [trips]);

  // 3. Search & Sort Logic
  const filteredAndSortedTrips = useMemo(() => {
    return trips
      .filter(trip => 
        trip.startLoc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.endLoc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.carName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [trips, searchTerm]);

  // Submit Handler (Add or Update)
  const handleAddOrUpdateTrip = (e) => {
    e.preventDefault();
    if (!newTrip.carId || !newTrip.startLoc || !newTrip.endLoc || totalKm <= 0) return;

    const selectedCar = vehicles.find(v => v.id === Number(newTrip.carId));

    const tripData = {
      id: editingId ? editingId : Date.now(),
      carId: selectedCar.id,
      carName: selectedCar.name,
      date: newTrip.date,
      startLoc: newTrip.startLoc,
      endLoc: newTrip.endLoc,
      startKm: Number(newTrip.startKm),
      endKm: Number(newTrip.endKm),
      pricePerKm: Number(newTrip.pricePerKm),
      totalKm: totalKm,
      revenue: projectedRevenue
    };

    if (editingId) {
      updateTrip(tripData);
      setEditingId(null);
      
      // Full reset after edit
      setNewTrip({
        carId: '', date: new Date().toISOString().split('T')[0],
        startLoc: '', endLoc: '', startKm: '', endKm: '', pricePerKm: ''
      });
    } else {
      addTrip(tripData);
      
      // Partial reset after adding: keep date, car, and prep the startKm
      setNewTrip(prev => ({
        ...prev,
        startLoc: '',
        endLoc: '',
        startKm: prev.endKm, 
        endKm: ''
      }));
    }
  };

  // Edit Click Handler
  const handleEditClick = (trip) => {
    setEditingId(trip.id);
    setNewTrip({
      carId: trip.carId,
      date: trip.date,
      startLoc: trip.startLoc,
      endLoc: trip.endLoc,
      startKm: trip.startKm,
      endKm: trip.endKm,
      pricePerKm: trip.pricePerKm
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewTrip({
      carId: '', date: new Date().toISOString().split('T')[0],
      startLoc: '', endLoc: '', startKm: '', endKm: '', pricePerKm: ''
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
            <Map className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Trip Entries</h1>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Trips</p>
          <p className="text-lg sm:text-xl font-bold text-gray-800">{stats.count}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500 mb-1">Fleet Distance Logged</p>
          <p className="text-lg sm:text-xl font-bold text-gray-800">{stats.distance.toLocaleString()} km</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-xl shadow-sm border border-indigo-100">
          <p className="text-xs sm:text-sm text-indigo-600 font-medium mb-1">Projected Gross Revenue</p>
          <p className="text-lg sm:text-xl font-bold text-indigo-700">₹{stats.revenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        {/* Form Section */}
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 h-fit xl:sticky xl:top-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
              {editingId ? 'Edit Trip Entry' : 'Record New Trip'}
            </h2>
            {editingId && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-md">
                Editing
              </span>
            )}
          </div>

          <form onSubmit={handleAddOrUpdateTrip} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Select Car</label>
                <select 
                  className="w-full p-2.5 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-sm"
                  value={newTrip.carId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const car = vehicles.find(v => v.id === Number(selectedId));
                    setNewTrip({
                      ...newTrip, 
                      carId: selectedId,
                      pricePerKm: car ? car.rate : ''
                    });
                  }}
                  required
                >
                  <option value="">-- Choose a vehicle --</option>
                  {vehicles.map(car => (
                    <option key={car.id} value={car.id}>{car.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
                <input 
                  type="date" 
                  className="w-full p-2.5 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={newTrip.date}
                  onChange={(e) => setNewTrip({...newTrip, date: e.target.value})}
                  required
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-600 mb-1">From</label>
                <input 
                  type="text" 
                  placeholder="Start Location"
                  className="w-full p-2.5 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={newTrip.startLoc}
                  onChange={(e) => setNewTrip({...newTrip, startLoc: e.target.value})}
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-600 mb-1">To</label>
                <input 
                  type="text" 
                  placeholder="End Location"
                  className="w-full p-2.5 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={newTrip.endLoc}
                  onChange={(e) => setNewTrip({...newTrip, endLoc: e.target.value})}
                  required
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-600 mb-1">Start KM</label>
                <input 
                  type="number" 
                  className="w-full p-2.5 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={newTrip.startKm}
                  onChange={(e) => setNewTrip({...newTrip, startKm: e.target.value})}
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-600 mb-1">End KM</label>
                <input 
                  type="number" 
                  className="w-full p-2.5 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={newTrip.endKm}
                  onChange={(e) => setNewTrip({...newTrip, endKm: e.target.value})}
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Price per KM (₹)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 12"
                  className="w-full p-2.5 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={newTrip.pricePerKm}
                  onChange={(e) => setNewTrip({...newTrip, pricePerKm: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Total Distance:</span>
                <span className="font-semibold text-gray-800">{totalKm} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Projected Revenue:</span>
                <span className="font-bold text-green-600 text-lg">₹{projectedRevenue}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button 
                type="submit" 
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 sm:py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {editingId ? <><Pencil size={18} /> Update</> : <><Plus size={20} /> Save Trip</>}
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

        {/* List Section */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          
          {/* Search Bar */}
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
                    <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap">Date & Route</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap">Vehicle</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap">Distance (KM)</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap">Revenue</th>
                    <th className="p-4 font-semibold text-gray-600 text-center text-sm whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedTrips.map((trip) => (
                    <tr key={trip.id} className={`border-b hover:bg-gray-50 transition-colors ${editingId === trip.id ? 'bg-yellow-50 border-yellow-100' : 'border-gray-50'}`}>
                      <td className="p-4">
                        <div className="font-medium text-gray-800 text-sm line-clamp-2">
                          {trip.startLoc} → {trip.endLoc}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(trip.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                        {trip.carName.split('(')[0].trim()}
                      </td>
                      <td className="p-4 text-sm whitespace-nowrap">
                        <div className="font-medium text-gray-800">{trip.totalKm} km</div>
                        <div className="text-xs text-gray-400 mt-1">({trip.startKm} - {trip.endKm})</div>
                      </td>
                      <td className="p-4 text-green-600 font-semibold whitespace-nowrap">
                        ₹{trip.revenue}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => handleEditClick(trip)}
                            className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Edit Trip"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => deleteTrip(trip.id)}
                            className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Trip"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAndSortedTrips.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <Navigation size={48} className="mb-3 opacity-20" />
                          <p className="text-base font-medium text-gray-500">No trips found</p>
                          <p className="text-sm mt-1">Try adjusting your search or add a new trip.</p>
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

export default Trips;