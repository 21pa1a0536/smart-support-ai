const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const fetch = require('node-fetch');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Schemas
const messageSchema = new mongoose.Schema({
  sender: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true, unique: true },
  answer: { type: String, required: true },
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

// Models
const Conversation = mongoose.model('Conversation', conversationSchema);
const FAQ = mongoose.model('FAQ', faqSchema);

// Chat API
app.post('/api/chat', async (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) return res.status(400).json({ error: 'User ID and message are required.' });

  try {
    let conversation = await Conversation.findOne({ userId });
    if (!conversation) conversation = new Conversation({ userId, messages: [] });

    conversation.messages.push({ sender: 'user', text: message });

    // FAQ check
    const faqs = await FAQ.find({});
    let botResponse = null;
    const normalizedMessage = message.toLowerCase();
    for (const faq of faqs) {
      if (normalizedMessage.includes(faq.question.toLowerCase())) {
        botResponse = faq.answer;
        break;
      }
    }

    if (!botResponse && GEMINI_API_KEY) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
        const payload = {
          contents: [
            { role: 'user', parts: [{ text: message }] }
          ]
        };

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        botResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
      } catch (err) {
        console.error('Gemini API Error:', err);
        botResponse = 'AI service is unavailable.';
      }
    }

    if (!botResponse) botResponse = 'I am not sure how to respond to that.';

    conversation.messages.push({ sender: 'bot', text: botResponse });
    await conversation.save();

    res.json({ response: botResponse });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Start server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));


