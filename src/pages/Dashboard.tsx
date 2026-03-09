import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, UploadCloud, TrendingUp, BookOpen } from 'lucide-react';

export default function Dashboard() {
  const { user } = useStore();
  const [stats, setStats] = useState({ exams: 0, papers: 0, questions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const examsQuery = query(collection(db, 'exams'), where('userId', '==', user.uid));
        const examsSnapshot = await getDocs(examsQuery);
        
        const papersQuery = query(collection(db, 'papers'), where('userId', '==', user.uid));
        const papersSnapshot = await getDocs(papersQuery);

        setStats({
          exams: examsSnapshot.size,
          papers: papersSnapshot.size,
          questions: papersSnapshot.size * 50 // Mocked for now
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const mockData = [
    { name: 'Physics', questions: 120 },
    { name: 'Chemistry', questions: 98 },
    { name: 'Maths', questions: 150 },
    { name: 'Biology', questions: 80 },
  ];

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Exams" value={stats.exams} icon={FileText} color="bg-blue-500" />
        <StatCard title="Uploaded Papers" value={stats.papers} icon={UploadCloud} color="bg-green-500" />
        <StatCard title="Questions Analyzed" value={stats.questions} icon={BookOpen} color="bg-purple-500" />
        <StatCard title="Trend Accuracy" value="94%" icon={TrendingUp} color="bg-indigo-500" />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <h2 className="text-lg font-semibold mb-4">Questions by Subject</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="questions" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
      <div className={`${color} p-4 rounded-lg text-white mr-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
