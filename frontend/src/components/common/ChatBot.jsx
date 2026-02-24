import React, { useState, useEffect, useRef } from 'react';
import './ChatBot.css';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! Welcome to EVENT-BUZZ. How can I help you today?", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const responses = {
        "hello": "Hello there! Looking for some exciting events?",
        "hi": "Hi! How can I assist you with your event planning?",
        "events": "We have a wide range of events from concerts to workshops! You can browse them on our home page.",
        "ticket": "To book a ticket, simply click on an event and hit the 'Book Now' button.",
        "payment": "We support various payment methods including credit cards and digital wallets.",
        "help": "I can help you with event booking, finding events, or account issues. What do you need?",
        "default": "I'm not sure I understand. Could you please rephrase? You can ask about 'events', 'tickets', or 'payment'."
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage = { id: Date.now(), text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        // Bot response logic
        setTimeout(() => {
            const lowerInput = inputValue.toLowerCase();
            let botResponse = responses.default;

            for (const key in responses) {
                if (lowerInput.includes(key) && key !== 'default') {
                    botResponse = responses[key];
                    break;
                }
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
        }, 800);
    };

    const quickActions = [
        { label: "🎟️ Booking Help", value: "How do I book a ticket?" },
        { label: "📅 Check Events", value: "Tell me about events" },
        { label: "💳 Payment info", value: "What payment methods are used?" }
    ];

    const handleQuickAction = (value) => {
        setInputValue(value);
        // Trigger message send
        const userMessage = { id: Date.now(), text: value, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);

        setTimeout(() => {
            let botResponse = responses.default;
            const lowerInput = value.toLowerCase();
            if (lowerInput.includes('book')) botResponse = responses.ticket;
            else if (lowerInput.includes('event')) botResponse = responses.events;
            else if (lowerInput.includes('payment')) botResponse = responses.payment;

            setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
        }, 800);
    };

    return (
        <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
            {isOpen ? (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="bot-info">
                            <div className="bot-avatar">🤖</div>
                            <h3>Buzz Assistant</h3>
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                    </div>
                    <div className="messages-container">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message ${msg.sender}`}>
                                <div className="message-content">{msg.text}</div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="quick-actions">
                        {quickActions.map((action, idx) => (
                            <button key={idx} onClick={() => handleQuickAction(action.value)}>
                                {action.label}
                            </button>
                        ))}
                    </div>
                    <form className="input-area" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <button type="submit">Send</button>
                    </form>
                </div>
            ) : (
                <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
                    <span className="toggle-icon">💬</span>
                    <span className="toggle-text">Chat with us</span>
                </button>
            )}
        </div>
    );
};

export default ChatBot;
