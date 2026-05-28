import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AuditLogTable() {
  const { getAuditLogs, getAuditActions, getAuditCollections } = useAuth();
  const [logs, setLogs] = useState([]);
  const [actions, setActions] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    collection: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load filter options
      const [actionsData, collectionsData] = await Promise.all([
        getAuditActions(),
        getAuditCollections()
      ]);
      setActions(actionsData);
      setCollections(collectionsData);
      
      // Load logs with current filters
      const response = await getAuditLogs({
        action: filters.action || undefined,
        collection: filters.collection || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        page: filters.page,
        limit: filters.limit
      });
      
      setLogs(response.logs || []);
      setPagination({
        total: response.total || 0,
        page: response.page || 1,
        pages: response.pages || 0
      });
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleDateChange = (field, date) => {
    setFilters(prev => ({
      ...prev,
      [field]: date,
      page: 1
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  if (loading) {
    return <div className="text-center py-8">Loading audit logs...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-medium mb-4">Filter Audit Logs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="label">
              <span className="label-text">Action</span>
            </label>
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="select select-bordered w-full"
            >
              <option value="">All Actions</option>
              {actions.map(action => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">
              <span className="label-text">Collection</span>
            </label>
            <select
              name="collection"
              value={filters.collection}
              onChange={handleFilterChange}
              className="select select-bordered w-full"
            >
              <option value="">All Collections</option>
              {collections.map(collection => (
                <option key={collection} value={collection}>
                  {collection}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">
              <span className="label-text">Start Date</span>
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">End Date</span>
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => {
              setFilters({
                action: '',
                collection: '',
                startDate: '',
                endDate: '',
                page: 1,
                limit: 50
              });
            }}
            className="btn btn-sm btn-outline"
          >
            Reset Filters
          </button>
          <button
            onClick={loadData}
            className="btn btn-sm btn-primary ml-2"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Date/Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Collection</th>
              <th>Document</th>
              <th className="text-center">Changes</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8">
                  No audit logs found matching the filters.
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log._id}>
                  <td>
                    <div className="text-sm">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                        {log.userName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{log.userName}</div>
                        <div className="text-xs text-gray-500">{log.userRole}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span 
                      className={`badge 
                        ${log.action === 'CREATE' ? 'badge-success' :
                          log.action === 'UPDATE' ? 'badge-warning' :
                          log.action === 'DELETE' ? 'badge-error' :
                          log.action === 'LOGIN' || log.action === 'LOGOUT' ? 'badge-info' :
                          'badge-outline'}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <div className="text-sm">{log.collection}</div>
                    {log.documentName && (
                      <div className="text-xs text-gray-500">{log.documentName}</div>
                    )}
                  </td>
                  <td>
                    {log.documentId ? (
                      <div className="text-sm font-mono">
                        {log.documentId.toString().substring(0, 8)}...
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">N/A</div>
                    )}
                  </td>
                  <td className="text-center">
                    {log.changes && log.changes.length > 0 ? (
                      <button
                        onClick={() => {
                          // This would open a modal showing the diff
                          alert(`Showing changes for ${log.changes.length} field(s)`);
                        }}
                        className="btn btn-sm btn-outline btn-primary"
                      >
                        {log.changes.length}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500">No changes</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
            disabled={pagination.page === 1}
            className="btn btn-sm btn-outline"
          >
            Previous
          </button>
          <div className="text-xs">
            Page {pagination.page} of {pagination.pages}
          </div>
          <button
            onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
            disabled={pagination.page === pagination.pages}
            className="btn btn-sm btn-outline"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}