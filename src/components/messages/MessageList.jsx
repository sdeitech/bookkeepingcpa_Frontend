import { useEffect, useRef, useState } from 'react';
import { MessageCircle, ArrowDown, Loader2 } from 'lucide-react';

export default function MessageList({ messages, isLoading, currentUserId, onLoadMore, hasMore, loadingMore }) {
  const scrollRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Detect scroll position to show/hide scroll button
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Show button if user is more than 100px from bottom
    setShowScrollButton(distanceFromBottom > 100);
  };

  // Smooth scroll to bottom
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

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
    <div className="relative">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-96 overflow-y-auto pr-4 space-y-4"
      >
        {/* Load More Button at Top */}
        {hasMore && (
          <div className="flex justify-center py-2">
            <button
              onClick={onLoadMore}
              disabled={loadingMore}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More Messages'
              )}
            </button>
          </div>
        )}

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

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all z-10 hover:scale-110"
          title="Scroll to bottom"
          aria-label="Scroll to newest messages"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
