import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationsAPI, tasksAPI, documentsAPI, resumesAPI } from '../api';
import StatusBadge from '../components/StatusBadge';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { ArrowLeft, Calendar, ExternalLink, FileText, Plus, Trash2, Upload, Check, Wand2 } from 'lucide-react';

const STATUSES = ['Wishlist', 'Applied', 'Interview', 'Technical Test', 'Offer', 'Accepted', 'Rejected'];

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [error, setError] = useState('');
  const [fileType, setFileType] = useState('cv');

  const [generating, setGenerating] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });

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
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    setLoading(true);
    try {
      const res = await applicationsAPI.getOne(id);
      setApp(res.data);
    } catch {
      setError('Application not found');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCV = async () => {
    const confirmed = await openConfirm({
      title: 'Generate Tailored CV',
      message: 'This will use your Global Base Resume to generate a tailored CV. Continue?',
      confirmText: 'Generate',
      variant: 'warning',
    });
    if (!confirmed) return;
    setGenerating(true);
    try {
      const res = await resumesAPI.create({ 
        content: 'Generating...', 
        language: app.posting_language || 'en', 
        application_id: id 
      });
      await resumesAPI.generateWithAi(res.data.id);
      alert('Tailored CV generated successfully! Check the Resumes page.');
    } catch (e) {
      alert('Failed to generate CV. Make sure you have a Global Base Resume saved.');
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    const res = await applicationsAPI.updateStatus(id, newStatus);
    setApp(res.data);
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    await tasksAPI.create(id, { text: newTask });
    setNewTask('');
    loadApplication();
  };

  const handleToggleTask = async (taskId, isDone) => {
    await tasksAPI.update(id, taskId, { is_done: !isDone });
    loadApplication();
  };

  const handleDeleteTask = async (taskId) => {
    await tasksAPI.delete(id, taskId);
    loadApplication();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    await documentsAPI.upload(id, formData);
    loadApplication();
  };

  const handleDeleteDocument = async (docId) => {
    const confirmed = await openConfirm({
      title: 'Delete Document',
      message: 'Are you sure you want to delete this document? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'destructive',
    });
    if (!confirmed) return;
    await documentsAPI.delete(id, docId);
    loadApplication();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="font-bold dark:text-white">Loading...</div></div>;
  }

  if (error || !app) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">{error || 'Not found'}</div>
        <button onClick={() => navigate('/applications')} className="neu-btn-outline text-[12px]">Back to Applications</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/applications')} className="p-2 border-2 border-[#111] dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
          <ArrowLeft className="w-4 h-4 dark:text-white" />
        </button>
        <h1 className="font-bold text-[20px] tracking-widest dark:text-white">
          {app.company_name} — {app.position}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="neu-card p-4 lg:col-span-2 space-y-6">
          <div>
            <h2 className="font-bold text-[14px] mb-3 dark:text-white">Information</h2>
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div className="space-y-3">
                <div>
                  <span className="font-bold text-gray-500 dark:text-gray-400">Status: </span>
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="border-2 border-[#111] dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-[#0a0a0a] dark:text-white text-[12px]"
                  >
                    {STATUSES.map((s) => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <span className="font-bold text-gray-500 dark:text-gray-400">Source: </span>
                  <span className="dark:text-gray-300">{app.source || '—'}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-500 dark:text-gray-400">Applied: </span>
                  <span className="dark:text-gray-300">{app.applied_at ? new Date(app.applied_at).toLocaleDateString() : '—'}</span>
                </div>
                {app.reminder_date && (
                  <div>
                    <span className="font-bold text-gray-500 dark:text-gray-400">Reminder: </span>
                    <span className="dark:text-gray-300">{new Date(app.reminder_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {app.link && (
                  <div>
                    <span className="font-bold text-gray-500 dark:text-gray-400">Link: </span>
                    <a href={app.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> Open
                    </a>
                  </div>
                )}
                <div>
                  <span className="font-bold text-gray-500 dark:text-gray-400">Language: </span>
                  <span className="dark:text-gray-300 uppercase">{app.posting_language}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-500 dark:text-gray-400">Tags: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(app.tags || []).map((tag) => (
                      <span key={tag.id} className="bg-gray-100 dark:bg-gray-800 text-[10px] px-1.5 py-0.5 rounded font-bold dark:text-gray-300">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {app.notes && (
            <div>
              <h2 className="font-bold text-[14px] mb-2 dark:text-white">Notes</h2>
              <div className="p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded border-2 border-gray-100 dark:border-gray-800 text-[12px] dark:text-gray-300 whitespace-pre-wrap">
                {app.notes}
              </div>
            </div>
          )}

          <div>
            <h2 className="font-bold text-[14px] mb-3 dark:text-white">Status History</h2>
            <div className="space-y-2">
              {(app.status_histories || []).map((h) => (
                <div key={h.id} className="flex items-center gap-3 text-[12px]">
                  <div className="w-2 h-2 rounded-full bg-[#111] dark:bg-white shrink-0" />
                  <StatusBadge status={h.new_status} />
                  <span className="text-gray-400 dark:text-gray-500">
                    {new Date(h.changed_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {(!app.status_histories || app.status_histories.length === 0) && (
                <div className="text-gray-400 dark:text-gray-600 text-[12px]">No history yet</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="neu-card p-4">
            <h2 className="font-bold text-[14px] mb-3 dark:text-white">Tasks</h2>
            <div className="space-y-2">
              {(app.tasks || []).map((task) => (
                <div key={task.id} className="flex items-center gap-2 group">
                  <button
                    onClick={() => handleToggleTask(task.id, task.is_done)}
                    className={`w-5 h-5 border-2 border-[#111] dark:border-gray-600 rounded flex items-center justify-center shrink-0 transition-all ${task.is_done ? 'bg-green-500 border-green-500' : ''}`}
                  >
                    {task.is_done && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span className={`flex-1 text-[12px] dark:text-gray-300 ${task.is_done ? 'line-through text-gray-400' : ''}`}>
                    {task.text}
                  </span>
                  <button onClick={() => handleDeleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="New task..."
                className="neu-input text-[12px] flex-1"
              />
              <button onClick={handleAddTask} className="neu-btn p-2 text-[12px]">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="neu-card p-4">
            <h2 className="font-bold text-[14px] mb-3 dark:text-white">Documents</h2>
            <div className="space-y-2 mb-3">
              {(app.documents || []).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-[#1a1a1a] rounded border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3 h-3 text-gray-400" />
                    <div>
                      <div className="text-[11px] font-bold dark:text-white">{doc.file_name}</div>
                      <div className="text-[10px] text-gray-400">{(doc.file_size / 1024).toFixed(0)} KB</div>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteDocument(doc.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <select value={fileType} onChange={(e) => setFileType(e.target.value)} className="border-2 border-[#111] dark:border-gray-700 rounded px-2 py-1 text-[11px] bg-white dark:bg-[#0a0a0a] dark:text-white">
                <option value="cv">CV</option>
                <option value="cover_letter">Cover Letter</option>
                <option value="job_posting">Job Posting</option>
                <option value="other">Other</option>
              </select>
              <label className="neu-btn flex items-center gap-1 text-[11px] cursor-pointer">
                <Upload className="w-3 h-3" /> Upload
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
              <button 
                onClick={handleGenerateCV} 
                disabled={generating}
                className="neu-btn flex items-center gap-1 text-[11px] !bg-purple-50 dark:!bg-purple-900/20 !text-purple-700 dark:!text-purple-400 !border-purple-200 dark:!border-purple-800 disabled:opacity-50"
              >
                <Wand2 className="w-3 h-3" /> {generating ? 'Generating...' : 'Auto-Tailor CV'}
              </button>
            </div>
          </div>
        </div>
      </div>

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