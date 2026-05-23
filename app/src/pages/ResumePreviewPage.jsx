import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { resumesAPI } from '../api';
import ReactMarkdown from 'react-markdown';
import { Printer, ArrowLeft, Wand2, History, FileText, Check, X, ExternalLink, Clock, Download, Edit2, Upload } from 'lucide-react';

const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'French', value: 'fr' },
  { label: 'Spanish', value: 'es' },
  { label: 'German', value: 'de' },
  { label: 'Arabic', value: 'ar' },
];

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

export default function ResumePreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showRefineModal, setShowRefineModal] = useState(false);
  const [refineForm, setRefineForm] = useState({ language: 'en', notes: '' });
  const [refineStep, setRefineStep] = useState('idle'); // 'idle', 'generating', 'success'
  const [loadingMsg, setLoadingMsg] = useState('');
  const [newResumeId, setNewResumeId] = useState(null);

  // Global Edit States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);

  const isAutoPrint = searchParams.get('print') === 'true';
  const fromSource = searchParams.get('from');

  useEffect(() => {
    let interval;
    if (refineStep === 'generating') {
      const getRandomMsg = () => QUIRKY_MSGS[Math.floor(Math.random() * QUIRKY_MSGS.length)];
      setLoadingMsg(getRandomMsg());
      interval = setInterval(() => setLoadingMsg(getRandomMsg()), 2500);
    }
    return () => clearInterval(interval);
  }, [refineStep]);

  useEffect(() => {
    loadResume();
  }, [id]);

  const loadResume = async () => {
    setLoading(true);
    try {
      const res = await resumesAPI.getOne(id);
      setResume(res.data);
      setRefineForm(prev => ({ ...prev, language: res.data.language || 'en' }));
      
      let docTitle = 'Resume';
      if (res.data.application) {
        const company = res.data.application.company_name || 'Company';
        const position = res.data.application.position || 'Position';
        docTitle = `${company}_${position}_Resume`.replace(/\s+/g, '_');
      } else {
        docTitle = 'Global_Base_Resume';
      }
      document.title = docTitle;

    } catch (e) {
      console.error('Failed to load resume', e);
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setExtracting(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('text', "Uploaded file: " + file.name); 
    try {
      const res = await resumesAPI.extract(formData);
      setEditContent(res.data.content);
    } catch (e) {
      alert('AI extraction failed.');
    } finally {
      setExtracting(false);
    }
  };

  const saveMasterProfile = async () => {
    setSaving(true);
    try {
      await resumesAPI.update(resume.id, { content: editContent });
      setResume({ ...resume, content: editContent });
      setShowEditModal(false);
    } catch (e) {
      alert('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleRefine = async () => {
    setRefineStep('generating');
    try {
      // Logic for refining: creating a new resume version based on current one + feedback
      const res = await resumesAPI.create({
        application_id: resume.application_id,
        content: resume.content, // Pass current content as base for refinement
        language: refineForm.language,
      });
      // Pass the refinement notes to the AI
      await resumesAPI.generateWithAi(res.data.id, { notes: refineForm.notes });
      setNewResumeId(res.data.id);
      setRefineStep('success');
    } catch (e) {
      alert('Failed to refine resume.');
      setRefineStep('idle');
    }
  };

  useEffect(() => {
    if (!loading && resume && isAutoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, resume, isAutoPrint]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-200 dark:border-purple-900 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <div className="font-bold text-gray-500 dark:text-gray-400">Loading Resume Architect...</div>
        </div>
      </div>
    );
  }

  if (!resume) {
    return <div className="p-8 text-center text-red-500 bg-gray-100 dark:bg-[#0a0a0a] min-h-screen">Failed to load resume.</div>;
  }

  const application = resume.application;
  const versions = application?.resumes || [];
  const sortedVersions = [...versions].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  const currentVersionIndex = versions.findIndex(v => v.id === resume.id);
  const versionNumber = versions.length - sortedVersions.findIndex(v => v.id === resume.id);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100 dark:bg-[#0a0a0a] text-[#111] dark:text-gray-100 font-mono transition-colors duration-300 print:bg-white print:h-auto print:overflow-visible">
      <style>
        {`
          @media print {
            @page { margin: 0; }
            body { margin: 0; background: white !important; }
            .print-container { padding: 20mm; border: none !important; box-shadow: none !important; }
          }
        `}
      </style>

      {/* Header */}
      <header className="p-4 border-b-2 border-[#111] dark:border-gray-800 bg-white dark:bg-[#111] flex justify-between items-center shrink-0 print:hidden z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (fromSource === 'resumes') {
                navigate('/resumes');
              } else if (application) {
                navigate(`/applications/${application.id}`);
              } else {
                navigate('/resumes');
              }
            }} 
            className="neu-btn-outline p-1.5 rounded-md"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="font-bold text-lg tracking-tight truncate dark:text-white uppercase">
              {application ? `${application.company_name} — ${application.position}` : 'Global Base Resume'}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                VERSION {versionNumber}
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">
                {LANGUAGES.find(l => l.value === resume.language)?.label || resume.language}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="neu-btn-outline flex items-center gap-2 px-4 py-2 text-[12px] font-bold"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
          
          {application ? (
            <button 
              onClick={() => { setRefineStep('idle'); setShowRefineModal(true); }}
              className="neu-btn flex items-center gap-2 px-4 py-2 text-[12px] font-bold !bg-purple-600 !text-white !border-[#111]"
            >
              <Wand2 className="w-4 h-4" /> Refine with AI
            </button>
          ) : (
            <button 
              onClick={() => { setEditContent(resume.content || ''); setShowEditModal(true); }}
              className="neu-btn flex items-center gap-2 px-4 py-2 text-[12px] font-bold !bg-blue-600 !text-white !border-[#111]"
            >
              <Edit2 className="w-4 h-4" /> Edit Master Profile
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Timeline */}
        {application && (
          <aside className="w-72 border-r-2 border-[#111] dark:border-gray-800 bg-gray-50 dark:bg-[#0d0d0d] flex flex-col overflow-hidden print:hidden">
            <div className="p-4 border-b-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] flex justify-between items-center">
              <h2 className="font-bold text-[12px] flex items-center gap-2 dark:text-white uppercase tracking-wider">
                <History className="w-4 h-4 text-purple-500" /> Version Timeline
              </h2>
              <button 
                onClick={() => navigate(`/applications/${application.id}`)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-[#111] dark:hover:text-white"
                title="View Application"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6 relative">
              <div className="absolute left-7 top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-800"></div>
              
              {sortedVersions.map((v, i) => {
                const isCurrent = v.id === resume.id;
                const vNum = versions.length - i;
                
                return (
                  <button 
                    key={v.id}
                    onClick={() => navigate(`/resumes/${v.id}/preview`)}
                    className={`w-full text-left relative pl-10 group transition-all ${isCurrent ? 'scale-105' : 'hover:translate-x-1'}`}
                  >
                    <div className={`absolute left-1.5 top-0 w-4 h-4 rounded-full border-2 border-white dark:border-[#0d0d0d] z-10 transition-colors ${isCurrent ? 'bg-purple-600 scale-125' : 'bg-gray-300 dark:bg-gray-700 group-hover:bg-purple-400'}`}></div>
                    
                    <div className={`p-3 rounded-xl border-2 transition-all ${isCurrent ? 'bg-white dark:bg-[#1a1a1a] border-[#111] shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.05)]' : 'bg-transparent border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[11px] font-bold ${isCurrent ? 'text-purple-600 dark:text-purple-400' : ''}`}>
                          V{vNum}
                        </span>
                        <span className="text-[9px] font-bold opacity-60">
                          {new Date(v.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold truncate">
                        {LANGUAGES.find(l => l.value === v.language)?.label || v.language} Resume
                      </div>
                      {v.is_finalized && (
                        <div className="mt-2 flex items-center gap-1 text-[9px] text-green-600 font-bold uppercase">
                          <Check className="w-3 h-3" /> Finalized
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Main Content: Resume Preview */}
        <section className="flex-1 bg-gray-200 dark:bg-[#050505] p-4 sm:p-10 overflow-y-auto custom-scrollbar flex justify-center print:p-0 print:bg-white">
          <div className="print-container w-full max-w-[800px] bg-white text-black p-10 sm:p-16 border-2 border-[#111] shadow-[12px_12px_0_0_rgba(17,17,17,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.03)] print:shadow-none print:border-none print:max-w-full"
               style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            
            <div className="resume-content text-[11pt] leading-[1.5]">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-center font-bold uppercase tracking-[2px] mb-6" style={{ fontSize: '22pt' }} {...props} />,
                  h2: ({node, ...props}) => <h2 className="font-bold border-b-2 border-black mt-8 mb-4 pb-1 uppercase tracking-wider" style={{ fontSize: '12pt' }} {...props} />,
                  h3: ({node, ...props}) => <h3 className="font-bold mt-4 mb-2" style={{ fontSize: '11pt' }} {...props} />,
                  p: ({node, ...props}) => <p className="mb-3" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                  em: ({node, ...props}) => <em className="italic" {...props} />,
                  a: ({node, ...props}) => <a className="text-black no-underline" {...props} />
                }}
              >
                {resume.content}
              </ReactMarkdown>
            </div>
          </div>
        </section>
      </main>

      {/* Refine Modal */}
      {showRefineModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111] border-2 border-[#111] dark:border-gray-800 rounded-2xl w-full max-w-md shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] overflow-hidden">
            <div className="p-4 border-b-2 border-[#111] dark:border-gray-800 flex justify-between items-center bg-purple-50 dark:bg-purple-900/10">
              <h3 className="font-bold text-[16px] dark:text-white flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-purple-600" /> 
                {refineStep === 'generating' ? 'AI is Refining...' : refineStep === 'success' ? 'Refinement Complete' : `Refine Version ${versionNumber}`}
              </h3>
              {refineStep !== 'generating' && (
                <button onClick={() => setShowRefineModal(false)} className="p-1 hover:bg-white dark:hover:bg-gray-800 rounded-md transition-colors"><X className="w-5 h-5 dark:text-white" /></button>
              )}
            </div>

            <div className="p-6">
              {refineStep === 'idle' && (
                <div className="space-y-5">
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-2 border-dashed border-purple-200 dark:border-purple-800 text-[11px] text-purple-700 dark:text-purple-300 font-bold">
                    You are refining <span className="underline">Version {versionNumber}</span>. This will create a new version based on your feedback.
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Target Language</label>
                    <select 
                      value={refineForm.language}
                      onChange={(e) => setRefineForm({ ...refineForm, language: e.target.value })}
                      className="w-full border-2 border-[#111] dark:border-gray-700 rounded-lg px-3 py-2 bg-gray-50 dark:bg-[#1a1a1a] dark:text-white text-[12px] font-bold outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">How should we improve it?</label>
                    <textarea 
                      value={refineForm.notes}
                      onChange={(e) => setRefineForm({ ...refineForm, notes: e.target.value })}
                      placeholder="e.g. Make the professional summary more punchy, or translate to French..."
                      className="w-full border-2 border-[#111] dark:border-gray-700 rounded-lg px-3 py-3 bg-gray-50 dark:bg-[#1a1a1a] dark:text-white text-[12px] h-28 resize-none outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={handleRefine}
                      className="flex-1 neu-btn py-3 !bg-purple-600 !text-white !border-[#111] font-bold text-[12px] flex items-center justify-center gap-2"
                    >
                      <Wand2 className="w-4 h-4" /> Start Refining
                    </button>
                    <button 
                      onClick={() => setShowRefineModal(false)}
                      className="flex-1 neu-btn-outline py-3 text-[12px] font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {refineStep === 'generating' && (
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

              {refineStep === 'success' && (
                <div className="py-6 flex flex-col items-center justify-center space-y-6 text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center border-2 border-green-500">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-[18px] dark:text-white">Refined Successfully!</p>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400">A new version has been architected for you.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setShowRefineModal(false);
                      navigate(`/resumes/${newResumeId}/preview`);
                    }}
                    className="w-full neu-btn py-3 !bg-[#111] dark:!bg-white !text-white dark:!text-[#111] font-bold text-[12px] flex items-center justify-center gap-2"
                  >
                    View New Version <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Edit Modal */}
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
                        onClick={() => document.getElementById('preview-pdf-upload').click()} 
                        disabled={extracting}
                        className="w-full neu-btn py-2 !bg-blue-600 !text-white !border-[#111] text-[11px] flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Wand2 className="w-4 h-4" /> {extracting ? 'Extracting...' : 'Upload & Extract'}
                      </button>
                      <input type="file" id="preview-pdf-upload" className="hidden" accept=".pdf" onChange={handleGlobalUpload} />
                   </div>
                </div>

                <div className="md:w-2/3 flex flex-col h-full min-h-[400px]">
                  <label className="font-bold text-[10px] uppercase text-gray-400 mb-2 tracking-widest px-1">Master Profile Content (Markdown)</label>
                  <textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full flex-1 border-2 border-[#111] dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-[#0a0a0a] dark:text-gray-200 text-[12px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono leading-relaxed"
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
                onClick={saveMasterProfile}
                disabled={saving}
                className="neu-btn px-8 py-2 text-[12px] font-bold !bg-[#111] dark:!bg-white !text-white dark:!text-[#111] flex items-center gap-2"
              >
                {saving ? 'Saving...' : <><Check className="w-4 h-4" /> Save Profile</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
