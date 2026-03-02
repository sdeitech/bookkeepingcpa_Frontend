import { useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';

export default function MessageList({ messages, isLoading, currentUserId }) {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading messages...
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <MessageCircle className="h-12 w-12 mb-2 text-gray-400" />
        <p>No messages yet</p>
        <p className="text-sm">Start the conversation!</p>
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      className="h-96 overflow-y-auto pr-4 space-y-4"
    >
      {messages.map((message) => {
        const isOwnMessage = message.senderId._id === currentUserId;
        const initials = message.senderName
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase();

        // Role-based avatar colors
        const avatarColor = 
          message.senderRole === 'admin' ? 'bg-purple-500' :
          message.senderRole === 'staff' ? 'bg-blue-500' :
          'bg-green-500';

        return (
          <div
            key={message._id}
            className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0 ${avatarColor}`}>
              {initials}
            </div>

            {/* Message Content */}
            <div className={`flex-1 space-y-1 ${isOwnMessage ? 'text-right' : ''}`}>
              {/* Sender Name & Role */}
              <div className="flex items-center gap-2 text-sm">
                {!isOwnMessage && (
                  <>
                    <span className="font-medium">{message.senderName}</span>
                    <span className="text-xs text-gray-500 capitalize">
                      ({message.senderRole})
                    </span>
                  </>
                )}
                {isOwnMessage && (
                  <span className="text-xs text-gray-500 ml-auto">You</span>
                )}
              </div>

              {/* Message Text */}
              <div className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
                isOwnMessage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.message}
                </p>
              </div>

              {/* Timestamp */}
              <div className="text-xs text-gray-500">
                {new Date(message.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
