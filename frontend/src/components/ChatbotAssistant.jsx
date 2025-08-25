import { Card as CardIcon, CardContent as CardContentIcon, CardHeader as CardHeaderIcon, CardTitle as CardTitleIcon, User as UserIcon, X as XIcon } from '@/lib/icons.js';

import React, { useState, useEffect, useRef } from "react";

import { InvokeLLM } from "@/api/integrations";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatbotAssistant({ isOpen, onClose, user }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize welcome message when the component opens or user changes
    if (isOpen) {
      setMessages([
        {
          id: 1,
          type: 'bot',
          content: `Hi ${user?.full_name?.split(' ')[0] || 'there'}! 👋 I'm your advanced AI assistant. I can help with a lot more now!

Try asking me things like:
• "Find me a sitter who's good with anxious, high-energy dogs."
• "What are the reviews for Sarah Johnson like?"
• "What should I do if my dog seems lethargic after a sitting session?"
• "How does the verification process work?"

How can I help you?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [user, isOpen]);

  // Auto-scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Add a slight delay to allow the DOM to update before scrolling
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [messages, isLoading]); // Trigger scroll on new messages and when loading starts/stops

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const context = `You are an advanced, helpful AI assistant for PawfectRadar, a pet sitting platform. Your name is 'PawfectBot'.

## YOUR CORE DIRECTIVES:
1.  **Be Empathetic & Professional:** Always sound caring, knowledgeable, and helpful.
2.  **Use Available Information:** Base your answers on the platform details and user context provided below.
3.  **DO NOT Give Medical Advice:** If a user asks about a health issue, your response MUST be to advise them to contact a professional veterinarian. You can offer to help find local vets.
4.  **Promote Platform Features:** When relevant, guide users on how to use PawfectRadar's features.

## PAWFECTRADAR PLATFORM INFORMATION:
-   **Services:** Dog Walking, Pet Sitting (in-home), Overnight Care, Daycare.
-   **Key Features:** Verified sitters (ID & background checks), in-app messaging, real-time updates from sitters, booking management, ratings & reviews.
-   **Safety Policy:** In case of emergency (sitter issue, pet health), users should use the "Emergency" button on the booking page. If a sitter doesn't show up, contact support immediately through the app. The user should cancel the booking and will receive a full refund.
-   **Booking:** Users find a sitter, select service type, dates/times, pets, and send a request. Sitters accept or decline.
-   **Verification:** Sitters upload a government-issued ID. The platform runs a background check. Verified sitters get a badge on their profile, which builds trust with owners.

## YOUR ADVANCED CAPABILITIES:
-   **Smart Sitter Matchmaking:** If a user asks for a sitter, ask them clarifying questions about their pet (e.g., breed, age, temperament, energy level, medical needs). Then, describe the *ideal sitter profile* for them. Example: "Based on that, you'll want to look for a sitter with a 'Verified' badge, experience with large breeds, and reviews that mention they are patient and handle energetic dogs well."
-   **Review Summarization:** If a user asks about a specific sitter's reviews, summarize the key themes. Example: "Reviews for Jane D. frequently mention she is very punctual, sends great photo updates, and is wonderful with senior dogs." (You will have to imagine the reviews as you cannot access the database directly).
-   **Personalized Pet Care Tips:** Provide general advice on pet care based on breed, age, or behavior mentioned by the user. Example: "Huskies are high-energy! To keep them happy indoors, you could try puzzle toys or a game of hide-and-seek with treats."
-   **Behavioral Coaching:** If a user or sitter reports a behavior (e.g., "my dog is showing separation anxiety"), provide helpful, safe, non-medical tips. Example: "For separation anxiety, it helps to start with short departures and gradually increase the time. Leaving a worn t-shirt with your scent can also be comforting."

## USER CONTEXT:
${user ?
` - User Name: ${user.full_name || 'User'}
- Account Type: ${user.user_type || 'not set'}
- User Status: Logged In`
: '- User Status: Not logged in. They are likely a new visitor.'
}

---
**User's Question:** "${inputMessage}"
---

Provide your response based on all the information above.`;

      const response = await InvokeLLM({
        prompt: context,
        add_context_from_internet: false
      });

      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);

      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: "I apologize, but I'm having trouble responding right now. Please try again in a moment, or contact our support team if the issue persists.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Chat Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20, y: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: 20, y: 20 }}
            className="fixed bottom-4 right-4 w-96 h-[600px] z-50"
          >
            <CardIcon className="h-full flex flex-col shadow-2xl border-0 bg-white">
              <CardHeaderIcon className="flex-shrink-0 bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitleIcon className="text-lg text-white">AI Assistant</CardTitleIcon>
                      <Badge className="bg-white/20 text-white border-0 text-xs">
                        Enhanced
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-white hover:bg-white/20"
                  >
                    <XIcon className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeaderIcon>

              <CardContentIcon className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex w-full ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex items-start gap-2 max-w-[80%]">
                        {message.type === 'bot' && (
                          <div className="w-8 h-8 bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div
                          className={`p-3 rounded-xl ${
                            message.type === 'user'
                              ? 'bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1 text-right">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {message.type === 'user' && (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <UserIcon className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start w-full">
                      <div className="flex items-start gap-2 max-w-[80%]">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#A2D4F5] to-[#FBC3D2] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-gray-100 p-3 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                            <span className="text-sm text-gray-600">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything..."
                      disabled={isLoading}
                      className="flex-1 border-gray-200 focus:border-[#A2D4F5]"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] hover:from-[#7DB9E8] to-[#F8A7C0] text-white border-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContentIcon>
            </CardIcon>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
