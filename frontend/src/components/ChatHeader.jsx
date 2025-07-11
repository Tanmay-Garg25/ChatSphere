import { X, Search } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import axios from "axios";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

const ChatHeader = ({ searchQuery, setSearchQuery }) => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers, user, updateBlockedUsers } = useAuthStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (selectedUser && user) {
      setIsBlocked(user.blockedUsers?.includes(selectedUser._id));
    }
  }, [selectedUser, user]);

  const handleBlockUser = async () => {
    try {
      await axios.post(`/api/auth/block/${selectedUser._id}`);
      toast.success("User blocked");
      setIsBlocked(true);
      updateBlockedUsers(selectedUser._id, "block");
    } catch (err) {
      console.error("Error blocking user:", err);
      toast.error("Failed to block user");
    }
  };

  const handleUnblockUser = async () => {
    try {
      await axios.post(`/api/auth/unblock/${selectedUser._id}`);
      toast.success("User unblocked");
      setIsBlocked(false);
      updateBlockedUsers(selectedUser._id, "unblock");
    } catch (err) {
      console.error("Error unblocking user:", err);
      toast.error("Failed to unblock user");
    }
  };

  if (!selectedUser) return null;

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        {/* Left: Avatar + User Info */}
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            className={`btn btn-xs ${isBlocked ? "btn-success" : "btn-error"} text-white`}
            onClick={isBlocked ? handleUnblockUser : handleBlockUser}
          >
            {isBlocked ? "Unblock" : "Block"}
          </button>

          <button onClick={() => setSelectedUser(null)}>
            <X />
          </button>

          <button onClick={() => setIsSearchOpen((prev) => !prev)}>
            {isSearchOpen ? <X size={18} /> : <Search size={18} />}
          </button>
        </div>
      </div>

      {/* Search Input */}
      {isSearchOpen && (
        <div className="mt-2">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-sm input-bordered w-full"
          />
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
