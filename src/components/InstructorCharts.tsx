'use client';

import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface CourseRevenue { name: string; revenue: number; }
interface MonthlyTrend { month: string; enrollments: number; }

export default function InstructorCharts({
  courseRevenue, monthlyTrend,
}: { courseRevenue: CourseRevenue[]; monthlyTrend: MonthlyTrend[]; }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card-premium bg-brand-navy/60 glass-dark border border-white/5 p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-brand-white mb-4">الإيرادات حسب الدورة</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={courseRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#77839A' }} interval={0} angle={-15} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 11, fill: '#77839A' }} />
            <Tooltip contentStyle={{ background: '#0F1830', border: '1px solid rgba(59,91,219,0.3)', borderRadius: 10, color: '#F2F5FA' }} />
            <Bar dataKey="revenue" fill="#3B5BDB" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card-premium bg-brand-navy/60 glass-dark border border-white/5 p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-brand-white mb-4">اتجاه التسجيلات (آخر 6 أشهر)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#77839A' }} />
            <YAxis tick={{ fontSize: 11, fill: '#77839A' }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#0F1830', border: '1px solid rgba(59,91,219,0.3)', borderRadius: 10, color: '#F2F5FA' }} />
            <Line type="monotone" dataKey="enrollments" stroke="#7C93F0" strokeWidth={2.5} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
