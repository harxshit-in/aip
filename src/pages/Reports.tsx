import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../store/useStore';
import { generateStudyStrategy } from '../lib/gemini';
import { Download, FileText, Loader2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function Reports() {
  const { user, geminiKey, brandName, coachingMode } = useStore();
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [strategy, setStrategy] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      if (!user) return;
      const q = query(collection(db, 'exams'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      setExams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchExams();
  }, [user]);

  const handleGenerateStrategy = async () => {
    if (!selectedExam || !user || !geminiKey) {
      alert("Please select an exam and ensure Gemini API key is set.");
      return;
    }
    setLoading(true);
    try {
      const q = query(collection(db, 'papers'), where('examId', '==', selectedExam));
      const snapshot = await getDocs(q);
      
      const allQuestions: any[] = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.analysis && Array.isArray(data.analysis)) {
          allQuestions.push(...data.analysis);
        }
      });

      const chapterCounts: Record<string, number> = {};
      allQuestions.forEach(q => {
        const ch = q.detected_chapter || 'Unknown';
        chapterCounts[ch] = (chapterCounts[ch] || 0) + 1;
      });

      const trendsData = Object.keys(chapterCounts).map(ch => ({
        chapter: ch,
        frequency: chapterCounts[ch]
      })).sort((a, b) => b.frequency - a.frequency).slice(0, 15);

      const result = await generateStudyStrategy(geminiKey, trendsData);
      setStrategy(result);
    } catch (error) {
      console.error(error);
      alert("Error generating strategy.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('report-content');
    if (!element) return;
    
    const opt = {
      margin:       1,
      filename:     `${selectedExam}_Study_Strategy.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Study Strategy & Reports</h1>
        <div className="flex gap-4">
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">-- Select Exam --</option>
            {exams.map(exam => (
              <option key={exam.id} value={exam.id}>{exam.name}</option>
            ))}
          </select>
          <button
            onClick={handleGenerateStrategy}
            disabled={loading || !selectedExam}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
            Generate Strategy
          </button>
        </div>
      </div>

      {strategy && (
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm relative">
          <button
            onClick={handleDownloadPDF}
            className="absolute top-6 right-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </button>

          <div id="report-content" className="prose max-w-none pt-8">
            {coachingMode && (
              <div className="text-center border-b pb-6 mb-6">
                <h1 className="text-3xl font-bold text-indigo-700">{brandName}</h1>
                <p className="text-gray-500">AI-Generated Study Strategy Report</p>
              </div>
            )}
            
            <h2 className="text-2xl font-bold mb-4">Priority Chapters</h2>
            <ul className="list-disc pl-5 mb-8">
              {strategy.priority_chapters?.map((ch: string, i: number) => (
                <li key={i} className="text-gray-700">{ch}</li>
              ))}
            </ul>

            <h2 className="text-2xl font-bold mb-4">Study Time Allocation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {strategy.study_time_allocation?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="font-medium">{item.chapter}</span>
                  <span className="text-indigo-600 font-bold">{item.percentage}%</span>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-bold mb-4">Weekly Study Plan</h2>
            <div className="space-y-4">
              {strategy.weekly_plan?.map((week: any, i: number) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-2">{week.week}</h3>
                  <ul className="list-disc pl-5">
                    {week.topics?.map((topic: string, j: number) => (
                      <li key={j} className="text-gray-600">{topic}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
