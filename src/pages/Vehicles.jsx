import { useState, useMemo } from 'react';
import { Plus, Trash2, CarFront, Search, Pencil, X } from 'lucide-react';
import { useAppContext } from '../store/AppContext'; 

const Vehicles = () => {
  const { vehicles, addVehicle, deleteVehicle, updateVehicle } = useAppContext();

  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newVehicle, setNewVehicle] = useState({ 
    name: '', 
    rate: '', 
    driver: '' 
  });

  // Filter vehicles by search term
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driver.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vehicles, searchTerm]);

  const handleAddOrUpdateVehicle = (e) => {
    e.preventDefault();
    if (!newVehicle.name || !newVehicle.rate) return; 

    const vehicleData = {
      id: editingId ? editingId : Date.now(),
      name: newVehicle.name,
      rate: Number(newVehicle.rate),
      driver: newVehicle.driver || 'Unassigned'
    };

    if (editingId) {
      updateVehicle(vehicleData);
      setEditingId(null);
    } else {
      addVehicle(vehicleData);
    }
    
    setNewVehicle({ name: '', rate: '', driver: '' }); 
  };

  const handleEditClick = (vehicle) => {
    setEditingId(vehicle.id);
    setNewVehicle({
      name: vehicle.name,
      rate: vehicle.rate,
      driver: vehicle.driver !== 'Unassigned' ? vehicle.driver : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewVehicle({ name: '', rate: '', driver: '' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-blue-100 text-blue-600 rounded-lg shrink-0">
            <CarFront className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Vehicle Management</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Form Section */}
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 h-fit lg:sticky lg:top-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
              {editingId ? 'Edit Vehicle' : 'Add New Car'}
            </h2>
            {editingId && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-md">
                Editing
              </span>
            )}
          </div>

          <form onSubmit={handleAddOrUpdateVehicle} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Car Name / Number</label>
              <input 
                type="text" 
                placeholder="e.g. Innova - MH20..." 
                className="w-full p-2.5 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                value={newVehicle.name}
                onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Mileage Rate (₹/km)</label>
              <input 
                type="number" 
                placeholder="e.g. 12" 
                className="w-full p-2.5 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                value={newVehicle.rate}
                onChange={(e) => setNewVehicle({...newVehicle, rate: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Driver Assigned (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Ramesh" 
                className="w-full p-2.5 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                value={newVehicle.driver}
                onChange={(e) => setNewVehicle({...newVehicle, driver: e.target.value})}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 sm:py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {editingId ? <><Pencil size={18} /> Update</> : <><Plus size={20} /> Add Vehicle</>}
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
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Search Bar */}
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
            <Search size={18} className="text-gray-400 ml-2" />
            <input 
              type="text" 
              placeholder="Search by car name or driver..." 
              className="w-full p-2 bg-transparent border-none focus:ring-0 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap">Car Details</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap">Rate (₹/km)</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap">Driver</th>
                    <th className="p-4 font-semibold text-gray-600 text-center text-sm whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className={`border-b hover:bg-gray-50 transition-colors ${editingId === vehicle.id ? 'bg-yellow-50 border-yellow-100' : 'border-gray-50'}`}>
                      <td className="p-4 font-medium text-gray-800 text-sm sm:text-base">{vehicle.name}</td>
                      <td className="p-4 text-green-600 font-semibold text-sm sm:text-base whitespace-nowrap">₹{vehicle.rate}</td>
                      <td className="p-4 text-gray-600 text-sm sm:text-base whitespace-nowrap">
                        {vehicle.driver === 'Unassigned' ? (
                          <span className="text-gray-400 italic text-xs sm:text-sm">Unassigned</span>
                        ) : (
                          vehicle.driver
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => handleEditClick(vehicle)}
                            className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Edit Car"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => deleteVehicle(vehicle.id)}
                            className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Car"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredVehicles.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <CarFront size={48} className="mb-3 opacity-20" />
                          <p className="text-base font-medium text-gray-500">No vehicles found</p>
                          <p className="text-sm mt-1">Try adjusting your search or add a new car.</p>
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

export default Vehicles;