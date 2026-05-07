import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationsAPI, tagsAPI } from '../api';
import StatusBadge from '../components/StatusBadge';
import ApplicationForm from '../components/ApplicationForm';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { Search, LayoutList, LayoutGrid, Plus, X } from 'lucide-react';

const STATUSES = ['All', 'Wishlist', 'Applied', 'Interview', 'Technical Test', 'Offer', 'Accepted', 'Rejected'];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
  const searchRef = useRef('');
  const navigate = useNavigate();

  const openConfirm = (options) => {
    return new Promise((resolve) => {
      setConfirmDialog({ isOpen: true, resolve, ...options });
    });
  };

  const handleConfirmDialogConfirm = () => {
    confirmDialog.resolve?.(true);
    setConfirmDialog({ isOpen: false });
  };

  const handleConfirmDialogCancel = () => {
    confirmDialog.resolve?.(false);
    setConfirmDialog({ isOpen: false });
  };

  useEffect(() => {
    loadApplications();
    tagsAPI.getAll().then((res) => setTags(res.data)).catch(() => {});
  }, []);

  const loadApplications = async (params = {}) => {
    setLoading(true);
    try {
      const res = await applicationsAPI.getAll(params);
      setApplications(res.data.data || res.data);
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    searchRef.current = value;
    loadApplications({
      ...(statusFilter !== 'All' && { status: statusFilter }),
      ...(value && { search: value }),
    });
  };

  const handleFilter = (status) => {
    setStatusFilter(status);
    loadApplications({
      ...(status !== 'All' && { status }),
      ...(searchRef.current && { search: searchRef.current }),
    });
  };

  const handleSave = async (data) => {
    if (editingApp) {
      const res = await applicationsAPI.update(editingApp.id, data);
      setApplications((prev) => prev.map((a) => (a.id === editingApp.id ? res.data : a)));
    } else {
      const res = await applicationsAPI.create(data);
      setApplications((prev) => [res.data, ...prev]);
    }
    setShowForm(false);
    setEditingApp(null);
  };

  const handleDelete = async (id) => {
    const confirmed = await openConfirm({
      title: 'Delete Application',
      message: 'Are you sure you want to delete this application permanently? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'destructive',
    });
    if (!confirmed) return;
    await applicationsAPI.delete(id);
    setApplications((prev) => prev.filter((a) => a.id !== id));
    setShowDetail(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    const res = await applicationsAPI.updateStatus(id, newStatus);
    setApplications((prev) => prev.map((a) => (a.id === id ? res.data : a)));
    if (showDetail?.id === id) setShowDetail(res.data);
  };

  const openEdit = (app) => {
    setEditingApp(app);
    setShowForm(true);
  };

  const filteredApps = applications;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-[20px] tracking-widest dark:text-white">Applications</h1>
        <button
          onClick={() => { setEditingApp(null); setShowForm(true); }}
          className="neu-btn flex items-center gap-2 text-[12px]"
        >
          <Plus className="w-4 h-4" /> New Application
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search company or position..."
            defaultValue={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="neu-input pl-9"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 border-2 rounded-md transition-all ${viewMode === 'list' ? 'border-[#111] dark:border-gray-500 bg-white dark:bg-[#111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)]' : 'border-transparent hover:border-[#111] dark:hover:border-gray-600'}`}
          >
            <LayoutList className="w-4 h-4 dark:text-white" />
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={`p-2 border-2 rounded-md transition-all ${viewMode === 'board' ? 'border-[#111] dark:border-gray-500 bg-white dark:bg-[#111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)]' : 'border-transparent hover:border-[#111] dark:hover:border-gray-600'}`}
          >
            <LayoutGrid className="w-4 h-4 dark:text-white" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => handleFilter(s)}
            className={`px-3 py-1 text-[11px] font-bold rounded-md border-2 transition-all ${
              statusFilter === s
                ? 'border-[#111] dark:border-gray-500 bg-[#111] dark:bg-white text-white dark:text-[#111]'
                : 'border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-[#111] dark:hover:border-gray-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-[#111] dark:text-white font-bold">Loading...</div>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-600 text-[14px]">No applications found</div>
          <button onClick={() => { setEditingApp(null); setShowForm(true); }} className="mt-4 neu-btn-outline text-[12px]">
            Add your first application
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="neu-card overflow-hidden">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b-2 border-[#111] dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1a]">
                <th className="text-left p-3 font-bold text-gray-500 dark:text-gray-400">Company</th>
                <th className="text-left p-3 font-bold text-gray-500 dark:text-gray-400">Position</th>
                <th className="text-left p-3 font-bold text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-left p-3 font-bold text-gray-500 dark:text-gray-400">Applied</th>
                <th className="text-left p-3 font-bold text-gray-500 dark:text-gray-400">Tags</th>
                <th className="text-right p-3 font-bold text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr
                  key={app.id}
                  className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] cursor-pointer transition-colors"
                  onClick={() => navigate(`/applications/${app.id}`)}
                >
                  <td className="p-3 font-bold dark:text-white">{app.company_name}</td>
                  <td className="p-3 dark:text-gray-300">{app.position}</td>
                  <td className="p-3"><StatusBadge status={app.status} /></td>
                  <td className="p-3 text-gray-500 dark:text-gray-400">
                    {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {(app.tags || []).map((tag) => (
                        <span key={tag.id} className="bg-gray-100 dark:bg-gray-800 text-[10px] px-1.5 py-0.5 rounded font-bold dark:text-gray-300">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(app)} className="text-[11px] font-bold text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(app.id)} className="text-[11px] font-bold text-red-600 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <BoardView
          applications={filteredApps}
          onStatusChange={handleStatusChange}
          onEdit={openEdit}
          onDelete={handleDelete}
          onRowClick={(app) => navigate(`/applications/${app.id}`)}
        />
      )}

      {showForm && (
        <ApplicationForm
          application={editingApp}
          tags={tags}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingApp(null); }}
        />
      )}

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={handleConfirmDialogConfirm}
        onCancel={handleConfirmDialogCancel}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        variant={confirmDialog.variant}
      />
    </div>
  );
}

function BoardView({ applications, onStatusChange, onEdit, onDelete, onRowClick }) {
  const BOARD_COLUMNS = ['Wishlist', 'Applied', 'Interview', 'Technical Test', 'Offer', 'Accepted', 'Rejected'];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {BOARD_COLUMNS.map((col) => {
        const colApps = applications.filter((a) => a.status?.toLowerCase() === col.toLowerCase());
        return (
          <div key={col} className="shrink-0 w-56">
            <div className="font-bold text-[11px] uppercase tracking-wider mb-2 px-1 dark:text-gray-400">
              {col} <span className="text-gray-400 dark:text-gray-600">({colApps.length})</span>
            </div>
            <div
              className="space-y-2 min-h-[200px] rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-800 p-2"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const id = parseInt(e.dataTransfer.getData('appId'));
                if (id) onStatusChange(id, col);
              }}
            >
              {colApps.map((app) => (
                <div
                  key={app.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('appId', app.id);
                    e.currentTarget.style.opacity = '0.4';
                  }}
                  onDragEnd={(e) => { e.currentTarget.style.opacity = '1'; }}
                  onClick={() => onRowClick(app)}
                  className="neu-card p-3 cursor-pointer"
                >
                  <div className="font-bold text-[12px] mb-1 dark:text-white">{app.company_name}</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">{app.position}</div>
                  <div className="flex justify-between items-center">
                    <StatusBadge status={app.status} />
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); onEdit(app); }} className="text-[10px] font-bold text-blue-600 hover:underline">Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(app.id); }} className="text-[10px] font-bold text-red-600 hover:underline">Del</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}