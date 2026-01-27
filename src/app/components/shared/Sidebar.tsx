import {
  Menu,
  LogOut,
  Home,
  User,
  View,
  Upload,
  ClipboardList,
  UserPlus,
  Eye,
  Locate,
  File,
  FileText,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import useWindowSize from "../../core/hooks/windowResize";
import { ROUTE_URL } from "../../core/constants/coreUrl";
import { Sheet, SheetContent } from "../ui/sheet";
import logo from "@/assets/images/RBI.png";

/* ---------------- TYPES ---------------- */

type SidebarItemType = {
  icon: LucideIcon;
  label: string;
  href: string;
  children?: SidebarItemType[];
};

interface SidebarProps {
  open?: boolean; // desktop
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen?: boolean; // mobile
  setMobileOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

/* ---------------- COMPONENT ---------------- */

const Sidebar: React.FC<SidebarProps> = ({
  open = true,
  setOpen,
  mobileOpen,
  setMobileOpen,
}) => {
  const user_type = sessionStorage.getItem("user_type");
  const isDesktop = useWindowSize();
  const location = useLocation();
  const navigate = useNavigate();

  /* ---------------- MENU CONFIG ---------------- */

  const sidebarItems: SidebarItemType[] = [];

  if (user_type?.toLowerCase() === "admin") {
    sidebarItems.splice(1, 0, {
      icon: Home,
      label: "Admin Dashboard",
      href: ROUTE_URL.adminDashboard,
    });
    sidebarItems.splice(2, 0, {
      icon: Home,
      label: "Manage Users",
      href: ROUTE_URL.createUser,
      children: [
        {
          label: "Create Users",
          href: ROUTE_URL.createUser,
          icon: User,
        },
        {
          label: "View Users",
          href: ROUTE_URL.viewUser,
          icon: View,
        },
        {
          label: "VLE Upload",
          href: ROUTE_URL.uploadVle,
          icon: Upload,
        },
      ],
    });
    sidebarItems.splice(3, 0, {
      icon: Home,
      label: "Manage Session",
      href: ROUTE_URL.viewSession,
      children: [
        {
          label: "View Session",
          href: ROUTE_URL.viewSession,
          icon: User,
        },
      ],
    });
    sidebarItems.splice(3, 0, {
      icon: Locate,
      label: "Location Manager",
      href: ROUTE_URL.createLoactionManager,
      children: [
        {
          label: "Add Locations",
          href: ROUTE_URL.createLoactionManager,
          icon: UserPlus,
        },
        {
          label: "View Locations",
          href: ROUTE_URL.viewLocationManager,
          icon: View,
        },
      ],
    });
    sidebarItems.splice(4, 0, {
      icon: File,
      label: "Report",
      href: ROUTE_URL.downloadVLEReport,
      children: [
        {
          label: "VLE Report",
          href: ROUTE_URL.downloadVLEReport,
          icon: UserPlus,
        },
        {
          label: "Citizen Report",
          href: ROUTE_URL.downloadCitizenReport,
          icon: View,
        },
        {
          label: "Workshop Report",
          href: ROUTE_URL.downloadWorkshopReport,
          icon: View,
        },
      ],
    });
  } else if (user_type?.toLowerCase() === "vle") {
    sidebarItems.splice(2, 0, {
      icon: Home,
      label: "Dashboard",
      href: ROUTE_URL.vleDashboard,
    });
    sidebarItems.splice(2, 0, {
      icon: ClipboardList,
      label: "Work Shop",
      href: ROUTE_URL.createWorkShop,
      children: [
        {
          label: "Create Work Shop",
          href: ROUTE_URL.createWorkShop,
          icon: UserPlus,
        },
        {
          label: "View Workshop",
          href: ROUTE_URL.ViewWorkshop,
          icon: Eye,
        },
        {
          label: "Upload Files",
          href: ROUTE_URL.uploadTestimony,
          icon: Upload,
        },
      ],
    });
    sidebarItems.splice(3, 0, {
      icon: User,
      label: "Citizen",
      href: ROUTE_URL.createCitizens,
      children: [
        {
          label: "Create Citizens",
          href: ROUTE_URL.createCitizens,
          icon: UserPlus,
        },
        {
          label: "Upload Citizens",
          href: ROUTE_URL.mapCitizen,
          icon: Upload,
        },
      ],
    });
  } else if (user_type?.toLowerCase() === "rbi") {
    sidebarItems.splice(2, 0, {
      icon: BarChart3,
      label: "Dashboard",
      href: ROUTE_URL.rbiDashboard,
    });

    // sidebarItems.splice(3, 0, {
    //   icon: Calendar,
    //   label: "Month View",
    //   href: ROUTE_URL.rbiMonthView,
    // });

    // sidebarItems.splice(4, 0, {
    //   icon: ClipboardList,
    //   label: "Workshop Date Wise",
    //   href: ROUTE_URL.rbiWorkshopDateWise,
    // });

    sidebarItems.splice(5, 0, {
      icon: FileText,
      label: "Reports",
      href: ROUTE_URL.rbiReportDistrictStatus,
      children: [
        {
          label: "District Status",
          href: ROUTE_URL.rbiReportDistrictStatus,
          icon: View,
        },
        {
          label: "Gender Participation",
          href: ROUTE_URL.rbiReportGenderParticipation,
          icon: View,
        },
        {
          label: "Citizen Data",
          href: ROUTE_URL.rbiReportCitizenData,
          icon: View,
        },
        // {
        //   label: "Location Schedule",
        //   href: ROUTE_URL.rbiReportLocationSchedule,
        //   icon: View,
        // },
        // {
        //   label: "Pending vs Completed",
        //   href: ROUTE_URL.rbiReportDistrictPendingComplete,
        //   icon: View,
        // },
        // {
        //   label: "< 50 Attendees",
        //   href: ROUTE_URL.rbiReportWorkshopsLt50,
        //   icon: View,
        // },
      ],
    });
  } else if (user_type?.toLowerCase() === "sub_admin") {
    sidebarItems.splice(1, 0, {
      icon: Home,
      label: "Sub Admin Dashboard",
      href: ROUTE_URL.subAdminDashboard,
    });
    sidebarItems.splice(2, 0, {
      icon: FileText,
      label: "Reports",
      href: ROUTE_URL.subAdminReportDistrictStatus,
      children: [
        {
          label: "District Status",
          href: ROUTE_URL.subAdminReportDistrictStatus,
          icon: View,
        },
        {
          label: "Gender Participation",
          href: ROUTE_URL.subAdminReportGenderParticipation,
          icon: View,
        },
        {
          label: "Citizen Data",
          href: ROUTE_URL.subAdminReportCitizenData,
          icon: View,
        },
        {
          label: "Location Schedule",
          href: ROUTE_URL.subAdminReportLocationSchedule,
          icon: View,
        },
        {
          label: "Pending vs Completed",
          href: ROUTE_URL.subAdminReportDistrictPendingComplete,
          icon: View,
        },
        {
          label: "< 50 Attendees",
          href: ROUTE_URL.subAdminReportWorkshopsLt50,
          icon: View,
        },
      ],
    });
  }

  /* ---------------- HELPERS ---------------- */

  const handleNavigation = (path: string) => {
    navigate(path);
    if (!isDesktop) setMobileOpen?.(false);
  };

  /* ---------------- ITEM ---------------- */

  const SidebarItem = ({ item }: { item: SidebarItemType }) => {
    const isActive =
      location.pathname === item.href ||
      item.children?.some((c) => c.href === location.pathname);

    return (
      <div>
        <Button
          variant="ghost"
          className={`w-full justify-start bg-white ${
            isActive ? "text-blue-600" : "text-gray-700"
          }`}
          onClick={() => handleNavigation(item.href)}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {isDesktop ? open && item.label : item.label}
        </Button>

        {/* CHILDREN */}
        {item.children && (!isDesktop || open) && (
          <div className="ml-6 mt-1 flex flex-col gap-1">
            {item.children.map((child) => (
              <Button
                key={child.label}
                variant="ghost"
                className={`justify-start text-sm bg-white ${
                  location.pathname === child.href
                    ? "text-sky-600"
                    : "text-gray-600"
                }`}
                onClick={() => handleNavigation(child.href)}
              >
                <child.icon className="mr-2 h-3 w-3" />
                {child.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ---------------- CONTENT ---------------- */

  const SidebarContent = () => (
    <div
      className={`flex flex-col justify-between bg-white transition-all
      ${isDesktop ? "h-full" : "h-screen"}
      ${isDesktop ? (open ? "w-56" : "w-16") : "w-full"}
    `}
    >
      {/* TOP */}
      <div
        className={`h-16 flex items-center ${
          open ? "justify-start pl-4" : "justify-center"
        } border-b cursor-pointer`}
        onClick={() => isDesktop && setOpen?.(!open)}
      >
        {isDesktop ? (
          <>
            <img
              src={logo}
              alt="CSC Logo"
              className={`h-8 w-auto transition-all duration-200 ${
                open ? "opacity-100" : "opacity-0"
              }`}
            />
            {!open && <Menu className="h-6 w-6 absolute left-3" />}
          </>
        ) : (
          <img src={logo} alt="CSC Logo" className="h-8 w-auto" />
        )}
      </div>

      {/* MENU ITEMS */}
      <div className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => (
          <SidebarItem key={item.label} item={item} />
        ))}
      </div>
      {!isDesktop && (
        <Button
          variant="ghost"
          className="bg-purple text-white rounded-none"
          onClick={() => navigate(ROUTE_URL.login)}
        >
          <LogOut className="mr-2" />
          Logout
        </Button>
      )}
    </div>
  );

  /* ---------------- RENDER ---------------- */

  if (isDesktop) {
    return (
      <div className="fixed left-0 top-0 h-screen border-r bg-white z-30">
        <SidebarContent />
      </div>
    );
  }

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent side="left" className="p-0 w-[75%] max-w-xs">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
