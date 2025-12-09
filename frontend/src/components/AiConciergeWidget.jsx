import React, { useState } from 'react';
import axios from 'axios';
import './AiConciergeWidget.css';

/**
 * AiConciergeWidget
 * A floating widget that opens an AI triage modal to recommend specialists.
 * 
 * Props:
 * - onApplyFilter: (recommendedRole: string, originalSymptomText: string) => void
 */
const AiConciergeWidget = ({ onApplyFilter }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState('INPUT'); // 'INPUT' | 'RECOMMENDATION'
    const [symptomText, setSymptomText] = useState('');
    const [recommendation, setRecommendation] = useState('');
    const [loading, setLoading] = useState(false);

    // Toggle modal visibility
    const toggleOpen = () => {
        setIsOpen(!isOpen);
        // Reset state when opening/closing? Maybe keep state if opening again to show result? 
        // Usually cleaner to reset if starting fresh, but let's just close.
    };

    const handleRecommend = async () => {
        if (!symptomText.trim()) return;

        setLoading(true);
        try {
            // POST the symptom text to the backend
            // Assuming the backend expects a JSON object or plain text. 
            // Using a standard JSON wrapper { symptoms: text } is safer, 
            // but based on "POST the symptom text", I'll try to adhere to a likely convention.
            // POST the symptom text to the backend
            // Using relative path to leverage Vite proxy and ensure cookies are sent
            const response = await axios.post('/api/ai/recommend',
                { symptoms: symptomText }, // Payload
                { headers: { 'Content-Type': 'application/json' } }
            );

            // Correctly access the property defined in the DTO (AiRecommendationResponse)
            const role = response.data.recommendedRole || 'General Practitioner';

            if (role === 'UNKNOWN') {
                alert("I couldn't understand that. Please describe your symptoms clearly.");
                setLoading(false);
                return;
            }

            setRecommendation(role);
            setMode('RECOMMENDATION');
        } catch (error) {
            console.error('AI Recommendation failed:', error);

            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                alert("Session expired. Please log in again to use the AI Assistant.");
                setLoading(false);
                return;
            }

            // Fallback as per requirements
            setRecommendation('General Practitioner');
            setMode('RECOMMENDATION');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = () => {
        if (onApplyFilter) {
            onApplyFilter(recommendation, symptomText);
        }
        setIsOpen(false);
    };

    const handleReset = () => {
        setMode('INPUT');
        setRecommendation('');
        // We keep symptomText in case they want to edit it, or clear it? 
        // "Try Again" implies starting over. Let's clear or keep?
        // User logic: "Typing 'Red spots' -> Error/Wrong result -> Try again with more detail"
        // So keeping text might be helpful? Or clearing?
        // Let's keep it to allow edit.
    };

    return (
        <>
            {/* Floating Action Button */}
            <button className="ai-widget-fab" onClick={toggleOpen} aria-label="AI Health Assistant">
                🤖
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="ai-modal-overlay" onClick={toggleOpen}>
                    {/* Prevent click bubbling from content to overlay */}
                    <div className="ai-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="ai-modal-header">
                            <h3 className="ai-modal-title">AI Health Assistant</h3>
                            <button className="ai-close-btn" onClick={toggleOpen}>&times;</button>
                        </div>

                        {mode === 'INPUT' ? (
                            <div className="ai-modal-body">
                                <p className="ai-instruction-text">
                                    Describe your symptoms (e.g., 'I have red spots'), and I'll find the right specialist.
                                </p>
                                <textarea
                                    className="ai-input-area"
                                    placeholder="Type your symptoms here..."
                                    value={symptomText}
                                    onChange={(e) => setSymptomText(e.target.value)}
                                    autoFocus
                                />
                                <button
                                    className="ai-primary-btn"
                                    onClick={handleRecommend}
                                    disabled={loading || !symptomText.trim()}
                                >
                                    {loading ? <div className="ai-loading-spinner" /> : 'Find Doctor'}
                                </button>
                            </div>
                        ) : (
                            <div className="ai-modal-body">
                                <div className="ai-recommendation-result">
                                    <p className="ai-result-label">Based on your symptoms, we recommend a</p>
                                    <div className="ai-result-role">{recommendation}</div>
                                </div>

                                <button className="ai-primary-btn" onClick={handleApply}>
                                    Show {recommendation}s
                                </button>

                                <button className="ai-secondary-btn" onClick={handleReset}>
                                    Try Again
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default AiConciergeWidget;
