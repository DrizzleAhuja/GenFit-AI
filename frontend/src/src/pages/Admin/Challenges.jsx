import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "../../../config/api";
import { PlusCircle, Award, RefreshCcw, Pencil, Trash2, X } from 'lucide-react';

function toDateInputValue(value) {
  if (value == null || value === '') return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Today's calendar date in local timezone (YYYY-MM-DD). */
function getTodayDateInputValue() {
  return toDateInputValue(new Date());
}

/** Add days to a YYYY-MM-DD string; returns YYYY-MM-DD in local calendar. */
function addDaysToDateInput(yyyyMmDd, days) {
  if (!yyyyMmDd) return '';
  const [y, m, d] = yyyyMmDd.split('-').map(Number);
  if (!y || !m || !d) return '';
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return '';
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

function formatDisplayDate(value) {
  if (value == null || value === '') return 'Not set';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleDateString();
}

function formatEndLine(weekEndAt) {
  if (weekEndAt == null || weekEndAt === '') {
    return 'Not set — use Edit to add an end date (required for auto-expiry).';
  }
  const d = new Date(weekEndAt);
  if (Number.isNaN(d.getTime())) return 'Invalid — use Edit to set a valid end date.';
  return d.toLocaleDateString();
}

export default function Challenges() {
  const [formData, setFormData] = useState({
    title: '',
    target: '',
    points: 30,
    type: 'workout',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });
  const [loadingChallenge, setLoadingChallenge] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [notice, setNotice] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 7000);
    return () => clearTimeout(t);
  }, [notice]);

  const authHeaders = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return { email: user.email };
  };

  const fetchCurrentChallenge = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/current-challenge`, {
        headers: authHeaders()
      });
      if (res.data.success) {
        setCurrentChallenge(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch challenge", err);
    } finally {
      setLoadingChallenge(false);
    }
  };

  useEffect(() => {
    fetchCurrentChallenge();
  }, []);

  const resetForm = () => {
    setFormData({ title: '', target: '', points: 30, type: 'workout', startDate: '', endDate: '' });
    setIsEditing(false);
  };

  const startEdit = () => {
    if (!currentChallenge) return;
    setIsEditing(true);
    setFormData({
      title: currentChallenge.title || '',
      target: String(currentChallenge.target ?? ''),
      points: currentChallenge.points ?? 30,
      type: currentChallenge.type || 'workout',
      startDate: toDateInputValue(currentChallenge.weekStartAt),
      endDate: toDateInputValue(currentChallenge.weekEndAt),
    });
  };

  const handleStartDateChange = (e) => {
    const v = e.target.value;
    if (!v) {
      setFormData((prev) => ({ ...prev, startDate: '', endDate: '' }));
      return;
    }
    const suggestedEnd = addDaysToDateInput(v, 7);
    setFormData((prev) => ({ ...prev, startDate: v, endDate: suggestedEnd }));
  };

  const confirmDeleteChallenge = async () => {
    if (!currentChallenge) return;
    setDeleteModalOpen(false);
    setDeleteLoading(true);
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/admin/challenge`, {
        headers: authHeaders()
      });
      if (res.data.success) {
        setNotice({ type: 'success', text: 'Weekly challenge removed for all users.' });
        setCurrentChallenge(null);
        resetForm();
      }
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.message || 'Failed to delete challenge.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const todayStr = getTodayDateInputValue();
    const origStart =
      isEditing && currentChallenge
        ? toDateInputValue(currentChallenge.weekStartAt)
        : '';

    if (!formData.startDate || !formData.endDate) {
      setNotice({ type: 'error', text: 'Please choose both start and end dates.' });
      return;
    }

    const startBeforeToday =
      formData.startDate < todayStr &&
      !(isEditing && formData.startDate === origStart);
    if (startBeforeToday) {
      setNotice({
        type: 'error',
        text: 'Start date cannot be before today.',
      });
      return;
    }

    if (formData.endDate < formData.startDate) {
      setNotice({
        type: 'error',
        text: 'End date must be on or after the start date.',
      });
      return;
    }

    setLoading(true);
    try {
      const url = isEditing
        ? `${API_BASE_URL}/api/admin/challenge`
        : `${API_BASE_URL}/api/admin/create-challenge`;
      const method = isEditing ? 'put' : 'post';
      const res = await axios[method](url, formData, {
        headers: authHeaders()
      });
      if (res.data.success) {
        setNotice({
          type: 'success',
          text: isEditing ? 'Challenge updated for all users.' : 'Weekly challenge created and sent to all users.',
        });
        resetForm();
        fetchCurrentChallenge();
      }
    } catch (err) {
      setErrorModal({
        isOpen: true,
        title: isEditing ? 'Could not update' : 'Cannot create challenge',
        message: err.response?.data?.message || (isEditing ? 'Update failed.' : 'Create failed.')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
          Weekly Challenges
        </h1>
        <p className="text-gray-400 mt-1">Only one weekly challenge runs at a time. After the end date passes, it stops automatically for all users.</p>
      </div>

      {notice && (
        <div
          className={`rounded-2xl border px-4 py-3 flex items-start justify-between gap-3 shadow-lg ${
            notice.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-100'
              : 'bg-red-950/50 border-red-500/40 text-red-100'
          }`}
          role="status"
        >
          <p className="text-sm leading-relaxed pr-2">{notice.text}</p>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4 opacity-80" />
          </button>
        </div>
      )}

      {loadingChallenge ? (
         <p className="text-gray-400">Loading current challenge...</p>
      ) : currentChallenge ? (
         <div className="bg-[#0c0520]/60 p-5 rounded-2xl border border-[#22D3EE]/30 backdrop-blur-md shadow-lg">
           <div className="flex flex-wrap items-start justify-between gap-3">
             <h3 className="text-lg font-bold text-[#22D3EE] flex items-center gap-2"><Award /> Active challenge</h3>
             <div className="flex gap-2">
               <button
                 type="button"
                 onClick={startEdit}
                 className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22D3EE]/15 border border-[#22D3EE]/40 text-[#22D3EE] text-sm font-medium hover:bg-[#22D3EE]/25"
               >
                 <Pencil size={16} /> Edit
               </button>
               <button
                 type="button"
                 onClick={() => setDeleteModalOpen(true)}
                 disabled={deleteLoading}
                 className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/35 text-red-300 text-sm font-medium hover:bg-red-500/20 disabled:opacity-50"
               >
                 <Trash2 size={16} /> {deleteLoading ? '…' : 'Delete'}
               </button>
             </div>
           </div>
           <p className="text-white font-medium mt-1">{currentChallenge.title}</p>
           <div className="text-sm text-gray-400 mt-2 flex flex-col gap-1">
             <div>Target: <span className="text-purple-400 font-bold">{currentChallenge.target}</span> | Points: <span className="text-yellow-400 font-bold">{currentChallenge.points}</span></div>
             <div>
               Starts: <span className="text-gray-200">{formatDisplayDate(currentChallenge.weekStartAt)}</span>
               {' '} | Ends: <span className="text-gray-200">{formatEndLine(currentChallenge.weekEndAt)}</span>
             </div>
           </div>
         </div>
      ) : (
         <div className="bg-[#0c0520]/50 border border-amber-500/25 rounded-2xl p-5 text-gray-300">
           <p className="font-medium text-amber-200/90">No weekly challenge is set for this period.</p>
           <p className="text-sm text-gray-400 mt-2">Create one below. Users will not see a challenge until you launch it, and only one challenge can be active until its end date.</p>
         </div>
      )}


      <form onSubmit={handleSubmit} className="bg-[#0c0520]/40 backdrop-blur-md rounded-2xl p-8 border border-purple-500/20 shadow-2xl space-y-6">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-gray-400">
            {isEditing ? 'Editing the active challenge — save to apply to all users.' : 'Launch a new challenge (only when none is active).'}
          </p>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-[#22D3EE] hover:underline shrink-0"
            >
              Cancel edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">

            <label className="block text-sm font-medium text-gray-300 mb-1">Challenge Title</label>
            <input 
              type="text" 
              required
              placeholder="e.g., Log 5 Workouts"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-[#0c0520]/60 border border-purple-500/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#22D3EE]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Target Threshold (Count)</label>
            <input 
              type="number" 
              required
              min="1"
              placeholder="e.g., 5"
              value={formData.target}
              onChange={(e) => setFormData({...formData, target: e.target.value})}
              className="w-full bg-[#0c0520]/60 border border-purple-500/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#22D3EE]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Points Reward</label>
            <input 
              type="number" 
              min="1"
              value={formData.points}
              onChange={(e) => setFormData({...formData, points: e.target.value})}
              className="w-full bg-[#0c0520]/60 border border-purple-500/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#22D3EE]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
            <input
              type="date"
              required
              value={formData.startDate}
              min={!isEditing ? getTodayDateInputValue() : undefined}
              onChange={handleStartDateChange}
              className="w-full bg-[#0c0520]/60 border border-purple-500/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#22D3EE]"
            />
            <p className="text-xs text-gray-500 mt-1">
              {!isEditing
                ? 'Cannot be before today. Choosing a start date sets the end date to one week later — you can change the end date below.'
                : 'Changing the start date suggests an end date one week later; you can still edit the end date.'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
            <input
              type="date"
              required
              value={formData.endDate}
              min={formData.startDate || getTodayDateInputValue()}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full bg-[#0c0520]/60 border border-purple-500/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#22D3EE]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be on or after the start date.
            </p>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || (!isEditing && !!currentChallenge)}
          className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] py-3 rounded-xl text-black font-bold shadow-lg shadow-[#8B5CF6]/20 flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all mt-4"
          title={!isEditing && currentChallenge ? 'Delete or edit the active challenge first' : undefined}
        >
          {loading ? <RefreshCcw className="animate-spin" size={20} /> : <PlusCircle size={20} />}
          {loading ? 'Saving…' : isEditing ? 'Save changes' : 'Launch challenge'}
        </button>
      </form>

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c0520] border border-red-500/35 rounded-2xl p-6 max-w-md w-full shadow-[0_0_40px_rgba(239,68,68,0.2)]">
            <h3 className="text-lg font-bold text-white mb-2">Delete weekly challenge?</h3>
            <p className="text-sm text-gray-400 mb-6">
              This removes the challenge for every user. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-600 text-gray-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteChallenge}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal Card Popup */}
      {errorModal.isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-[#0c0520] border border-red-500/30 rounded-3xl p-6 max-w-sm w-full mx-4 shadow-[0_0_50px_rgba(239,68,68,0.25)] flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30 shadow-lg animation-bounce-subtle">
              <PlusCircle className="text-red-500 rotate-45 animate-pulse" size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">{errorModal.title}</h3>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">{errorModal.message}</p>
            </div>
            <button 
              onClick={() => setErrorModal({ ...errorModal, isOpen: false })}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl w-full shadow-md shadow-red-500/10 hover:opacity-90 transition-all font-medium text-sm mt-2"
            >
              Acknowledged
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
