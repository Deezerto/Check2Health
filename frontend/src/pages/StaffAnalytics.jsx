import React, { useEffect, useState, useMemo } from 'react';
import DashboardNav from '../components/DashboardNav';
import { useNavigate } from 'react-router-dom';

export default function StaffAnalytics() {
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [staffName, setStaffName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const raw = sessionStorage.getItem('auth.user');
        if (!raw) { navigate('/login'); }
        else {
            try {
                const user = JSON.parse(raw);
                if (user.role !== 'STAFF' && user.role !== 'ADMIN') {
                    navigate('/login');
                } else {
                    setStaffName(`${user.firstName} ${user.lastName}`);
                }
            } catch (e) {
                navigate('/login');
            }
        }

        Promise.all([
            fetch('/api/reservations').then(res => res.json()),
            fetch('/api/doctors').then(res => res.json())
        ]).then(([resData, docData]) => {
            setReservations(resData);
            setDoctors(docData);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to fetch analytics data", err);
            setLoading(false);
        });
    }, [navigate]);

    // --- Data Processing ---

    // 1. Status Distribution
    const statusData = useMemo(() => {
        const counts = { CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0, PENDING: 0 };
        reservations.forEach(r => {
            const s = (r.reservationStatus || '').toUpperCase();
            if (counts[s] !== undefined) counts[s]++;
            else counts[s] = (counts[s] || 0) + 1;
        });
        const total = reservations.length || 1; // avoid div by 0
        return {
            counts,
            total,
            percentages: {
                CONFIRMED: (counts.CONFIRMED / total) * 100,
                COMPLETED: (counts.COMPLETED / total) * 100,
                CANCELLED: (counts.CANCELLED / total) * 100,
                PENDING: (counts.PENDING / total) * 100
            }
        };
    }, [reservations]);

    // 2. Booking by Doctor
    const doctorStats = useMemo(() => {
        const map = {};
        reservations.forEach(r => {
            const dName = r.doctor ? `Dr. ${r.doctor.lastName}` : 'Unknown';
            map[dName] = (map[dName] || 0) + 1;
        });
        const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 3);
        const total = reservations.length || 1;
        return sorted.map(([name, count]) => ({ name, count, pct: (count / total) * 100 }));
    }, [reservations]);

    // 3. Booking Trends (Last 7 Days)
    const trendData = useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            days.push(d.toISOString().split('T')[0]);
        }

        const counts = days.map(dateStr => {
            return reservations.filter(r => r.reservationDate.startsWith(dateStr)).length;
        });

        const max = Math.max(...counts, 5); // min max is 5
        return { days, counts, max };
    }, [reservations]);

    // --- Chart Helpers ---

    // Generate Line Chart Path
    const getLinePath = (data, height, width) => {
        if (!data.counts.length) return "";
        const stepX = width / (data.counts.length - 1);
        const points = data.counts.map((val, i) => {
            const x = i * stepX;
            const y = height - (val / data.max) * (height - 40); // leave 40px padding at top
            return `${x},${y}`;
        });
        return "M" + points.join(" L");
    };

    const getAreaPath = (data, height, width) => {
        const line = getLinePath(data, height, width);
        if (!line) return "";
        return `${line} L${width},${height} L0,${height} Z`;
    };

    return (
        <div className="dash-bg" style={{ backgroundColor: '#E3F2FD', minHeight: '100vh' }}>
            <DashboardNav
                userName={staffName}
                active="Analytics"
                items={["Dashboard", "Manage Appointments", "Schedules", "Analytics"]}
                role="STAFF"
            />

            <main className="container dash-main" style={{ padding: '30px 20px' }}>

                {/* Grid Layout */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '24px',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>

                    {/* 1. Filter Control Panel (Full Width) */}
                    <div className="card" style={{
                        gridColumn: '1 / -1',
                        backgroundColor: '#fff',
                        borderRadius: '15px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        padding: '20px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#000' }}>Filters</h2>
                        </div>

                        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            {/* Doctor Filter */}
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Filter by Doctor</label>
                                <div className="select-wrapper" style={{ position: 'relative' }}>
                                    <select className="input" style={{
                                        padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff', width: '220px', appearance: 'none', height: '42px', boxSizing: 'border-box'
                                    }}>
                                        <option value="">All Doctors</option>
                                        {doctors.map(d => (
                                            <option key={d.doctorId} value={d.doctorId}>Dr. {d.firstName} {d.lastName}</option>
                                        ))}
                                    </select>
                                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>▼</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Booking Trends (Full Width) */}
                    <div className="card" style={{
                        gridColumn: '1 / -1',
                        backgroundColor: '#fff',
                        borderRadius: '15px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        padding: '20px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#000' }}>Booking Trends (Last 7 Days)</h2>
                        </div>

                        {/* Line Chart Area */}
                        <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                            <svg viewBox="0 0 800 340" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                {/* Grid Lines */}
                                {[0, 1, 2, 3, 4].map(i => (
                                    <line key={i} x1="0" y1={i * 75} x2="800" y2={i * 75} stroke="#f0f0f0" strokeWidth="1" />
                                ))}

                                {/* Y-Axis Labels */}
                                {[4, 3, 2, 1, 0].map((val, i) => (
                                    <text key={i} x="-10" y={i * 75 + 5} fill="#9ca3af" fontSize="12" textAnchor="end">
                                        {Math.round(trendData.max * (val / 4))}
                                    </text>
                                ))}

                                {/* Area Path */}
                                <path d={getAreaPath(trendData, 300, 800)} fill="rgba(37, 99, 235, 0.1)" />

                                {/* Line Path */}
                                <path d={getLinePath(trendData, 300, 800)} fill="none" stroke="#2563eb" strokeWidth="3" />

                                {/* X-Axis Labels */}
                                {trendData.days.map((date, i) => (
                                    <text key={i} x={i * (800 / 6)} y="320" fill="#9ca3af" fontSize="12" textAnchor="middle">
                                        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </text>
                                ))}
                            </svg>
                        </div>
                    </div>

                    {/* 3. Booking by Doctor (Bottom Left) */}
                    <div className="card" style={{
                        backgroundColor: '#fff',
                        borderRadius: '15px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        padding: '20px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#000' }}>Top Doctors by Bookings</h2>
                        </div>

                        <div style={{ height: '250px', width: '100%', position: 'relative' }}>
                            {/* Bar Chart SVG */}
                            <svg viewBox="0 0 400 250" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                {/* Grid Lines */}
                                {[0, 1, 2, 3, 4].map(i => (
                                    <line key={i} x1="30" y1={i * 50} x2="400" y2={i * 50} stroke="#f0f0f0" strokeWidth="1" />
                                ))}

                                {/* Y-Axis Labels */}
                                {['100%', '75%', '50%', '25%', '0%'].map((val, i) => (
                                    <text key={i} x="25" y={i * 50 + 5} fill="#9ca3af" fontSize="10" textAnchor="end">{val}</text>
                                ))}

                                {/* Bars */}
                                {doctorStats.map((d, i) => {
                                    const height = (d.pct / 100) * 200; // max height 200px
                                    const y = 200 - height;
                                    const x = 80 + (i * 120);
                                    const colors = ['#2563eb', '#10b981', '#f97316'];
                                    return (
                                        <g key={i}>
                                            <rect x={x} y={y} width="40" height={height} fill={colors[i % 3]} rx="4" />
                                            <text x={x + 20} y="220" fill="#495057" fontSize="12" textAnchor="middle" fontWeight="500">{d.name}</text>
                                            <text x={x + 20} y={y - 5} fill="#495057" fontSize="10" textAnchor="middle">{Math.round(d.pct)}%</text>
                                        </g>
                                    );
                                })}
                                {doctorStats.length === 0 && (
                                    <text x="200" y="125" textAnchor="middle" fill="#9ca3af">No data available</text>
                                )}
                            </svg>
                        </div>
                    </div>

                    {/* 4. Status Distribution (Bottom Right) */}
                    <div className="card" style={{
                        backgroundColor: '#fff',
                        borderRadius: '15px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}>
                        <div style={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#000' }}>Status Distribution</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>

                            {/* Doughnut Chart (SVG) */}
                            <div style={{ width: '180px', height: '180px', position: 'relative', marginBottom: '20px' }}>
                                <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                    <circle cx="20" cy="20" r="15.9155" fill="transparent" stroke="#f3f4f6" strokeWidth="6" />

                                    {/* Confirmed - Blue */}
                                    <circle cx="20" cy="20" r="15.9155" fill="transparent" stroke="#2563eb" strokeWidth="6"
                                        strokeDasharray={`${statusData.percentages.CONFIRMED} 100`} strokeDashoffset="0" />

                                    {/* Completed - Green */}
                                    <circle cx="20" cy="20" r="15.9155" fill="transparent" stroke="#10b981" strokeWidth="6"
                                        strokeDasharray={`${statusData.percentages.COMPLETED} 100`} strokeDashoffset={`-${statusData.percentages.CONFIRMED}`} />

                                    {/* Cancelled - Red */}
                                    <circle cx="20" cy="20" r="15.9155" fill="transparent" stroke="#ef4444" strokeWidth="6"
                                        strokeDasharray={`${statusData.percentages.CANCELLED} 100`} strokeDashoffset={`-${statusData.percentages.CONFIRMED + statusData.percentages.COMPLETED}`} />
                                    
                                    {/* Pending - Yellow */}
                                    <circle cx="20" cy="20" r="15.9155" fill="transparent" stroke="#f59e0b" strokeWidth="6"
                                        strokeDasharray={`${statusData.percentages.PENDING} 100`} strokeDashoffset={`-${statusData.percentages.CONFIRMED + statusData.percentages.COMPLETED + statusData.percentages.CANCELLED}`} />

                                </svg>
                                {/* Center Text */}
                                <div style={{
                                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                    textAlign: 'center'
                                }}>
                                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#000', display: 'block' }}>{statusData.total}</span>
                                    <span style={{ fontSize: '12px', color: '#6c757d' }}>Total</span>
                                </div>
                            </div>

                            {/* Legend (Below) */}
                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: '10px', height: '10px', backgroundColor: '#2563eb', borderRadius: '50%', marginRight: '6px' }}></div>
                                    <span style={{ fontSize: '13px', color: '#495057' }}>Confirmed ({Math.round(statusData.percentages.CONFIRMED)}%)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '50%', marginRight: '6px' }}></div>
                                    <span style={{ fontSize: '13px', color: '#495057' }}>Completed ({Math.round(statusData.percentages.COMPLETED)}%)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '50%', marginRight: '6px' }}></div>
                                    <span style={{ fontSize: '13px', color: '#495057' }}>Cancelled ({Math.round(statusData.percentages.CANCELLED)}%)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: '10px', height: '10px', backgroundColor: '#f59e0b', borderRadius: '50%', marginRight: '6px' }}></div>
                                    <span style={{ fontSize: '13px', color: '#495057' }}>Pending ({Math.round(statusData.percentages.PENDING)}%)</span>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

