import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = ["00", "30"];
const PERIODS = ["AM", "PM"];

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;

// Inline Styles Object
const styles = {
    triggerBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '140px',
        padding: '10px 12px',
        fontSize: '14px',
        fontWeight: '500',
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        cursor: 'pointer',
        color: '#334155',
        transition: 'all 0.2s',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    },
    triggerBtnActive: {
        borderColor: '#2563eb',
        boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.1)'
    },
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Darker backdrop for modal
        backdropFilter: 'blur(2px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center', // Center vertically
        justifyContent: 'center', // Center horizontally
        animation: 'fadeIn 0.2s ease-out'
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        width: '320px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'scaleIn 0.2s ease-out'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #f1f5f9',
        backgroundColor: '#fff'
    },
    label: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#0f172a'
    },
    nowBtn: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#2563eb',
        background: '#eff6ff',
        border: 'none',
        cursor: 'pointer',
        padding: '6px 12px',
        borderRadius: '6px',
        transition: 'background 0.2s'
    },
    wheelContainer: {
        position: 'relative',
        height: '220px', // Slightly taller
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: '20px 0'
    },
    highlightBar: {
        position: 'absolute',
        top: '50%',
        left: '20px',
        right: '20px',
        height: '40px',
        transform: 'translateY(-50%)',
        backgroundColor: '#f1f5f9',
        borderRadius: '8px',
        pointerEvents: 'none',
        zIndex: 0
    },
    column: {
        height: '100%',
        width: '80px',
        overflowY: 'auto',
        scrollSnapType: 'y mandatory',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        position: 'relative',
        zIndex: 1,
        padding: '0'
    },
    item: {
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        scrollSnapAlign: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'all 0.2s'
    },
    itemText: {
        fontSize: '16px',
        fontWeight: '500',
        color: '#94a3b8',
        transition: 'all 0.2s'
    },
    itemSelected: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#0f172a',
        transform: 'scale(1.1)'
    },
    footer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        padding: '16px',
        borderTop: '1px solid #f1f5f9',
        backgroundColor: '#f8fafc'
    },
    cancelBtn: {
        padding: '12px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#fff',
        color: '#475569',
        fontWeight: '600',
        fontSize: '15px',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    setBtn: {
        padding: '12px',
        borderRadius: '10px',
        border: 'none',
        backgroundColor: '#2563eb',
        color: '#fff',
        fontWeight: '600',
        fontSize: '15px',
        cursor: 'pointer',
        boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
        transition: 'all 0.2s'
    }
};

const WheelColumn = ({ options, selected, onSelect }) => {
    const containerRef = useRef(null);
    const isScrollingRef = useRef(false);
    const timeoutRef = useRef(null);

    // Sync scroll position with selected value (only if not manually scrolling)
    useEffect(() => {
        if (containerRef.current && !isScrollingRef.current) {
            const index = options.indexOf(selected);
            if (index !== -1) {
                const targetTop = index * ITEM_HEIGHT;
                // Only scroll if significantly different to avoid jitter
                if (Math.abs(containerRef.current.scrollTop - targetTop) > 10) {
                    containerRef.current.scrollTo({
                        top: targetTop,
                        behavior: 'smooth'
                    });
                }
            }
        }
    }, [selected, options]);

    const handleScroll = (e) => {
        isScrollingRef.current = true;

        // Clear timeout if scrolling continues
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // Calculate center item
        const scrollTop = e.target.scrollTop;
        const index = Math.round(scrollTop / ITEM_HEIGHT);

        // Auto-select the item at the center
        if (options[index] && options[index] !== selected) {
            onSelect(options[index]);
        }

        // Reset scrolling flag after scroll stops
        timeoutRef.current = setTimeout(() => {
            isScrollingRef.current = false;
        }, 150);
    };

    return (
        <div
            style={styles.column}
            ref={containerRef}
            className="scrollbar-hide"
            onScroll={handleScroll}
        >
            <div style={{ height: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) }} />
            {options.map((opt) => {
                const isSelected = selected === opt;
                return (
                    <div
                        key={opt}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(opt);
                        }}
                        style={{
                            ...styles.item,
                            opacity: isSelected ? 1 : 0.4
                        }}
                    >
                        <span style={isSelected ? styles.itemSelected : styles.itemText}>
                            {opt}
                        </span>
                    </div>
                );
            })}
            <div style={{ height: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) }} />
        </div>
    );
};

export default function WheelTimePicker({ value, onChange, label = "Time" }) {
    const [isOpen, setIsOpen] = useState(false);

    const [tempHour, setTempHour] = useState(9);
    const [tempMinute, setTempMinute] = useState("00");
    const [tempPeriod, setTempPeriod] = useState("AM");

    useEffect(() => {
        if (isOpen && value) {
            const [h, m] = value.split(':').map(Number);
            let hour = h % 12 || 12;
            let period = h >= 12 ? "PM" : "AM";
            let minute = m === 30 ? "30" : "00";

            setTempHour(hour);
            setTempMinute(minute);
            setTempPeriod(period);
        } else if (isOpen && !value) {
            setTempHour(9);
            setTempMinute("00");
            setTempPeriod("AM");
        }
    }, [isOpen, value]);

    const handleSet = () => {
        let hour24 = tempHour;
        if (tempPeriod === "PM" && tempHour !== 12) hour24 += 12;
        if (tempPeriod === "AM" && tempHour === 12) hour24 = 0;

        const formattedTime = `${String(hour24).padStart(2, '0')}:${tempMinute}`;
        onChange(formattedTime);
        setIsOpen(false);
    };

    const handleNow = () => {
        const now = new Date();
        let h = now.getHours();
        let m = now.getMinutes();

        if (m < 15) m = 0;
        else if (m < 45) m = 30;
        else { m = 0; h += 1; }

        let hour = h % 12 || 12;
        let period = h >= 12 ? "PM" : "AM";
        if (h >= 24) { h = 0; period = "AM"; }
        period = h >= 12 ? "PM" : "AM";

        setTempHour(hour);
        setTempMinute(m === 30 ? "30" : "00");
        setTempPeriod(period);
    };

    const displayValue = (() => {
        if (!value) return "--:-- --";
        const [h, m] = value.split(':').map(Number);
        const period = h >= 12 ? "PM" : "AM";
        const hour = h % 12 || 12;
        return `${hour}:${String(m).padStart(2, '0')} ${period}`;
    })();

    return (
        <>
            <style>
                {`
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                `}
            </style>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                style={{
                    ...styles.triggerBtn,
                    ...(isOpen ? styles.triggerBtnActive : {})
                }}
            >
                <span>{displayValue}</span>
                <ChevronDown size={16} color="#94a3b8" />
            </button>

            {isOpen && createPortal(
                <div style={styles.overlay} onClick={() => setIsOpen(false)}>
                    <div
                        style={styles.modal}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={styles.header}>
                            <span style={styles.label}>{label}</span>
                            <button
                                onClick={handleNow}
                                style={styles.nowBtn}
                                onMouseEnter={e => e.target.style.backgroundColor = '#dbeafe'}
                                onMouseLeave={e => e.target.style.backgroundColor = '#eff6ff'}
                            >
                                Set to Now
                            </button>
                        </div>

                        {/* Wheel Area */}
                        <div style={styles.wheelContainer}>
                            <div style={styles.highlightBar} />

                            <WheelColumn options={HOURS} selected={tempHour} onSelect={setTempHour} />
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#cbd5e1', paddingBottom: '4px', zIndex: 1 }}>:</div>
                            <WheelColumn options={MINUTES} selected={tempMinute} onSelect={setTempMinute} />
                            <div style={{ width: '16px' }}></div>
                            <WheelColumn options={PERIODS} selected={tempPeriod} onSelect={setTempPeriod} />
                        </div>

                        {/* Footer */}
                        <div style={styles.footer}>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={styles.cancelBtn}
                                onMouseEnter={e => e.target.style.backgroundColor = '#f8fafc'}
                                onMouseLeave={e => e.target.style.backgroundColor = '#fff'}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSet}
                                style={styles.setBtn}
                                onMouseEnter={e => e.target.style.backgroundColor = '#1d4ed8'}
                                onMouseLeave={e => e.target.style.backgroundColor = '#2563eb'}
                            >
                                Confirm Time
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
