import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function TrendAnalysis() {
  const { user } = useStore();
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [analysisData, setAnalysisData] = useState<any[]>([]);
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

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!selectedExam || !user) return;
      setLoading(true);
      try {
        const q = query(collection(db, 'papers'), where('examId', '==', selectedExam));
        const snapshot = await getDocs(q);
        
        // Aggregate data
        const allQuestions: any[] = [];
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.analysis && Array.isArray(data.analysis)) {
            allQuestions.push(...data.analysis);
          }
        });

        // Process for charts
        const chapterCounts: Record<string, number> = {};
        allQuestions.forEach(q => {
          const ch = q.detected_chapter || 'Unknown';
          chapterCounts[ch] = (chapterCounts[ch] || 0) + 1;
        });

        const chartData = Object.keys(chapterCounts).map(ch => ({
          name: ch,
          value: chapterCounts[ch]
        })).sort((a, b) => b.value - a.value).slice(0, 10); // Top 10

        setAnalysisData(chartData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [selectedExam, user]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Trend Analysis</h1>
        <select
          value={selectedExam}
          onChange={(e) => setSelectedExam(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">-- Select Exam to Analyze --</option>
          {exams.map(exam => (
            <option key={exam.id} value={exam.id}>{exam.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">Loading analysis...</div>
      ) : selectedExam && analysisData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Top Chapters by Frequency</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysisData} layout="vertical" margin={{ left: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Chapter Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analysisData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {analysisData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm col-span-1 lg:col-span-2">
             <h2 className="text-lg font-semibold mb-4">Chapter Importance Ranking</h2>
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chapter</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Questions Asked</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Importance Score</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {analysisData.map((item, index) => (
                     <tr key={item.name}>
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{index + 1}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.name}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.value}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         <div className="w-full bg-gray-200 rounded-full h-2.5">
                           <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, item.value * 5)}%` }}></div>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      ) : selectedExam ? (
        <div className="text-center py-20 text-gray-500">No data available for this exam. Upload papers first.</div>
      ) : (
        <div className="text-center py-20 text-gray-500">Select an exam to view trends.</div>
      )}
    </div>
  );
}
