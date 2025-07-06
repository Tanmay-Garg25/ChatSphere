import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import axios from "axios";


import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";


axios.defaults.baseURL = "http://localhost:5001"; // 👈 your Express backend URL
axios.defaults.withCredentials = true;
const ChatContainer = () => {
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




  const renderMessageText = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, index) =>
    urlRegex.test(part) ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline break-words"
      >
        {part}
      </a>
    ) : (
      <span key={index}>{part}</span>
    )
  );
};


  // 03-07-2025
//   useEffect(() => {
//   if (!navigator.geolocation) {
//     console.warn("Geolocation not supported.");
//     return;
//   }

//   navigator.geolocation.getCurrentPosition(
//     (position) => {
//       const { latitude, longitude } = position.coords;
//       const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
//       console.log(`https://www.google.com/maps?q=${latitude},${longitude}`);
//       axios.post(`/api/messages/send/${selectedUser._id}`, {
//        text: mapsUrl,
// });
//     },
//     (error) => {
//       console.error("Error getting location:");
//       console.error("Code:", error.code);
//       console.error("Message:", error.message || "No message provided");
//     },
//     {
//       enableHighAccuracy: false,
//       timeout: 7000,
//       maximumAge: 0,
//     }
//   );
// }, [selectedUser._id]);
// const handleSendLocation = () => {
//   if (!navigator.geolocation) {
//     alert("Geolocation is not supported by your browser.");
//     return;
//   }

//   navigator.geolocation.getCurrentPosition(
//     async (position) => {
//       const { latitude, longitude } = position.coords;
//       const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

//       try {
//         await axios.post(`/api/messages/send/${selectedUser._id}`, {
//           text: mapsUrl,
//         });
//       } catch (error) {
//         console.error("Failed to send location:", error);
//       }
//     },
//     (error) => {
//       console.error("Error getting location:", error.message);
//     },
//     {
//       enableHighAccuracy: false,
//       timeout: 7000,
//       maximumAge: 0,
//     }
//   );
// };






useEffect(() => {
  if (!selectedUser || !authUser) return;

  const markMessagesAsSeen = async () => {
    try {
      await axios.put("/api/messages/mark-seen", {
        senderId: selectedUser._id,   
        receiverId: authUser._id,     
      });
      console.log("hi");
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  };

  markMessagesAsSeen();
}, [selectedUser._id]);




  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
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
  {/* {message.text && <p>{message.text}</p>} */}
  {message.text && <p>{renderMessageText(message.text)}</p>}


  {message.senderId === authUser._id && (
    <span className={`absolute bottom-1 right-1 text-xs ${message.isSeen ? "text-blue-500" : "text-gray-400"}`}>
      {message.isSeen ? "✓✓" : "✓"}
    </span>
  )}
</div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
