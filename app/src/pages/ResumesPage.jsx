import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumesAPI } from '../api';
import ReactMarkdown from 'react-markdown';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { FileText, Download, Eye, Upload, Briefcase, ChevronRight, Clock, Trash2, Edit2, X, Wand2, Check } from 'lucide-react';

const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'French', value: 'fr' },
  { label: 'Spanish', value: 'es' },
  { label: 'German', value: 'de' },
  { label: 'Arabic', value: 'ar' },
];

export default function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [globalContent, setGlobalContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
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
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const r = await resumesAPI.getAll();
      setResumes(r.data);
      const global = r.data.find(res => res.application_id === null);
      if (global) {
        setGlobalContent(global.content || '');
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGlobalCV = async () => {
    setSaving(true);
    try {
      const global = resumes.find(res => res.application_id === null);
      if (global) {
        await resumesAPI.update(global.id, { content: globalContent });
      } else {
        await resumesAPI.create({ content: globalContent, language: 'en', application_id: null });
      }
      alert('Global Base Resume saved!');
      loadData();
    } catch (e) {
      alert('Error saving global resume.');
    } finally {
      setSaving(false);
    }
  };

  const handleGlobalUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExtracting(true);
    const formData = new FormData();
    formData.append('file', file);
    // Since we don't have a robust PDF parser on the backend yet, 
    // we'll send a hint that we're uploading a file.
    // For now, I'll pass some mock text to simulate extraction if file parsing fails.
    formData.append('text', "Uploaded file: " + file.name); 

    try {
      const res = await resumesAPI.extract(formData);
      setEditContent(res.data.content);
      alert('AI has successfully extracted and structured your resume info!');
    } catch (e) {
      alert('AI extraction failed. Please paste your resume text manually.');
    } finally {
      setExtracting(false);
    }
  };

  const handleExport = (id) => {
    const existing = document.getElementById('print-iframe');
    if (existing) {
      existing.remove();
    }
    const iframe = document.createElement('iframe');
    iframe.id = 'print-iframe';
    iframe.style.display = 'none';
    iframe.src = `/resumes/${id}/preview?print=true`;
    document.body.appendChild(iframe);
  };

  const handleDelete = async (id) => {
    const confirmed = await openConfirm({
      title: 'Delete Resume Version',
      message: 'Are you sure you want to delete this specific resume version? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'destructive',
    });
    if (!confirmed) return;
    try {
      await resumesAPI.delete(id);
      loadData();
    } catch {
      alert('Failed to delete resume');
    }
  };

  // Group resumes by application
  const groups = resumes.reduce((acc, r) => {
    if (r.application_id === null) return acc;
    const appId = r.application_id;
    if (!acc[appId]) {
      acc[appId] = {
        application: r.application,
        resumes: []
      };
    }
    acc[appId].resumes.push(r);
    return acc;
  }, {});

  const sortedGroups = Object.values(groups).sort((a, b) => 
    new Date(b.resumes[0].created_at) - new Date(a.resumes[0].created_at)
  );

  const globalResume = resumes.find(r => r.application_id === null);

  return (
    <div className="max-w-6xl w-full mx-auto h-full flex flex-col transition-colors duration-300 space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-[22px] font-bold flex items-center gap-2 dark:text-white uppercase tracking-tighter">
          <FileText className="w-6 h-6 text-purple-600" /> Resume Workspace
        </h2>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-center space-y-4">
            <div className="w-10 h-10 border-4 border-purple-200 dark:border-purple-900 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
            <div className="font-bold text-gray-500">Loading your drafts...</div>
          </div>
        </div>
      ) : (
        <>
          {/* TOP SECTION: Global Base Resume */}
          <div className="neu-card p-6 bg-white dark:bg-[#111] overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3 space-y-4">
                <div className="flex justify-between items-center border-b-2 border-gray-100 dark:border-gray-800 pb-3">
                  <h3 className="font-bold text-[16px] dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" /> Global Base Resume
                  </h3>
                </div>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  This is your master profile. All tailored resumes are built using this content as the primary source. Keep it updated with your latest achievements.
                </p>
                <div className="space-y-3 pt-2">
                  <button 
                    onClick={() => { setEditContent(globalContent); setShowEditModal(true); }}
                    className="w-full neu-btn py-3 !bg-[#111] dark:!bg-white !text-white dark:!text-[#111] font-bold text-[13px] flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" /> Edit Master Profile
                  </button>
                  {globalResume && (
                    <button 
                      onClick={() => navigate(`/resumes/${globalResume.id}/preview`)}
                      className="w-full neu-btn-outline py-3 font-bold text-[13px] flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" /> Full Preview
                    </button>
                  )}
                </div>
              </div>
              
              <div className="md:w-2/3 flex flex-col h-full min-h-[250px]">
                <div className="flex justify-between items-center mb-2 px-1">
                   <label className="font-bold text-[10px] uppercase text-gray-400 tracking-widest">Master Profile Preview</label>
                </div>
                <div className="w-full h-64 border-2 border-[#111] dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-[#0a0a0a] overflow-y-auto custom-scrollbar prose dark:prose-invert prose-sm max-w-none shadow-inner">
                  {globalContent ? (
                    <ReactMarkdown>{globalContent}</ReactMarkdown>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 italic">No content yet. Click edit to start.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: Tailored Resumes Grouped by Job */}
          <div className="space-y-6">
            <h3 className="font-bold text-[14px] text-gray-500 dark:text-gray-400 uppercase tracking-[2px] px-1">Tailored Drafts by Application</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedGroups.map((group) => (
                <div key={group.application.id} className="neu-card flex flex-col bg-white dark:bg-[#111] overflow-hidden group">
                  <div 
                    onClick={() => navigate(`/applications/${group.application.id}`)}
                    className="p-4 border-b-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1a] flex justify-between items-center cursor-pointer group/header"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-[14px] dark:text-white truncate uppercase tracking-tight group-hover/header:text-purple-600 transition-colors">{group.application.company_name}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate font-bold">{group.application.position}</div>
                    </div>
                    <div className="p-1.5 rounded-md text-gray-400 group-hover/header:text-purple-600 transition-colors">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex-1 p-3 space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar">
                    {group.resumes.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).map((r, i) => (
                      <div 
                        key={r.id} 
                        onClick={() => navigate(`/resumes/${r.id}/preview?from=resumes`)}
                        className="p-3 bg-white dark:bg-[#0a0a0a] border-2 border-gray-100 dark:border-gray-800 rounded-xl hover:border-purple-200 dark:hover:border-purple-900 transition-all flex items-center justify-between group/item shadow-sm cursor-pointer"
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center border border-purple-100 dark:border-purple-800 shrink-0">
                            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">V{group.resumes.length - i}</span>
                          </div>
                          <div className="truncate">
                            <div className="text-[11px] font-bold dark:text-white flex items-center gap-2">
                              {LANGUAGES.find(l => l.value === r.language)?.label || r.language}
                              {r.is_finalized && <div className="w-2 h-2 rounded-full bg-green-500" title="Finalized" />}
                            </div>
                            <div className="text-[9px] text-gray-400 font-bold flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" /> {new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => navigate(`/resumes/${r.id}/preview?from=resumes`)}
                            className="p-1.5 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-md text-gray-400 hover:text-purple-600 transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleExport(r.id)}
                            className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md text-gray-400 hover:text-blue-600 transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(r.id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 bg-gray-50/50 dark:bg-[#1a1a1a]/50 border-t-2 border-dashed border-gray-100 dark:border-gray-800">
                    <div className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest">{group.resumes.length} VERSIONS CREATED</div>
                  </div>
                </div>
              ))}

              {sortedGroups.length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                   <Briefcase className="w-12 h-12 text-gray-200 dark:text-gray-800 mx-auto mb-4" />
                   <p className="font-bold text-gray-400">No tailored resumes yet. Start architecting from a job application!</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111] border-2 border-[#111] dark:border-gray-800 rounded-2xl w-full max-w-4xl shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b-2 border-[#111] dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#1a1a1a]">
              <h3 className="font-bold text-[16px] dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4" /> Edit Master Profile
              </h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-white dark:hover:bg-gray-800 rounded-md transition-colors"><X className="w-5 h-5 dark:text-white" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 flex flex-col space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 space-y-4">
                   <div className="neu-card p-4 bg-blue-50/30 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50">
                      <h4 className="font-bold text-[12px] dark:text-white flex items-center gap-2 mb-2 uppercase tracking-wider text-blue-600">
                        <Upload className="w-4 h-4" /> Smart Import
                      </h4>
                      <p className="text-[10px] text-gray-500 mb-4 leading-tight">Upload your latest PDF resume. Our AI will extract the info and update the text below automatically.</p>
                      <button 
                        onClick={() => document.getElementById('modal-pdf-upload').click()} 
                        disabled={extracting}
                        className="w-full neu-btn py-2 !bg-blue-600 !text-white !border-[#111] text-[11px] flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Wand2 className="w-4 h-4" /> {extracting ? 'Extracting...' : 'Upload & Extract'}
                      </button>
                      <input type="file" id="modal-pdf-upload" className="hidden" accept=".pdf" onChange={handleGlobalUpload} />
                   </div>
                   
                   <div className="neu-card p-4 bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800">
                      <h4 className="font-bold text-[12px] dark:text-white flex items-center gap-2 mb-2 uppercase tracking-wider text-gray-500">
                        <Clock className="w-4 h-4" /> Pro Tip
                      </h4>
                      <p className="text-[10px] text-gray-500 leading-tight">Use Markdown for best results. This allows the AI to better understand the structure of your profile during tailoring.</p>
                   </div>
                </div>

                <div className="md:w-2/3 flex flex-col">
                  <label className="font-bold text-[10px] uppercase text-gray-400 mb-2 tracking-widest px-1">Master Profile Content (Markdown)</label>
                  <textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-96 border-2 border-[#111] dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-[#0a0a0a] dark:text-gray-200 text-[12px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono leading-relaxed"
                    placeholder="Describe your career history, skills, and projects..."
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t-2 border-[#111] dark:border-gray-800 bg-white dark:bg-[#111] flex justify-end gap-3">
               <button 
                onClick={() => setShowEditModal(false)}
                className="neu-btn-outline px-6 py-2 text-[12px] font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  setSaving(true);
                  try {
                    const global = resumes.find(res => res.application_id === null);
                    if (global) {
                      await resumesAPI.update(global.id, { content: editContent });
                    } else {
                      await resumesAPI.create({ content: editContent, language: 'en', application_id: null });
                    }
                    setGlobalContent(editContent);
                    setShowEditModal(false);
                    loadData();
                  } catch (e) {
                    alert('Error saving master profile.');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className="neu-btn px-8 py-2 text-[12px] font-bold !bg-[#111] dark:!bg-white !text-white dark:!text-[#111] flex items-center gap-2"
              >
                {saving ? 'Saving...' : <><Check className="w-4 h-4" /> Save Profile</>}
              </button>
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
