import { LogOut, Menu } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import useWindowSize from "../../core/hooks/windowResize";
import { ROUTE_URL } from "../../core/constants/coreUrl";
import Swal from "sweetalert2";
import { useGetadminUserLogout } from "../../core/api/Dashboard.service";
import logo from "@/assets/images/RBI.png";

interface HeaderProps {
  headerTitle: string;
  css?: string;
  toolbar?: React.ReactNode;
  onMenuClick?: () => void; // toggles sidebar open/close
  sidebarOpen?: boolean; // track sidebar state
}

const Header: React.FC<HeaderProps> = ({
  headerTitle,
  css,
  toolbar,
  onMenuClick,
  sidebarOpen = true,
}) => {
  const isDesktop = useWindowSize();
  const navigate = useNavigate();
  const { mutateAsync: getLogout } = useGetadminUserLogout();

  // Handle logo click: on desktop, toggle sidebar
  const handleLogoClick = () => {
    if (isDesktop && onMenuClick) {
      onMenuClick(); // toggle sidebar
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-18 bg-white flex items-center justify-between px-8 md:px-12 border-b shadow-sm">
      {/* LEFT: Menu (mobile) + Logo + Title */}
      <div className="flex items-center gap-10">
        {isDesktop ? (
          sidebarOpen ? (
            // Sidebar open → show logo + title
            <>
              <img
                src={logo}
                alt="CSC Logo"
                className="h-12 w-auto cursor-pointer"
                onClick={handleLogoClick}
              />
              <h1 className={`text-xl font-bold font-dmSans ${css}`}>
                {headerTitle}
              </h1>
            </>
          ) : (
            // Sidebar closed → show menu button
            <Button size="icon" variant="ghost" onClick={onMenuClick}>
              <Menu />
            </Button>
          )
        ) : (
          // Mobile → always show menu button + logo + title
          <>
            <Button size="icon" variant="ghost" onClick={onMenuClick}>
              <Menu />
            </Button>
            <img
              src={logo}
              alt="CSC Logo"
              className="h-12 w-auto cursor-pointer"
              onClick={handleLogoClick}
            />
          </>
        )}
      </div>

      {/* RIGHT: Toolbar + Logout */}
      <div className="flex items-center gap-4">
        {toolbar}

        {isDesktop && (
          <Button
            onClick={() => {
              Swal.fire({
                title: "Are you sure to log out?",
                showCancelButton: true,
                confirmButtonText: "Log Out",
              }).then(async (result) => {
                if (result.isConfirmed) {
                  await getLogout();
                  sessionStorage.clear();
                  navigate(ROUTE_URL.login);
                }
              });
            }}
            className="text-white rounded-lg"
          >
            <LogOut className="mr-2" />
            Sign Out
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
