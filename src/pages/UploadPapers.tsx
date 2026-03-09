import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useStore } from '../store/useStore';
import { analyzeExamPaper } from '../lib/gemini';
import { Upload, File, CheckCircle, Loader2 } from 'lucide-react';

export default function UploadPapers() {
  const { user, geminiKey } = useStore();
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [year, setYear] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchExams = async () => {
      if (!user) return;
      const q = query(collection(db, 'exams'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      setExams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchExams();
  }, [user]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedExam || !year || !user) return;
    if (!geminiKey) {
      alert("Please set your Gemini API key in Settings first.");
      return;
    }

    setUploading(true);
    setStatus('Uploading PDF...');
    try {
      // 1. Upload to Firebase Storage
      const storageRef = ref(storage, `papers/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      setStatus('Extracting text from PDF...');
      // 2. Extract text via backend
      const formData = new FormData();
      formData.append('file', file);
      const extractRes = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData,
      });
      const { text } = await extractRes.json();

      if (!text) throw new Error("Failed to extract text");

      setStatus('Analyzing with Gemini AI...');
      // 3. Analyze with Gemini
      const analysis = await analyzeExamPaper(geminiKey, text);

      setStatus('Saving results...');
      // 4. Save to Firestore
      await addDoc(collection(db, 'papers'), {
        userId: user.uid,
        examId: selectedExam,
        year,
        fileName: file.name,
        fileUrl: url,
        analysis,
        createdAt: new Date().toISOString()
      });

      setStatus('Complete!');
      setFile(null);
      setYear('');
      setTimeout(() => setStatus(''), 3000);
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Upload Past Papers</h1>
      
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Exam</label>
            <select
              required
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Select Exam --</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.name} ({exam.subject})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              required
              min="2000"
              max="2099"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. 2023"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload PDF</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" accept=".pdf" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PDF up to 10MB</p>
              </div>
            </div>
            {file && <p className="mt-2 text-sm text-gray-600 flex items-center"><File className="w-4 h-4 mr-2"/> {file.name}</p>}
          </div>

          <button
            type="submit"
            disabled={uploading || !file || !selectedExam || !year}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {uploading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
            ) : (
              'Upload & Analyze'
            )}
          </button>

          {status && (
            <div className={`mt-4 p-4 rounded-md flex items-center ${status.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
              {status === 'Complete!' ? <CheckCircle className="w-5 h-5 mr-2" /> : <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
