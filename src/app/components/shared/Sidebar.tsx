import {
  Menu,
  LogOut,
  Home,
  User,
  type LucideIcon,
  View,
  Upload,
  ClipboardList,
  UserPlus,
  Eye,
  Locate,
  File,
  FileText,
  // Calendar,
  BarChart3,
} from "lucide-react";
import { Button } from "../ui/button";

import { useLocation, useNavigate } from "react-router-dom";
import useWindowSize from "../../core/hooks/windowResize";
import { ROUTE_URL } from "../../core/constants/coreUrl";
// import useWindowSize from '@/app/core/hooks/windowResize';
// import { ROUTE_URL } from '@/app/core/constants/coreUrl';
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import logo from "@/assets/images/csc-logo.svg";
type SidebarItemType = {
  icon: LucideIcon;
  label: string;
  href: string;
  children?: SidebarItemType[];
};

const Sidebar = ({ open, setOpen }: { open: boolean; setOpen: any }) => {
  const user_type = sessionStorage.getItem("user_type");
  const isDesktop = useWindowSize();
  const location = useLocation();
  const navigate = useNavigate();

  const sidebarItems: SidebarItemType[] = [
    // {
    //   icon: Home,
    //   label: "Dashboard",
    //   href: ROUTE_URL.dashboard,
    // },
  ];
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
          label: "Upload Citizen",
          href: ROUTE_URL.mapCitizen,
          icon: Upload,
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
      href: ROUTE_URL.rbiReports,
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
        {
          label: "Location Schedule",
          href: ROUTE_URL.rbiReportLocationSchedule,
          icon: View,
        },
        {
          label: "Pending vs Complete",
          href: ROUTE_URL.rbiReportDistrictPendingComplete,
          icon: View,
        },
        {
          label: "< 50 Attendees",
          href: ROUTE_URL.rbiReportWorkshopsLt50,
          icon: View,
        },
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
      href: ROUTE_URL.rbiReports,
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
        {
          label: "Location Schedule",
          href: ROUTE_URL.rbiReportLocationSchedule,
          icon: View,
        },
        {
          label: "Pending vs Complete",
          href: ROUTE_URL.rbiReportDistrictPendingComplete,
          icon: View,
        },
        {
          label: "< 50 Attendees",
          href: ROUTE_URL.rbiReportWorkshopsLt50,
          icon: View,
        },
      ],
    });
  }

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // const getSecondUrlSegment = (url: string) => {
  //   const pathParts = url.split("/");
  //   return pathParts.length > 2 ? pathParts[2] : "";
  // };

  const SidebarItem = ({ item }: { item: SidebarItemType }) => {
    // const secondUrlSegment = getSecondUrlSegment(location.pathname);
    const isSelected = location.pathname === item.href;
    const isParentSelected = item.children?.some(
      (child: any) => location.pathname === child.href,
    );

    return (
      <div key={item.label}>
        <Button
          variant="ghost"
          className={`justify-start w-full flex items-center ${
            isSelected || isParentSelected
              ? "text-purple rounded-tr-lg rounded-br-lg border-purple"
              : "text-gray-700"
          }`}
          onClick={() => handleNavigation(item.href)}
        >
          <item.icon
            className={`mr-2 h-4 w-4 ${
              isSelected || isParentSelected ? "text-purple" : "text-black"
            }`}
          />
          {isDesktop ? open && item.label : item.label}
        </Button>

        {/* Always-visible submenu if children exist
        {item.children && (
          <div className="pl-6 flex flex-col gap-1 mt-1">
            {item.children.map((child: any) => (
              <Button
                key={child.label}
                variant="ghost"
                className={`justify-start w-full text-sm ${
                  location.pathname === child.href
                    ? 'text-purple  bg-gray-100'
                    : 'text-gray-600'
                }`}
                onClick={() => handleNavigation(child.href)}
              >
                {child.label}
              </Button>
            ))}
          </div>
        )} */}
        {item.children && isDesktop && open && (
          <div className="pl-6 flex flex-col gap-1 mt-1">
            {item.children.map((child: any) => (
              <Button
                key={child.label}
                variant="ghost"
                className={`justify-start w-full text-sm ${
                  location.pathname === child.href
                    ? "text-purple bg-gray-100"
                    : "text-gray-600"
                }`}
                onClick={() => handleNavigation(child.href)}
              >
                {child.icon && <child.icon className="w-4 h-4" />}
                {child.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const SidebarContent = () => (
    <div
      className={`h-full ${
        isDesktop
          ? open
            ? "w-[12.5rem]"
            : "w-16"
          : "absolute w-auto left-0 top-0 bg-transparent shadow-none"
      } bg-white transition-all flex flex-col justify-between overflow-y-auto`}
    >
      <div>
        <div className="h-[82px] flex items-center justify-center border-b border-lightBlue">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setOpen(!open)}
          >
            {isDesktop ? (
              open ? (
                <>
                  <img
                    src={logo}
                    alt="Jeevitam Logo"
                    className="h-15 w-auto pt-1"
                  />
                  {/* <span className="font-bold text-lg">Jeevitam</span> */}
                </>
              ) : (
                <Menu strokeWidth={3} />
              )
            ) : (
              <>
                <img
                  src={logo}
                  alt="Jeevitam Logo"
                  className="h-15 w-auto pt-1"
                />
                {/* <span className="font-bold text-lg ml-2">akjds</span> */}
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-2 pl-1 pt-6">
          {sidebarItems.map((item) => (
            <SidebarItem item={item} key={item.label} />
          ))}
        </div>
      </div>

      {!isDesktop && (
        <div>
          <Button
            variant="ghost"
            className="justify-start w-full bg-purple text-white hover:bg-purple hover:text-white rounded-[0px]"
            onClick={() => navigate(ROUTE_URL.login)}
          >
            <p className="flex gap-3 align-middle justify-center w-full">
              <LogOut strokeWidth={3} /> {isDesktop && open ? "Logout" : ""}
            </p>
          </Button>
        </div>
      )}
    </div>
  );

  return isDesktop ? (
    <div
      className={`fixed left-0 top-0 z-10 h-screen bg-white border-r transition-all ${
        open ? "w-48" : "w-16"
      }`}
    >
      <SidebarContent />
    </div>
  ) : (
    <Sheet>
      <SheetTrigger asChild className=" fixed">
        <Button size="icon" className="m-4 bg-none border-none">
          <Menu strokeWidth={3} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className=" w-[50%]">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
