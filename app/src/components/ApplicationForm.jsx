import { useState } from 'react';
import { X } from 'lucide-react';

const STATUSES = ['Wishlist', 'Applied', 'Interview', 'Technical Test', 'Offer', 'Accepted', 'Rejected'];

export default function ApplicationForm({ application, tags, onSave, onClose }) {
  const [form, setForm] = useState({
    company_name: application?.company_name || '',
    position: application?.position || '',
    status: application?.status || 'wishlist',
    applied_at: application?.applied_at || '',
    link: application?.link || '',
    notes: application?.notes || '',
    source: application?.source || '',
    reminder_date: application?.reminder_date || '',
    posting_language: application?.posting_language || 'en',
    tag_ids: application?.tags?.map((t) => t.id) || [],
  });
  const [saving, setSaving] = useState(false);

  const setField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const toggleTag = (tagId) => {
    setForm((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter((id) => id !== tagId)
        : [...prev.tag_ids, tagId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#111] border-2 border-[#111] dark:border-gray-800 rounded-xl shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b-2 border-[#111] dark:border-gray-800">
          <h2 className="font-bold text-[16px] dark:text-white">
            {application ? 'Edit Application' : 'New Application'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <X className="w-5 h-5 dark:text-white" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="neu-label">Company *</label>
              <input required value={form.company_name} onChange={setField('company_name')} className="neu-input" placeholder="Google" />
            </div>
            <div>
              <label className="neu-label">Position *</label>
              <input required value={form.position} onChange={setField('position')} className="neu-input" placeholder="Software Engineer" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="neu-label">Status</label>
              <select value={form.status} onChange={setField('status')} className="neu-input">
                {STATUSES.map((s) => <option key={s} value={s.toLowerCase()}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="neu-label">Applied Date</label>
              <input type="date" value={form.applied_at} onChange={setField('applied_at')} className="neu-input" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="neu-label">Link</label>
              <input value={form.link} onChange={setField('link')} className="neu-input" placeholder="https://..." />
            </div>
            <div>
              <label className="neu-label">Source</label>
              <input value={form.source} onChange={setField('source')} className="neu-input" placeholder="LinkedIn, Career Site..." />
            </div>
          </div>

          <div>
            <label className="neu-label">Reminder Date</label>
            <input type="date" value={form.reminder_date} onChange={setField('reminder_date')} className="neu-input" />
          </div>

          <div>
            <label className="neu-label">Notes</label>
            <textarea
              value={form.notes}
              onChange={setField('notes')}
              className="neu-input"
              rows={3}
              placeholder="Interview notes, job description..."
            />
          </div>

          <div>
            <label className="neu-label">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-2 py-1 text-[11px] font-bold rounded border-2 transition-all ${
                    form.tag_ids.includes(tag.id)
                      ? 'border-[#111] dark:border-gray-500 bg-[#111] dark:bg-white text-white dark:text-[#111]'
                      : 'border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-[#111] dark:hover:border-gray-600'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="neu-btn flex-1 text-[12px]">
              {saving ? 'Saving...' : application ? 'Save Changes' : 'Create Application'}
            </button>
            <button type="button" onClick={onClose} className="neu-btn-outline flex-1 text-[12px]">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}