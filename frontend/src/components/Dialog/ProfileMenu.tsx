import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { FaUserCircle, FaCog, FaQuestionCircle, FaLanguage, FaSignOutAlt } from "react-icons/fa";
import { MdAccountBox } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";

interface ProfileMenuProps {
  profilePic?: string | null;
}

export default function ProfileMenu({ profilePic }: ProfileMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { user, logout } = useAuth();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    handleClose();
    logout();
  };

  return (
    <div>
      <div
        className="cursor-pointer flex items-center  px-1 py-1 rounded-full transition-colors"
        onClick={handleClick}
      >
        {profilePic ? (
          <Avatar src={profilePic} sx={{ width: 34, height: 34 }} />
        ) : (
          <FaUserCircle size={32} className="text-gray-600" />
        )}
      </div>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { mt: 1.5, minWidth: 200, borderRadius: 2, boxShadow: 3 } }}
      >
        <Typography variant="subtitle2" className="px-3 py-1 text-gray-700">
          {user?.email}
        </Typography>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleClose} className="flex items-center space-x-2 hover:bg-gray-100">
          <MdAccountBox size={20} />
          <Typography variant="body2">View Profile</Typography>
        </MenuItem>
        <MenuItem onClick={handleClose} className="flex items-center space-x-2 hover:bg-gray-100">
          <FaCog size={16} />
          <Typography variant="body2">Settings & Privacy</Typography>
        </MenuItem>
        <MenuItem onClick={handleClose} className="flex items-center space-x-2 hover:bg-gray-100">
          <FaQuestionCircle size={16} />
          <Typography variant="body2">Help</Typography>
        </MenuItem>
        <MenuItem onClick={handleClose} className="flex items-center space-x-2 hover:bg-gray-100">
          <FaLanguage size={16} />
          <Typography variant="body2">Language</Typography>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleLogout} className="flex items-center space-x-2 hover:bg-gray-100 text-red-600">
          <FaSignOutAlt size={16} />
          <Typography variant="body2" color="error">Sign Out</Typography>
        </MenuItem>
      </Menu>
    </div>
  );
}
