import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";

axios.defaults.baseURL = "http://localhost:5001"; // Your Express backend
axios.defaults.withCredentials = true;

const ChatContainer = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Mark messages as seen and refresh every 3 seconds
  useEffect(() => {
    if (!selectedUser || !authUser) return;

    const markMessagesAsSeen = async () => {
      try {
        await axios.put("/api/messages/mark-seen", {
          senderId: selectedUser._id,
          receiverId: authUser._id,
        });

        await getMessages(selectedUser._id, true);
        console.log("✅ Messages marked as seen and refreshed");
      } catch (error) {
        console.error("❌ Error marking messages as seen:", error);
      }
    };

    markMessagesAsSeen();
    const intervalId = setInterval(markMessagesAsSeen, 3000);
    return () => clearInterval(intervalId);
  }, [selectedUser?._id, authUser?._id]);

  // Fetch messages and set up subscription
  useEffect(() => {
    if (!selectedUser) return;

    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Scroll to latest message
  // useEffect(() => {
  //   if (messageEndRef.current && messages) {
  //     messageEndRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [messages]);

  const filteredMessages = messages.filter((msg) =>
    msg.text?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredMessages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>

            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            <div className="chat-bubble flex flex-col relative pr-6">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}

              {message.senderId === authUser._id && (
                <span
                  className={`absolute bottom-1 right-1 text-xs ${
                    message.isSeen ? "text-blue-500" : "text-gray-400"
                  }`}
                >
                  {message.isSeen ? "✓✓" : "✓"}
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
