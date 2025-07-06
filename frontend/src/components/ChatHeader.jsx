import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import axios from "axios";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";


const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers,user,updateBlockedUsers } = useAuthStore();


const handleBlockUser = async () => {
  try {
    await axios.post(`/api/auth/block/${selectedUser._id}`);
    toast.success("User blocked");
    setIsBlocked(true); // manually toggle
  } catch (err) {
    console.error("Error blocking user:", err);
    toast.error("Failed to block user");
  }
};

const handleUnblockUser = async () => {
  try {
    await axios.post(`/api/auth/unblock/${selectedUser._id}`);
    toast.success("User unblocked");
    setIsBlocked(false); // manually toggle
  } catch (err) {
    console.error("Error unblocking user:", err);
    toast.error("Failed to unblock user");
  }
};
const [isBlocked, setIsBlocked] = useState(false);

useEffect(() => {
  if (selectedUser && user) {
    setIsBlocked(user.blockedUsers?.includes(selectedUser._id));
  }
}, [selectedUser, user]);



  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        
        {/* Close button */}
      <div className="flex items-center gap-2">
  <button onClick={() => setSelectedUser(null)}>
    <X />
  </button>
  {isBlocked ? (
  <button
    className="btn btn-xs btn-success text-white"
    onClick={handleUnblockUser}
  >
    Unblock
  </button>
) : (
  <button
    className="btn btn-xs btn-error text-white"
    onClick={handleBlockUser}
  >
    Block
  </button>
)}
  {/* <button
    className="btn btn-xs btn-error text-white"
    onClick={handleBlockUser}
  >
    Block
  </button> */}
</div>
      </div>
    </div>
  );
};
export default ChatHeader;
