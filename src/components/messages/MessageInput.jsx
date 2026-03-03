import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

export default function MessageInput({ onSendMessage, isLoading }) {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      alert('Message cannot be empty');
      return;
    }

    if (message.length > 2000) {
      alert('Message too long (max 2000 characters)');
      return;
    }

    try {
      await onSendMessage(message.trim());
      setMessage(''); // Clear input after sending
    } catch (error) {
      alert('Failed to send message');
    }
  };

  const handleKeyDown = (e) => {
    // Send on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message... (Ctrl+Enter to send)"
        className="w-full min-h-[80px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isLoading}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {message.length}/2000 characters
        </span>
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send
            </>
          )}
        </button>
      </div>
    </form>
  );
}
