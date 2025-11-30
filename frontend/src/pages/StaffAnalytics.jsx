import React, { useEffect } from 'react';
import DashboardNav from '../components/DashboardNav';
import { useNavigate } from 'react-router-dom';

export default function StaffAnalytics() {
    const navigate = useNavigate();

    useEffect(() => {
        const raw = sessionStorage.getItem('auth.user');
        if (!raw) { navigate('/login'); }
        else {
            try {
                const user = JSON.parse(raw);
                if (user.role !== 'STAFF') {
                    navigate('/login');
                }
            } catch (e) {
                navigate('/login');
            }
        }
    }, [navigate]);

    return (
        <div className="dash-bg" style={{ backgroundColor: '#E3F2FD', minHeight: '100vh' }}>
            <DashboardNav
                userName="German Velasco"
                active="Analytics"
                items={["Dashboard", "My Appointments", "Schedules", "Analytics"]}
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
                            <span style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#000" viewBox="0 0 16 16">
                                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                                    <path d="M3.5 1.5a.5.5 0 0 1 .5.5V3h8V2a.5.5 0 0 1 1 0v1h.5A1.5 1.5 0 0 1 15 4.5v10A1.5 1.5 0 0 1 13.5 16h-11A1.5 1.5 0 0 1 1 14.5v-10A1.5 1.5 0 0 1 2.5 3H3V2a.5.5 0 0 1 .5-.5zM2 4.5v10a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-10a.5.5 0 0 0-.5-.5h-11a.5.5 0 0 0-.5.5z" />
                                </svg>
                            </span>
                        </div>

                        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            {/* Date Range */}
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Date Range</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '14px', color: '#6c757d', whiteSpace: 'nowrap' }}>From:</span>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            placeholder="Jan 01, 2026"
                                            onFocus={(e) => e.target.type = 'date'}
                                            onBlur={(e) => e.target.type = 'text'}
                                            style={{
                                                padding: '10px', paddingRight: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '150px', color: '#495057', height: '42px', boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>

                                    <span style={{ fontSize: '14px', color: '#6c757d', whiteSpace: 'nowrap', marginLeft: '10px' }}>To:</span>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            placeholder="Jan 31, 2026"
                                            onFocus={(e) => e.target.type = 'date'}
                                            onBlur={(e) => e.target.type = 'text'}
                                            style={{
                                                padding: '10px', paddingRight: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '150px', color: '#495057', height: '42px', boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Doctor Filter */}
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Filter by Doctor</label>
                                <div className="select-wrapper" style={{ position: 'relative' }}>
                                    <select className="input" style={{
                                        padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff', width: '220px', appearance: 'none', height: '42px', boxSizing: 'border-box'
                                    }} defaultValue="Dr. Evelyn Reed">
                                        <option>Dr. Evelyn Reed</option>
                                        <option>Dr. Elvin Lagamo</option>
                                        <option>All Doctors</option>
                                    </select>
                                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>▼</span>
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Filter by Status</label>
                                <div className="select-wrapper" style={{ position: 'relative' }}>
                                    <select className="input" style={{
                                        padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff', width: '180px', appearance: 'none', height: '42px', boxSizing: 'border-box'
                                    }} defaultValue="Completed">
                                        <option>Completed</option>
                                        <option>Pending</option>
                                        <option>Cancelled</option>
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
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#000' }}>Booking Trends</h2>
                            <span style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#000" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M0 0h1v15h15v1H0V0zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5z" />
                                </svg>
                            </span>
                        </div>

                        {/* Line Chart Area */}
                        <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                            <svg viewBox="0 0 800 340" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                {/* Grid Lines */}
                                {[0, 1, 2, 3, 4].map(i => (
                                    <line key={i} x1="0" y1={i * 75} x2="800" y2={i * 75} stroke="#f0f0f0" strokeWidth="1" />
                                ))}

                                {/* Y-Axis Labels */}
                                {[40, 30, 20, 10, 0].map((val, i) => (
                                    <text key={i} x="-10" y={i * 75 + 5} fill="#9ca3af" fontSize="12" textAnchor="end">{val}</text>
                                ))}

                                {/* Area Path */}
                                <path d="M0,300 L0,200 L100,220 L200,150 L300,180 L400,100 L500,140 L600,80 L700,120 L800,50 L800,300 Z" fill="rgba(37, 99, 235, 0.1)" />

                                {/* Line Path */}
                                <path d="M0,200 L100,220 L200,150 L300,180 L400,100 L500,140 L600,80 L700,120 L800,50" fill="none" stroke="#2563eb" strokeWidth="3" />

                                {/* X-Axis Labels */}
                                {['Jan 2', 'Jan 4', 'Jan 6', 'Jan 8', 'Jan 10', 'Jan 12', 'Jan 14'].map((date, i) => (
                                    <text key={i} x={i * 133} y="320" fill="#9ca3af" fontSize="12" textAnchor="middle">{date}</text>
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
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#000' }}>Booking by Doctor</h2>
                            <span style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#000" viewBox="0 0 16 16">
                                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                                </svg>
                            </span>
                        </div>

                        <div style={{ height: '250px', width: '100%', position: 'relative' }}>
                            {/* Bar Chart SVG with Grid and Axis */}
                            <svg viewBox="0 0 400 250" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                {/* Grid Lines (5 lines) */}
                                {[0, 1, 2, 3, 4].map(i => (
                                    <line key={i} x1="30" y1={i * 50} x2="400" y2={i * 50} stroke="#f0f0f0" strokeWidth="1" />
                                ))}

                                {/* Y-Axis Labels */}
                                {['100%', '75%', '50%', '25%', '0%'].map((val, i) => (
                                    <text key={i} x="25" y={i * 50 + 5} fill="#9ca3af" fontSize="10" textAnchor="end">{val}</text>
                                ))}

                                {/* Bars */}
                                {/* Dr. Smith (Blue) ~30% -> height ~75px (from bottom 200) */}
                                <rect x="80" y="125" width="40" height="75" fill="#2563eb" rx="4" />
                                <text x="100" y="220" fill="#495057" fontSize="12" textAnchor="middle" fontWeight="500">Dr. Smith</text>

                                {/* Dr. Chen (Green) ~6% -> height ~15px */}
                                <rect x="200" y="185" width="40" height="15" fill="#10b981" rx="4" />
                                <text x="220" y="220" fill="#495057" fontSize="12" textAnchor="middle" fontWeight="500">Dr. Chen</text>

                                {/* Dr. Garcia (Orange) ~3% -> height ~8px */}
                                <rect x="320" y="192" width="40" height="8" fill="#f97316" rx="4" />
                                <text x="340" y="220" fill="#495057" fontSize="12" textAnchor="middle" fontWeight="500">Dr. Garcia</text>
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
                            <span style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#000" viewBox="0 0 16 16">
                                    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
                                    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 1.255.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319z" />
                                </svg>
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>

                            {/* Doughnut Chart (SVG) */}
                            <div style={{ width: '180px', height: '180px', position: 'relative', marginBottom: '20px' }}>
                                <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                    {/* Background Circle (Optional, for empty state or border) */}
                                    <circle cx="20" cy="20" r="15.9155" fill="transparent" stroke="#f3f4f6" strokeWidth="6" />

                                    {/* Confirmed (70%) - Blue */}
                                    <circle cx="20" cy="20" r="15.9155" fill="transparent" stroke="#2563eb" strokeWidth="6"
                                        strokeDasharray="70 100" strokeDashoffset="0" />

                                    {/* Cancelled (20%) - Red */}
                                    <circle cx="20" cy="20" r="15.9155" fill="transparent" stroke="#ef4444" strokeWidth="6"
                                        strokeDasharray="20 100" strokeDashoffset="-70" />

                                    {/* Completed (10%) - Green */}
                                    <circle cx="20" cy="20" r="15.9155" fill="transparent" stroke="#10b981" strokeWidth="6"
                                        strokeDasharray="10 100" strokeDashoffset="-90" />
                                </svg>
                                {/* Center Text */}
                                <div style={{
                                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                    textAlign: 'center'
                                }}>
                                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#000', display: 'block' }}>100%</span>
                                    <span style={{ fontSize: '12px', color: '#6c757d' }}>Total</span>
                                </div>
                            </div>

                            {/* Legend (Below) */}
                            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: '10px', height: '10px', backgroundColor: '#2563eb', borderRadius: '50%', marginRight: '6px' }}></div>
                                    <span style={{ fontSize: '13px', color: '#495057' }}>Confirmed (70%)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '50%', marginRight: '6px' }}></div>
                                    <span style={{ fontSize: '13px', color: '#495057' }}>Completed (10%)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '50%', marginRight: '6px' }}></div>
                                    <span style={{ fontSize: '13px', color: '#495057' }}>Cancelled (20%)</span>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
