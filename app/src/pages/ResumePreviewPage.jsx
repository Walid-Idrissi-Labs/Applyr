import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { resumesAPI } from '../api';
import ReactMarkdown from 'react-markdown';
import { Printer, ArrowLeft } from 'lucide-react';

export default function ResumePreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const isAutoPrint = searchParams.get('print') === 'true';

  useEffect(() => {
    loadResume();
  }, [id]);

  const loadResume = async () => {
    try {
      const res = await resumesAPI.getOne(id);
      setResume(res.data);
      
      // Set document title for PDF name (e.g. "OpenAI_Senior_Platform_Engineer_Resume")
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

  useEffect(() => {
    if (!loading && resume && isAutoPrint) {
      // Small delay to ensure ReactMarkdown is fully rendered
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, resume, isAutoPrint]);

  if (loading) {
    return <div className="p-8 text-center bg-gray-100 dark:bg-[#0a0a0a] min-h-screen dark:text-white">Loading resume...</div>;
  }

  if (!resume) {
    return <div className="p-8 text-center text-red-500 bg-gray-100 dark:bg-[#0a0a0a] min-h-screen">Failed to load resume.</div>;
  }

  return (
    <div className="h-screen overflow-y-auto bg-gray-100 dark:bg-[#0a0a0a] text-[#111] dark:text-gray-100 font-sans print:bg-white print:h-auto print:overflow-visible">
      <style>
        {`
          @media print {
            @page { margin: 0; }
            body { margin: 0; background: white !important; }
            .print-container { padding: 20mm; }
          }
        `}
      </style>

      {/* Action Bar - Hidden during print */}
      {!isAutoPrint && (
        <div className="print:hidden sticky top-0 z-10 bg-white dark:bg-[#111] border-b-2 border-[#111] dark:border-gray-800 shadow-[0_4px_0_0_rgba(17,17,17,1)] dark:shadow-none px-4 sm:px-6 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center justify-center gap-2 px-3 py-1.5 text-[12px] font-bold text-[#111] dark:text-white bg-gray-50 dark:bg-gray-800 border-2 border-[#111] dark:border-gray-700 rounded-md hover:bg-[#111] dark:hover:bg-white hover:text-white dark:hover:text-[#111] transition-colors w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          
          <button 
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-4 py-2 text-[12px] font-bold text-white bg-[#111] dark:bg-white dark:text-[#111] border-2 border-[#111] dark:border-gray-700 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] w-full sm:w-auto"
          >
            <Printer className="w-4 h-4" /> Save as PDF
          </button>
        </div>
      )}

      {/* Resume Document Area */}
      <div className="p-4 sm:p-8 flex justify-center print:p-0 print:bg-transparent">
        {/* Paper style container */}
        <div className="print-container w-full max-w-[800px] bg-white text-black p-10 sm:p-14 border-2 border-[#111] shadow-[8px_8px_0_0_rgba(17,17,17,1)] dark:border-gray-800 dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.05)] print:border-none print:shadow-none print:max-w-full"
             style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: '11pt', lineHeight: '1.5', color: '#000' }}>
          
          <div className="resume-content">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 style={{ fontSize: '24pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', letterSpacing: '1px' }} {...props} />,
                h2: ({node, ...props}) => <h2 style={{ fontSize: '13pt', fontWeight: 'bold', borderBottom: '2px solid black', marginTop: '24px', marginBottom: '12px', paddingBottom: '4px', textTransform: 'uppercase' }} {...props} />,
                h3: ({node, ...props}) => <h3 style={{ fontSize: '11pt', fontWeight: 'bold', marginTop: '12px', marginBottom: '4px' }} {...props} />,
                p: ({node, ...props}) => <p style={{ marginBottom: '10px' }} {...props} />,
                ul: ({node, ...props}) => <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '12px' }} {...props} />,
                ol: ({node, ...props}) => <ol style={{ listStyleType: 'decimal', paddingLeft: '24px', marginBottom: '12px' }} {...props} />,
                li: ({node, ...props}) => <li style={{ marginBottom: '4px' }} {...props} />,
                strong: ({node, ...props}) => <strong style={{ fontWeight: 'bold' }} {...props} />,
                em: ({node, ...props}) => <em style={{ fontStyle: 'italic' }} {...props} />,
                a: ({node, ...props}) => <a style={{ color: 'black', textDecoration: 'none' }} {...props} />
              }}
            >
              {resume.content}
            </ReactMarkdown>
          </div>
          
        </div>
      </div>
    </div>
  );
}
