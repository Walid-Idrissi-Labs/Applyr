import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationsAPI, tagsAPI } from '../api';
import StatusBadge from '../components/StatusBadge';
import ApplicationForm from '../components/ApplicationForm';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { Search, LayoutList, LayoutGrid, Plus, X, Briefcase, Eye, Edit2, Trash2, ExternalLink } from 'lucide-react';

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Wishlist', value: 'wishlist' },
  { label: 'Applied', value: 'applied' },
  { label: 'Interview', value: 'interview' },
  { label: 'Technical Test', value: 'technical test' },
  { label: 'Offer', value: 'offer' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [statusFilter, setStatusFilter] = useState('all');
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
    setSearchQuery(value);
    searchRef.current = value;
    loadApplications({
      ...(statusFilter !== 'all' && { status: statusFilter }),
      ...(value && { search: value }),
    });
  };

  const handleFilter = (statusValue) => {
    setStatusFilter(statusValue);
    loadApplications({
      ...(statusValue !== 'all' && { status: statusValue }),
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
    <div className="max-w-5xl w-full mx-auto h-full flex flex-col transition-colors duration-300 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-[20px] flex items-center gap-2 tracking-widest dark:text-white"><Briefcase className="w-5 h-5" /> My Applications</h1>
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
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="neu-input neu-input-icon"
          />
        </div>

        <div className="flex border-2 border-[#111] dark:border-gray-700 rounded-lg overflow-hidden bg-gray-100 dark:bg-[#0a0a0a]">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 ${viewMode === 'list' ? 'bg-white dark:bg-[#111] text-[#111] dark:text-white font-bold' : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400'} transition-colors`}
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={`px-3 py-2 border-l-2 border-[#111] dark:border-gray-700 ${viewMode === 'board' ? 'bg-white dark:bg-[#111] text-[#111] dark:text-white font-bold' : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400'} transition-colors`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => handleFilter(s.value)}
            className={`px-3 py-1 text-[11px] font-bold rounded-md border-2 transition-all ${
              statusFilter === s.value
                ? 'border-[#111] dark:border-gray-500 bg-[#111] dark:bg-white text-white dark:text-[#111]'
                : 'border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-[#111] dark:hover:border-gray-600'
            }`}
          >
            {s.label}
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
                  className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
                >
                  <td className="p-3 font-bold dark:text-white cursor-pointer" onClick={() => navigate(`/applications/${app.id}`)}>{app.company_name}</td>
                  <td className="p-3 dark:text-gray-300 cursor-pointer" onClick={() => navigate(`/applications/${app.id}`)}>{app.position}</td>
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
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setShowDetail(app)} className="p-1.5 border-2 border-transparent hover:border-[#111] dark:hover:border-gray-500 rounded-md transition-colors dark:text-gray-400 hover:text-[#111] dark:hover:text-white" title="Quick View"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(app)} className="p-1.5 border-2 border-transparent hover:border-blue-600 text-blue-600 rounded-md transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(app.id)} className="p-1.5 border-2 border-transparent hover:border-red-600 text-red-600 rounded-md transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
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

      {showDetail && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm transition-colors duration-300">
          <div className="bg-white dark:bg-[#111] border-2 border-[#111] dark:border-gray-800 rounded-2xl w-full max-w-4xl m-auto shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b-2 border-[#111] dark:border-gray-800 flex justify-between items-start bg-gray-50 dark:bg-[#1a1a1a] rounded-t-2xl shrink-0">
              <div>
                <button onClick={() => setShowDetail(null)} className="text-[11px] font-bold text-gray-500 hover:text-[#111] dark:hover:text-white mb-2 uppercase tracking-wider flex items-center gap-1 transition-colors">Back</button>
                <div className="flex items-center gap-4 mt-1">
                  <h2 className="font-bold text-[22px] m-0 leading-none dark:text-white">{showDetail.company_name} <span className="text-gray-400 font-normal">—</span> {showDetail.position}</h2>
                  <span className="border-2 border-[#111] dark:border-gray-600 rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase bg-white dark:bg-[#0a0a0a] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)] dark:text-gray-300">
                    {showDetail.status}
                  </span>
                </div>
              </div>
              <button onClick={() => setShowDetail(null)} className="hover:bg-gray-200 dark:hover:bg-gray-800 p-1.5 border-2 border-transparent hover:border-[#111] dark:hover:border-gray-600 rounded-md transition-all dark:text-white"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto flex-1 text-[13px]">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="flex gap-3">
                  <button onClick={() => { setShowDetail(null); openEdit(showDetail); }} className="border-2 border-[#111] dark:border-gray-700 rounded-md bg-white dark:bg-[#0a0a0a] px-4 py-2 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 flex-1 text-center flex justify-center items-center gap-2 transition-colors shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)] dark:text-gray-300 hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px]"><Edit2 className="w-4 h-4" /> Edit</button>
                  <button onClick={() => { setShowDetail(null); handleDelete(showDetail.id); }} className="border-2 border-red-200 dark:border-red-900 text-red-600 dark:text-red-500 bg-white dark:bg-transparent px-4 py-2 rounded-md font-bold hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-600 flex-1 text-center flex justify-center items-center gap-2 transition-colors"><Trash2 className="w-4 h-4" /> Delete</button>
                  <button onClick={() => { setShowDetail(null); navigate(`/applications/${showDetail.id}`); }} className="border-2 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-500 bg-white dark:bg-transparent px-4 py-2 rounded-md font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-600 flex-1 text-center flex justify-center items-center gap-2 transition-colors"><ExternalLink className="w-4 h-4" /> Full Page</button>
                </div>

                <div className="border-2 border-[#111] dark:border-gray-800 rounded-xl p-5 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] bg-white dark:bg-[#1a1a1a]">
                  <h3 className="font-bold border-b-2 border-gray-100 dark:border-gray-800 pb-2 mb-4 text-[14px] dark:text-white">Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2"><span className="text-gray-500">Date Applied</span><span className="font-bold dark:text-gray-300">{showDetail.applied_at ? new Date(showDetail.applied_at).toLocaleDateString() : '—'}</span></div>
                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2"><span className="text-gray-500">Source</span><span className="font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md dark:text-gray-300">{showDetail.source || '—'}</span></div>
                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2"><span className="text-gray-500">Follow-up Date</span><span className="font-bold dark:text-gray-300">{showDetail.reminder_date ? new Date(showDetail.reminder_date).toLocaleDateString() : '—'}</span></div>
                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2"><span className="text-gray-500">Tags</span><span className="font-bold text-[11px] dark:text-gray-300">{(showDetail.tags || []).map(t => t.name).join(', ') || '—'}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-500">Job Link</span><span className="font-bold">{showDetail.job_url ? <a href={showDetail.job_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">External Link <ExternalLink className="w-3 h-3" /></a> : '—'}</span></div>
                  </div>
                </div>

                {showDetail.notes && (
                  <div className="border-2 border-[#111] dark:border-gray-800 rounded-xl p-5 bg-yellow-50/50 dark:bg-yellow-900/10">
                    <h3 className="font-bold border-b-2 border-yellow-200 dark:border-yellow-900/50 pb-2 mb-3 text-[14px] dark:text-yellow-200">Notes</h3>
                    <p className="whitespace-pre-wrap font-medium text-gray-800 dark:text-gray-300 leading-relaxed">{showDetail.notes}</p>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="border-2 border-[#111] dark:border-gray-800 rounded-xl p-5 bg-white dark:bg-[#1a1a1a]">
                  <h3 className="font-bold border-b-2 border-gray-100 dark:border-gray-800 pb-2 mb-5 text-[14px] dark:text-white">Status History</h3>
                  <div className="relative pl-5 border-l-2 border-[#111] dark:border-gray-600 ml-3 space-y-6">
                    {/* Simulated History for now, as we don't have a history array yet */}
                    <div className="relative">
                      <div className="absolute -left-[25px] top-1 w-3.5 h-3.5 bg-[#111] dark:bg-white border-2 border-[#111] dark:border-gray-800 rounded-full z-10"></div>
                      <div className="font-bold text-[14px] leading-none mb-1 dark:text-white">{showDetail.status}</div>
                      <div className="text-[11px] text-gray-500 font-bold">{showDetail.updated_at ? new Date(showDetail.updated_at).toLocaleDateString() : '—'}</div>
                    </div>
                    <div className="relative pt-1">
                      <div className="absolute -left-[25px] top-1.5 w-3.5 h-3.5 bg-white dark:bg-[#0a0a0a] border-2 border-dashed border-gray-400 dark:border-gray-700 rounded-full z-10"></div>
                      <div className="text-[12px] font-bold italic text-gray-400 dark:text-gray-600">Pending update...</div>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-[#111] dark:border-gray-800 rounded-xl p-5 bg-gray-50 dark:bg-[#0a0a0a]">
                  <div className="flex justify-between items-center border-b-2 border-gray-200 dark:border-gray-800 pb-2 mb-4">
                    <h3 className="font-bold text-[14px] dark:text-white">Resources</h3>
                  </div>
                  
                  <div className="text-[12px] text-gray-500 dark:text-gray-600 italic p-3 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-md text-center">
                    Navigate to the full page to view tasks and attachments.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BoardView({ applications, onStatusChange, onEdit, onDelete, onRowClick }) {
  const BOARD_COLUMNS = STATUS_OPTIONS.filter((option) => option.value !== 'all');

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {BOARD_COLUMNS.map((col) => {
        const colApps = applications.filter((a) => (a.status || '').toLowerCase() === col.value);
        return (
          <div key={col.value} className="shrink-0 w-56">
            <div className="font-bold text-[11px] uppercase tracking-wider mb-2 px-1 dark:text-gray-400">
              {col.label} <span className="text-gray-400 dark:text-gray-600">({colApps.length})</span>
            </div>
            <div
              className="space-y-2 min-h-[200px] rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-800 p-2"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const id = parseInt(e.dataTransfer.getData('appId'));
                if (id) onStatusChange(id, col.value);
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
                  <div className="flex justify-between items-center mt-2 pt-2 border-t-2 border-dashed border-gray-200 dark:border-gray-800">
                    <div className="flex gap-2 text-gray-500">
                      {/* Attachments / Tasks could go here later */}
                    </div>
                    <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button onClick={(e) => { e.stopPropagation(); /* Future quick view */ onRowClick(app); }} className="text-gray-400 hover:text-[#111] dark:hover:text-white" title="View"><Eye className="w-3 h-3" /></button>
                      <button onClick={(e) => { e.stopPropagation(); onEdit(app); }} className="text-blue-600 hover:text-blue-800" title="Edit"><Edit2 className="w-3 h-3" /></button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(app.id); }} className="text-red-600 hover:text-red-800" title="Delete"><Trash2 className="w-3 h-3" /></button>
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