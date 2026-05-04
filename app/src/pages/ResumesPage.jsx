import { useState, useEffect } from 'react';
import { resumesAPI, applicationsAPI } from '../api';
import { FileText, Plus, Trash2, Download, Wand2 } from 'lucide-react';

export default function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('en');
  const [applicationId, setApplicationId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [r, a] = await Promise.all([
        resumesAPI.getAll(),
        applicationsAPI.getAll({ per_page: 100 }),
      ]);
      setResumes(r.data);
      setApplications(a.data.data || a.data);
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await resumesAPI.create({ content, language, application_id: applicationId || null });
    setShowForm(false);
    setContent('');
    setLanguage('en');
    setApplicationId('');
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resume?')) return;
    await resumesAPI.delete(id);
    setResumes((prev) => prev.filter((r) => r.id !== id));
  };

  const handleGenerate = async (id) => {
    await resumesAPI.generateWithAi(id);
    loadData();
  };

  const handleExport = async (id) => {
    const res = await resumesAPI.exportPdf(id);
    window.open(res.data.url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-[20px] tracking-widest dark:text-white">Resumes</h1>
        <button onClick={() => setShowForm(true)} className="neu-btn flex items-center gap-2 text-[12px]">
          <Plus className="w-4 h-4" /> New Resume
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="font-bold dark:text-white">Loading...</div></div>
      ) : resumes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-600 text-[14px]">No resumes yet</div>
          <button onClick={() => setShowForm(true)} className="mt-4 neu-btn-outline text-[12px]">
            Create your first resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <div key={resume.id} className="neu-card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <FileText className="w-5 h-5 text-gray-400" />
                <div className="flex gap-1">
                  <button onClick={() => handleGenerate(resume.id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="Generate with AI">
                    <Wand2 className="w-4 h-4 text-purple-600" />
                  </button>
                  <button onClick={() => handleExport(resume.id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="Export PDF">
                    <Download className="w-4 h-4 text-blue-600" />
                  </button>
                  <button onClick={() => handleDelete(resume.id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="text-[12px]">
                <div className="font-bold dark:text-white mb-1">
                  {resume.application?.company_name || 'Global Resume'}
                  {resume.is_finalized && <span className="ml-2 text-green-600 text-[10px] font-bold">FINALIZED</span>}
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-[11px] mb-2">
                  Language: {resume.language?.toUpperCase()} | {new Date(resume.created_at).toLocaleDateString()}
                </div>
                <div className="text-[11px] dark:text-gray-400 whitespace-pre-wrap line-clamp-4">
                  {resume.content?.substring(0, 200)}...
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111] border-2 border-[#111] dark:border-gray-800 rounded-xl shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] w-full max-w-lg">
            <div className="p-4 border-b-2 border-[#111] dark:border-gray-800">
              <h2 className="font-bold text-[16px] dark:text-white">New Resume</h2>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div>
                <label className="neu-label">Application (optional)</label>
                <select value={applicationId} onChange={(e) => setApplicationId(e.target.value)} className="neu-input text-[12px]">
                  <option value="">— Global/Base Resume —</option>
                  {applications.map((a) => (
                    <option key={a.id} value={a.id}>{a.company_name} — {a.position}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="neu-label">Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="neu-input text-[12px]">
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                  <option value="de">German</option>
                </select>
              </div>
              <div>
                <label className="neu-label">Content (Markdown/Text)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="neu-input text-[12px]"
                  rows={10}
                  placeholder="Paste your resume content here..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="neu-btn flex-1 text-[12px]">Create Resume</button>
                <button type="button" onClick={() => setShowForm(false)} className="neu-btn-outline flex-1 text-[12px]">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}