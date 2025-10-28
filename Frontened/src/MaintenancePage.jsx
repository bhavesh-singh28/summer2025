// ===== Maintenance Page =====
const MaintenancePage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white text-center px-6">
      <h1 className="text-5xl font-bold mb-4">🚧 Site Under Maintenance 🚧</h1>
      <p className="text-lg mb-6">
        We’re currently performing scheduled maintenance.
        <br />
        Please check back soon!
      </p>
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400"></div>
    </div>
  );
};
export default MaintenancePage;