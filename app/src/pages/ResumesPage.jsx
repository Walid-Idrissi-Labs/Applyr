import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumesAPI } from '../api';
import { FileText, Download, Eye, Upload, FileCheck2 } from 'lucide-react';

export default function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [globalContent, setGlobalContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

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

  const handleGlobalUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(`Uploaded ${file.name}. AI extraction is mock in this version...`);
      setTimeout(() => {
        setGlobalContent("Extracted text from " + file.name + ":\n\nExperienced Software Engineer with a background in building scalable web applications using Laravel, React, and Node.js. Strong focus on backend architecture, API design, and performance optimization. Passionate about clean code and agile methodologies.");
      }, 1000);
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

  const tailoredResumes = resumes.filter(r => r.application_id !== null);

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col transition-colors duration-300">
      <h2 className="text-[20px] mb-6 font-bold flex items-center gap-2 dark:text-white">
        <FileText className="w-5 h-5" /> My Resumes
      </h2>
      
      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="font-bold dark:text-white">Loading...</div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden pb-4">
          
          {/* Global Base Resume */}
          <div className="border-2 border-[#111] dark:border-gray-800 rounded-xl bg-white dark:bg-[#111] p-6 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] flex flex-col">
            <div className="flex justify-between items-center border-b-2 border-gray-100 dark:border-gray-800 pb-3 mb-4">
              <h3 className="font-bold text-[16px] dark:text-white">Global Base Resume</h3>
              <button 
                onClick={() => document.getElementById('global-pdf-upload').click()} 
                className="text-[11px] font-bold border-2 border-[#111] dark:border-gray-700 rounded-md px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-[#111] dark:hover:bg-white hover:text-white dark:hover:text-[#111] transition-colors flex items-center gap-1.5 dark:text-gray-300"
              >
                <Upload className="w-3 h-3" /> Upload PDF
              </button>
              <input type="file" id="global-pdf-upload" className="hidden" accept=".pdf" onChange={handleGlobalUpload} />
            </div>
            <p className="text-[12px] text-gray-600 dark:text-gray-400 mb-4">
              Upload your standard PDF resume or paste the text below. The AI will extract and use this content to generate tailored resumes for specific job applications.
            </p>
            
            <div className="flex-1 flex flex-col min-h-[250px]">
              <label className="font-bold text-[12px] mb-1.5 text-gray-700 dark:text-gray-300">Extracted Resume Text</label>
              <textarea 
                value={globalContent}
                onChange={(e) => setGlobalContent(e.target.value)}
                className="w-full flex-1 border-2 border-[#111] dark:border-gray-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#111] dark:focus:ring-gray-500 text-[12px] resize-none bg-white dark:bg-[#0a0a0a] dark:text-gray-200"
              />
            </div>
            
            <button 
              onClick={handleSaveGlobalCV}
              disabled={saving}
              className="w-full border-2 border-[#111] dark:border-gray-700 rounded-md bg-[#111] dark:bg-white text-white dark:text-[#111] px-4 py-2.5 font-bold hover:bg-white dark:hover:bg-[#eee] hover:text-[#111] transition-colors mt-4 shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Base Resume'}
            </button>
          </div>

          {/* Tailored Resumes */}
          <div className="border-2 border-[#111] dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] p-6 flex flex-col overflow-hidden">
            <h3 className="font-bold text-[16px] border-b-2 border-gray-200 dark:border-gray-800 pb-3 mb-4 dark:text-white">Tailored Resumes</h3>
            <p className="text-[12px] text-gray-600 dark:text-gray-400 mb-4">
              Resumes automatically generated by AI for specific job applications.
            </p>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {tailoredResumes.length > 0 ? (
                tailoredResumes.map(cv => (
                  <div key={cv.id} className="flex justify-between items-center bg-white dark:bg-[#111] border-2 border-[#111] dark:border-gray-800 rounded-lg p-4 shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] transition-all">
                    <div>
                      <div className="font-bold text-[14px] flex items-center gap-2 dark:text-white">
                        <FileCheck2 className="w-4 h-4 text-green-600" /> {cv.application?.company_name || 'Unknown'} Application
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                        Tailored CV • Generated {new Date(cv.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleExport(cv.id)} className="p-1.5 border-2 border-transparent hover:border-[#111] dark:hover:border-gray-600 rounded-md transition-all text-blue-600 bg-blue-50 dark:bg-blue-900/20" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                      <button onClick={() => navigate(`/resumes/${cv.id}/preview`)} className="p-1.5 border-2 border-transparent hover:border-[#111] dark:hover:border-gray-600 rounded-md transition-all text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 font-bold p-6 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-lg">
                  No tailored resumes generated yet. Go to an application to generate one.
                </div>
              )}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
