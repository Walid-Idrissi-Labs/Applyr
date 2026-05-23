import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationsAPI, tasksAPI, documentsAPI, resumesAPI, tagsAPI } from '../api';
import StatusBadge from '../components/StatusBadge';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { ArrowLeft, Calendar, ExternalLink, FileText, Plus, Trash2, Upload, Check, Wand2, Edit2, Clock, Save, X } from 'lucide-react';

const STATUSES = ['Wishlist', 'Applied', 'Interview', 'Technical Test', 'Offer', 'Accepted', 'Rejected'];
const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'French', value: 'fr' },
  { label: 'Spanish', value: 'es' },
  { label: 'German', value: 'de' },
  { label: 'Arabic', value: 'ar' },
];

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [error, setError] = useState('');
  const [fileType, setFileType] = useState('cv');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [showTailorModal, setShowTailorModal] = useState(false);
  const [tailorForm, setTailorForm] = useState({ language: 'en', notes: '' });
  const [tailorStep, setTailorFormStep] = useState('idle'); // 'idle', 'generating', 'success'
  const [loadingMsg, setLoadingMsg] = useState('');
  const [generatedResumeId, setGeneratedResumeId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });

  const QUIRKY_MSGS = [
    "Polishing your experience...",
    "Bribing the recruiters (with quality)...",
    "Optimizing keywords for maximum impact...",
    "Consulting the AI career coach...",
    "Aligning your skills with the stars...",
    "Refining the professional tone...",
    "Deleting the boring parts...",
    "Injecting just enough confidence...",
    "Making your achievements shine...",
    "Scanning for buzzword compliance...",
    "Whispering sweet nothings to the ATS...",
    "Organizing the chaos into bullet points...",
    "Adding a dash of 'hire-me' energy...",
  ];

  useEffect(() => {
    let interval;
    if (tailorStep === 'generating') {
      // Pick a random starting message
      const getRandomMsg = () => QUIRKY_MSGS[Math.floor(Math.random() * QUIRKY_MSGS.length)];
      setLoadingMsg(getRandomMsg());
      
      interval = setInterval(() => {
        setLoadingMsg(getRandomMsg());
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [tailorStep]);

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
    loadTags();
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

  const loadTags = async () => {
    try {
      const res = await tagsAPI.getAll();
      setTags(res.data);
    } catch (e) {
      console.error('Failed to load tags', e);
    }
  };

  const startEditing = () => {
    setEditForm({
      company_name: app.company_name,
      position: app.position,
      status: app.status,
      applied_at: app.applied_at ? app.applied_at.slice(0, 10) : '',
      link: app.link || '',
      source: app.source || '',
      notes: app.notes || '',
      posting_language: app.posting_language || 'en',
      tag_ids: (app.tags || []).map(t => t.id)
    });
    setIsEditing(true);
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleTagEdit = (tagId) => {
    setEditForm(prev => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter(id => id !== tagId)
        : [...prev.tag_ids, tagId]
    }));
  };

  const saveInlineEdit = async () => {
    setSavingEdit(true);
    try {
      const res = await applicationsAPI.update(id, editForm);
      setApp(res.data);
      setIsEditing(false);
    } catch (e) {
      alert('Failed to save changes');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleOpenTailorModal = () => {
    setTailorForm({ 
      language: app.posting_language || 'en', 
      notes: '' 
    });
    setTailorFormStep('idle');
    setShowTailorModal(true);
  };

  const handleGenerateCV = async () => {
    setTailorFormStep('generating');
    setGenerating(true);
    try {
      const res = await resumesAPI.create({ 
        content: 'Generating...', 
        language: tailorForm.language, 
        application_id: id 
      });
      await resumesAPI.generateWithAi(res.data.id);
      setGeneratedResumeId(res.data.id);
      setTailorFormStep('success');
      loadApplication(); // Refresh to show in AI Actions box
    } catch (e) {
      alert('Failed to generate resume. Make sure you have a Global Base Resume saved.');
      setTailorFormStep('idle');
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
    <div className="max-w-5xl w-full mx-auto h-full flex flex-col space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/applications')} className="p-2 border-2 border-[#111] dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <ArrowLeft className="w-4 h-4 dark:text-white" />
          </button>
          <div className="min-w-0">
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <input 
                  value={editForm.company_name} 
                  onChange={(e) => handleEditChange('company_name', e.target.value)}
                  className="font-bold text-[22px] tracking-tight dark:text-white bg-white dark:bg-[#0a0a0a] border-2 border-[#111] dark:border-gray-700 rounded px-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  value={editForm.position} 
                  onChange={(e) => handleEditChange('position', e.target.value)}
                  className="text-[14px] text-gray-500 dark:text-gray-400 font-bold bg-white dark:bg-[#0a0a0a] border-2 border-[#111] dark:border-gray-700 rounded px-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <>
                <h1 className="font-bold text-[22px] tracking-tight dark:text-white truncate">
                  {app.company_name}
                </h1>
                <p className="text-[14px] text-gray-500 dark:text-gray-400 truncate -mt-1 font-bold">
                  {app.position}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={app.status} size="lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="neu-card p-5 relative">
            <div className="flex justify-between items-center mb-4 border-b-2 border-gray-100 dark:border-gray-800 pb-2">
              <h2 className="font-bold text-[15px] dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Information
              </h2>
              {isEditing ? (
                <div className="flex gap-2">
                  <button 
                    onClick={saveInlineEdit}
                    disabled={savingEdit}
                    className="p-1.5 bg-green-500 text-white rounded-md border-2 border-[#111] hover:shadow-none shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] transition-all flex items-center gap-1 text-[11px] font-bold"
                  >
                    <Save className="w-4 h-4" /> {savingEdit ? '...' : 'Save'}
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="p-1.5 bg-white dark:bg-[#0a0a0a] dark:text-white rounded-md border-2 border-[#111] dark:border-gray-700 hover:bg-gray-100 transition-all flex items-center gap-1 text-[11px] font-bold"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={startEditing}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md border-2 border-transparent hover:border-[#111] dark:hover:border-gray-600 transition-all text-blue-600"
                  title="Edit Info"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-[12px]">
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-gray-400 dark:text-gray-500 uppercase text-[10px]">Current Status</span>
                  <select
                    value={isEditing ? editForm.status : app.status}
                    onChange={(e) => isEditing ? handleEditChange('status', e.target.value) : handleStatusChange(e.target.value)}
                    className="border-2 border-[#111] dark:border-gray-700 rounded-lg px-3 py-1.5 bg-gray-50 dark:bg-[#1a1a1a] dark:text-white text-[12px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUSES.map((s) => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-gray-400 dark:text-gray-500 uppercase text-[10px]">Source</span>
                  {isEditing ? (
                    <input 
                      value={editForm.source} 
                      onChange={(e) => handleEditChange('source', e.target.value)}
                      className="neu-input py-1.5"
                    />
                  ) : (
                    <span className="dark:text-gray-300 font-bold bg-white dark:bg-[#0a0a0a] border-2 border-gray-100 dark:border-gray-800 p-2 rounded-lg">{app.source || 'Direct Application'}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-gray-400 dark:text-gray-500 uppercase text-[10px]">Applied On</span>
                  {isEditing ? (
                    <input 
                      type="date"
                      value={editForm.applied_at} 
                      onChange={(e) => handleEditChange('applied_at', e.target.value)}
                      className="neu-input py-1.5"
                    />
                  ) : (
                    <span className="dark:text-gray-300 font-bold p-2">{app.applied_at ? new Date(app.applied_at).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Not applied yet'}</span>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-gray-400 dark:text-gray-500 uppercase text-[10px]">Job Link</span>
                  {isEditing ? (
                    <input 
                      value={editForm.link} 
                      onChange={(e) => handleEditChange('link', e.target.value)}
                      className="neu-input py-1.5"
                      placeholder="https://..."
                    />
                  ) : (
                    app.link ? (
                      <a href={app.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg border-2 border-blue-100 dark:border-blue-900/50 transition-colors">
                        <ExternalLink className="w-4 h-4" /> View Listing
                      </a>
                    ) : <span className="text-gray-400 p-2">No link provided</span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-gray-400 dark:text-gray-500 uppercase text-[10px]">Language</span>
                  {isEditing ? (
                    <select 
                      value={editForm.posting_language} 
                      onChange={(e) => handleEditChange('posting_language', e.target.value)}
                      className="border-2 border-[#111] dark:border-gray-700 rounded-lg px-3 py-1.5 bg-gray-50 dark:bg-[#1a1a1a] dark:text-white text-[12px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  ) : (
                    <span className="dark:text-gray-300 font-bold p-2 uppercase tracking-wider">
                      {LANGUAGES.find(l => l.value === app.posting_language)?.label || app.posting_language || '—'}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-gray-400 dark:text-gray-500 uppercase text-[10px]">Tags</span>
                  {isEditing ? (
                    <div className="flex flex-wrap gap-1.5 p-1">
                      {tags.map(tag => (
                        <button
                          key={tag.id}
                          onClick={() => toggleTagEdit(tag.id)}
                          className={`text-[10px] px-2 py-0.5 rounded font-bold border-2 transition-all ${editForm.tag_ids.includes(tag.id) ? 'bg-[#111] dark:bg-white text-white dark:text-[#111] border-[#111] dark:border-white' : 'border-gray-200 dark:border-gray-800 text-gray-400'}`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 p-1">
                      {(app.tags || []).length > 0 ? (app.tags || []).map((tag) => (
                        <span key={tag.id} className="bg-[#111] dark:bg-white text-white dark:text-[#111] text-[10px] px-2 py-0.5 rounded font-bold">
                          {tag.name}
                        </span>
                      )) : <span className="text-gray-400">No tags</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {app.notes && !isEditing && (
            <div className="neu-card p-5">
              <h2 className="font-bold text-[15px] mb-3 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4" /> Notes
              </h2>
              <div className="p-4 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-xl border-2 border-yellow-100 dark:border-yellow-900/30 text-[13px] dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {app.notes}
              </div>
            </div>
          )}
          
          {isEditing && (
            <div className="neu-card p-5">
              <h2 className="font-bold text-[15px] mb-3 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4" /> Edit Notes
              </h2>
              <textarea 
                value={editForm.notes}
                onChange={(e) => handleEditChange('notes', e.target.value)}
                className="w-full neu-input p-4 text-[13px] leading-relaxed resize-y min-h-[120px]"
                placeholder="Company info, interview notes..."
              />
            </div>
          )}

          <div className="neu-card p-5">
            <h2 className="font-bold text-[15px] mb-4 dark:text-white flex items-center gap-2 border-b-2 border-gray-100 dark:border-gray-800 pb-2">
              <Clock className="w-4 h-4" /> Status History
            </h2>
            <div className="space-y-4 pl-3 border-l-2 border-gray-200 dark:border-gray-800 ml-2">
              {(app.status_histories || []).map((h) => (
                <div key={h.id} className="flex items-center gap-4 text-[12px] relative">
                  <div className="absolute -left-[21px] w-4 h-4 rounded-full border-2 border-white dark:border-[#111] bg-[#111] dark:bg-white shrink-0" />
                  <div className="font-bold dark:text-gray-300 min-w-[100px] uppercase tracking-wider text-[11px]">{h.new_status}</div>
                  <div className="text-gray-400 dark:text-gray-500 font-bold bg-gray-50 dark:bg-[#1a1a1a] px-2 py-0.5 rounded border border-gray-100 dark:border-gray-800">
                    {new Date(h.changed_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </div>
                </div>
              ))}
              {(!app.status_histories || app.status_histories.length === 0) && (
                <div className="text-gray-400 dark:text-gray-600 text-[12px] italic">No status transitions recorded yet.</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="neu-card p-5 bg-purple-50/30 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/50">
            <h2 className="font-bold text-[15px] mb-4 dark:text-white flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-purple-600" /> AI Actions
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-4 leading-snug">
              Use AI to optimize your application based on your global profile and the job description.
            </p>
            <button 
              onClick={handleOpenTailorModal} 
              disabled={generating}
              className="w-full neu-btn flex items-center justify-center gap-2 text-[12px] !bg-purple-600 !text-white !border-[#111] py-3 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] disabled:opacity-50 transition-all font-bold"
            >
              <Wand2 className="w-4 h-4" /> {generating ? 'Architecting...' : 'Auto-Tailor Resume'}
            </button>

            {/* Generated Resumes List in AI box */}
            {app.resumes && app.resumes.length > 0 && (
              <div className="mt-6 pt-4 border-t-2 border-dashed border-purple-200 dark:border-purple-800/50 space-y-3">
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-purple-700 dark:text-purple-400">Generated Versions</h3>
                <div className="space-y-2">
                  {app.resumes.map((r, i) => (
                    <button 
                      key={r.id}
                      onClick={() => navigate(`/resumes`)} // For now, go to resumes page
                      className="w-full text-left p-2.5 bg-white dark:bg-[#1a1a1a] border-2 border-[#111] rounded-xl hover:translate-x-1 transition-transform flex items-center justify-between group shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <div className="truncate">
                          <div className="text-[11px] font-bold dark:text-white">Version {app.resumes.length - i}</div>
                          <div className="text-[9px] text-gray-400 font-bold uppercase">{r.language} • {new Date(r.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-purple-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="neu-card p-5">
            <h2 className="font-bold text-[15px] mb-4 dark:text-white flex items-center gap-2">
              <Check className="w-4 h-4" /> Checklist
            </h2>
            <div className="space-y-3">
              {(app.tasks || []).map((task) => (
                <div key={task.id} className="flex items-start gap-3 group">
                  <button
                    onClick={() => handleToggleTask(task.id, task.is_done)}
                    className={`w-5 h-5 border-2 border-[#111] dark:border-gray-600 rounded flex items-center justify-center shrink-0 transition-all mt-0.5 ${task.is_done ? 'bg-green-500 border-green-500' : 'bg-white dark:bg-[#0a0a0a]'}`}
                  >
                    {task.is_done && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span className={`flex-1 text-[12px] dark:text-gray-300 leading-tight ${task.is_done ? 'line-through text-gray-400' : 'font-medium'}`}>
                    {task.text}
                  </span>
                  <button onClick={() => handleDeleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              ))}
              {(!app.tasks || app.tasks.length === 0) && (
                <div className="text-center py-4 text-gray-400 text-[11px] italic">No tasks added.</div>
              )}
            </div>
            <div className="flex gap-2 mt-5">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="Next step..."
                className="neu-input text-[12px] flex-1 py-1.5"
              />
              <button onClick={handleAddTask} className="neu-btn p-1.5 text-[12px]">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="neu-card p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-[15px] dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4" /> Documents
              </h2>
              <div className="flex items-center gap-1.5">
                 <select value={fileType} onChange={(e) => setFileType(e.target.value)} className="border-2 border-[#111] dark:border-gray-700 rounded-lg px-2 py-0.5 text-[10px] bg-gray-50 dark:bg-[#1a1a1a] dark:text-white font-bold outline-none">
                  <option value="cv">CV</option>
                  <option value="cover_letter">Cover Letter</option>
                  <option value="job_posting">Job Posting</option>
                  <option value="other">Other</option>
                </select>
                <label className="p-1.5 border-2 border-[#111] dark:border-gray-700 rounded-lg bg-white dark:bg-[#1a1a1a] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
            
            <div className="space-y-2">
              {(app.documents || []).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-800 transition-all group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-white dark:bg-[#0a0a0a] border-2 border-gray-100 dark:border-gray-800 rounded-lg">
                      <FileText className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12px] font-bold dark:text-white truncate">{doc.file_name}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">{(doc.file_size / 1024).toFixed(0)} KB • {doc.file_type.replace('_', ' ')}</div>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteDocument(doc.id)} className="opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!app.documents || app.documents.length === 0) && (
                <div className="text-center py-6 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
                  <FileText className="w-8 h-8 text-gray-200 dark:text-gray-800 mx-auto mb-2" />
                  <div className="text-[11px] text-gray-400 italic">No documents uploaded</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showTailorModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111] border-2 border-[#111] dark:border-gray-800 rounded-2xl w-full max-w-md shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] overflow-hidden">
            <div className="p-4 border-b-2 border-[#111] dark:border-gray-800 flex justify-between items-center bg-purple-50 dark:bg-purple-900/10">
              <h3 className="font-bold text-[16px] dark:text-white flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-purple-600" /> 
                {tailorStep === 'generating' ? 'AI is Architecting...' : tailorStep === 'success' ? 'Generation Complete' : 'Auto-Tailor Resume'}
              </h3>
              {tailorStep !== 'generating' && (
                <button onClick={() => setShowTailorModal(false)} className="p-1 hover:bg-white dark:hover:bg-gray-800 rounded-md transition-colors"><X className="w-5 h-5 dark:text-white" /></button>
              )}
            </div>

            <div className="p-6">
              {tailorStep === 'idle' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Target Language</label>
                    <select 
                      value={tailorForm.language}
                      onChange={(e) => setTailorForm({ ...tailorForm, language: e.target.value })}
                      className="w-full border-2 border-[#111] dark:border-gray-700 rounded-lg px-3 py-2 bg-gray-50 dark:bg-[#1a1a1a] dark:text-white text-[12px] font-bold outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Additional Instructions (Optional)</label>
                    <textarea 
                      value={tailorForm.notes}
                      onChange={(e) => setTailorForm({ ...tailorForm, notes: e.target.value })}
                      placeholder="e.g. Focus on my backend experience, or keep it under one page..."
                      className="w-full border-2 border-[#111] dark:border-gray-700 rounded-lg px-3 py-3 bg-gray-50 dark:bg-[#1a1a1a] dark:text-white text-[12px] h-28 resize-none outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={handleGenerateCV}
                      className="flex-1 neu-btn py-3 !bg-purple-600 !text-white !border-[#111] font-bold text-[12px] flex items-center justify-center gap-2"
                    >
                      <Wand2 className="w-4 h-4" /> Start Architecting
                    </button>
                    <button 
                      onClick={() => setShowTailorModal(false)}
                      className="flex-1 neu-btn-outline py-3 text-[12px] font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {tailorStep === 'generating' && (
                <div className="py-10 flex flex-col items-center justify-center space-y-6 text-center">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-900 border-t-purple-600 rounded-full animate-spin"></div>
                    <Wand2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-purple-600 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-[16px] dark:text-white">Hang tight!</p>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400 italic animate-bounce">{loadingMsg}</p>
                  </div>
                </div>
              )}

              {tailorStep === 'success' && (
                <div className="py-6 flex flex-col items-center justify-center space-y-6 text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center border-2 border-green-500">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-[18px] dark:text-white">Generated Successfully!</p>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400">Your tailored resume is ready for review.</p>
                  </div>
                  <button 
                    onClick={() => navigate(`/resumes/${generatedResumeId}/preview`)}
                    className="w-full neu-btn py-3 !bg-[#111] dark:!bg-white !text-white dark:!text-[#111] font-bold text-[12px] flex items-center justify-center gap-2"
                  >
                    View Tailored Resume <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
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