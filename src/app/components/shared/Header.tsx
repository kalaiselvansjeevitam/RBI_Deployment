import { LogOut, Menu } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import useWindowSize from "../../core/hooks/windowResize";
import { ROUTE_URL } from "../../core/constants/coreUrl";
import Swal from "sweetalert2";
import { useGetadminUserLogout } from "../../core/api/Dashboard.service";
import logo from "@/assets/images/csc-logo.svg";

interface HeaderProps {
  headerTitle: string;
  css?: string;
  toolbar?: React.ReactNode;
  onMenuClick?: () => void;
  onLogoClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  headerTitle,
  css,
  toolbar,
  onMenuClick,
  onLogoClick,
}) => {
  const isDesktop = useWindowSize();
  const navigate = useNavigate();
  const { mutateAsync: getLogout } = useGetadminUserLogout();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-18 bg-white flex items-center justify-between px-8 md:px-12 border-b shadow-sm">
      {/* LEFT: Menu (mobile) + Logo + Title */}
      <div className="flex items-center gap-10">
        {" "}
        {/* increased gap between logo and title */}
        {!isDesktop && (
          <Button size="icon" variant="ghost" onClick={onMenuClick}>
            <Menu />
          </Button>
        )}
        {/* Logo */}
        <img
          src={logo}
          alt="CSC Logo"
          className="h-12 w-auto cursor-pointer"
          onClick={onLogoClick}
        />
        {/* Header Title */}
        <h1 className={`text-xl font-bold font-dmSans ${css}`}>
          {headerTitle}
        </h1>
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
            className="bg-purple text-white rounded-lg"
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
