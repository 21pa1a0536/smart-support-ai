import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState(localStorage.getItem('chatAppUserId') || `user-${Date.now()}`);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqs, setFaqs] = useState([]);
  const chatContainerRef = useRef(null);
  const backendUrl = 'http://localhost:3001';

  useEffect(() => {
    localStorage.setItem('chatAppUserId', userId);
  }, [userId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/history/${userId}`);
        const data = await response.json();
        if (response.ok) {
          setMessages(data.messages);
        } else {
          console.error('Failed to fetch chat history:', data.error);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };
    fetchHistory();
  }, [userId]);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/admin/faqs`);
        const data = await response.json();
        if (response.ok) {
          setFaqs(data);
        } else {
          console.error('Failed to fetch FAQs:', data.error);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      }
    };
    fetchFaqs();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage = { sender: 'user', text: inputValue };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: inputValue }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [...prev, { sender: 'bot', text: data.response }]);
      } else {
        setMessages((prev) => [...prev, { sender: 'bot', text: 'Error: Could not get a response.' }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Error: Could not connect to the server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFaq = async (e) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      alert('Both question and answer are required for FAQ.');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/admin/upload-faq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: faqQuestion, answer: faqAnswer }),
      });

      const data = await response.json();
      if (response.ok) {
        setFaqs((prev) => [...prev, data.faq]);
        setFaqQuestion('');
        setFaqAnswer('');
        alert('FAQ uploaded successfully!');
      } else {
        alert(`Error uploading FAQ: ${data.error}`);
      }
    } catch (error) {
      alert('Error connecting to the server for FAQ upload.');
    }
  };

  return (
    <div className="container">
      <div className="app-content">
        {/* Chat Interface */}
        <div className="chat-interface">
          <h1 className="chat-title">Smart-Support</h1>
          <div ref={chatContainerRef} className="chat-messages-container">
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`message-bubble ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message-wrapper justify-start">
                <div className="message-bubble bot-message">
                  <span className="typing-indicator">Typing...</span>
                </div>
              </div>
            )}
          </div>
          <form onSubmit={sendMessage} className="chat-input-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="chat-input"
              disabled={isLoading}
            />
            <button type="submit" className="send-button" disabled={isLoading}>Send</button>
          </form>
          <p className="user-id-display">Your User ID: <span className="user-id">{userId}</span></p>
        </div>

        {/* FAQ Upload Interface */}
        <div className="admin-panel">
          <h2 className="admin-title">Add FAQs</h2>
          <form onSubmit={uploadFaq} className="faq-form">
            <div className="form-group">
              <label htmlFor="faqQuestion" className="form-label">FAQ Question</label>
              <input
                id="faqQuestion"
                type="text"
                value={faqQuestion}
                onChange={(e) => setFaqQuestion(e.target.value)}
                placeholder="E.g., What are your operating hours?"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="faqAnswer" className="form-label">FAQ Answer</label>
              <textarea
                id="faqAnswer"
                value={faqAnswer}
                onChange={(e) => setFaqAnswer(e.target.value)}
                placeholder="E.g., We are open from 9 AM to 5 PM, Monday to Friday."
                rows="4"
                className="form-textarea"
              ></textarea>
            </div>
            <button type="submit" className="upload-faq-button">Upload FAQ</button>
          </form>

          <h3 className="existing-faqs-title">Existing FAQs</h3>
          <div className="existing-faqs-container">
            {faqs.length === 0 ? (
              <p className="no-faqs-message">No FAQs uploaded yet.</p>
            ) : (
              faqs.map((faq) => (
                <div key={faq._id} className="faq-item">
                  <p className="faq-question">{faq.question}</p>
                  <p className="faq-answer">{faq.answer}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
        }

        .container {
          min-height: 100vh;
          background: linear-gradient(to bottom right, #63c6f1ff, #55f79bff, #8748ecff);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .app-content {
          display: flex;
          flex-direction: column;
          width: 90%;
          max-width: 1100px;
          background-color: #fff;
          border-radius: 1.5rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          overflow: hidden;


        }

        @media (min-width: 1024px) {
          .app-content {
            flex-direction: row;
          }
        }

        /* Chat Styles (unchanged from before) */
        .chat-interface { flex: 1; display: flex; flex-direction: column; padding: 2rem; }
        .chat-title { font-size: 1.875rem; font-weight: 700; color: #1f2937; margin-bottom: 1.5rem; text-align: center; }
        .chat-messages-container { flex: 1; overflow-y: auto; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .message-wrapper { display: flex; }
        .justify-end { justify-content: flex-end; }
        .justify-start { justify-content: flex-start; }
        .message-bubble { max-width: 75%; padding: 0.75rem; border-radius: 0.5rem; }
        .user-message { background-color: #3b82f6; color: #fff; border-bottom-right-radius: 0; }
        .bot-message { background-color: #e5e7eb; color: #1f2937; border-bottom-left-radius: 0; }
        .chat-input-form { display: flex; gap: 1rem; }
        .chat-input { flex: 1; padding: 0.75rem; border-radius: 0.75rem; border: 2px solid #d1d5db; }
        .chat-input:focus { border-color: #3b82f6; outline: none; }
        .send-button { background-color: #2563eb; color: #fff; padding: 0.75rem; border-radius: 0.75rem; border: none; cursor: pointer; }
        .send-button:hover { background-color: #1d4ed8; }
        .user-id-display { font-size: 0.875rem; color: #6b7280; margin-top: 1rem; text-align: center; }

        /* Admin Panel */
        .admin-panel { background-color: #f3f4f6; padding: 2rem; flex: 1; }
        .admin-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; }
        .faq-form { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
        .form-input, .form-textarea { padding: 0.75rem; border-radius: 0.5rem; border: 2px solid #d1d5db; }
        .form-input:focus, .form-textarea:focus { border-color: #9333ea; outline: none; }
        .upload-faq-button { background-color: #7c3aed; color: #fff; padding: 0.75rem; border-radius: 0.75rem; border: none; cursor: pointer; }
        .upload-faq-button:hover { background-color: #6d28d9; }
        .existing-faqs-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; }
        .faq-item { background-color: #fff; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; }
        .faq-question { font-weight: 600; }
        .faq-answer { font-size: 0.875rem; margin-top: 0.25rem; }
      `}</style>
    </div>
  );
}

export default App;
