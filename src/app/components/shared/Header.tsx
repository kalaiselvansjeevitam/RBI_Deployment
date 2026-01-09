// import { Bell, LogOut, Search, Settings } from 'lucide-react';
import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import useWindowSize from "../../core/hooks/windowResize";
import { ROUTE_URL } from "../../core/constants/coreUrl";
import Swal, { type DismissReason } from "sweetalert2";
// import { useGetadminUserLogout } from "../../core/api/Dashboard.service";
// import useWindowSize from '@/app/core/hooks/windowResize';
// import { ROUTE_URL } from '@/app/core/constants/coreUrl';
// import { Input } from '../ui/input';

interface HeaderProps {
  headerTitle: string;
  css?: string;
  description?: string;
  width?: string;
  toolbar?: React.ReactNode;
}
export interface SweetAlertResult<T = any> {
  readonly isConfirmed: boolean;
  readonly isDenied: boolean;
  readonly isDismissed: boolean;
  readonly value?: T;
  readonly dismiss?: DismissReason;
}

const Header: React.FC<HeaderProps> = ({ headerTitle, css, toolbar }) => {
  const isDesktop = useWindowSize();
  const navigate = useNavigate();
  // const { mutateAsync: getLogout } = useGetadminUserLogout();

  return (
    <>
      <div
        className={`flex p-4 bg-white w-auto md:w-full justify-between items-center fixed fill-available z-10`}
      >
        <h1
          className={`${!isDesktop ? "relative left-[68px] mt-1 w-[80%]" : ""} text-xl font-bold font-dmSans ${css} 2xl:pl-5`}
        >
          {headerTitle} {!isDesktop && <br />}
        </h1>

        <div className="flex items-center gap-7">
          {isDesktop && (
            <>
              <div className="relative w-full max-w-md">
                {/* <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                /> */}
                {/* <Input placeholder="Search" className="pl-10" /> */}
              </div>
              {/* <Settings size={50} /> */}
            </>
          )}

          {/* <Bell size={isDesktop ? 50 : 20} /> */}
          {toolbar && <div>{toolbar}</div>}
          {isDesktop && (
            <Button
              onClick={() => {
                Swal.fire({
                  title: "Are you sure to log out?",
                  showCancelButton: true,
                  confirmButtonText: "Log Out",
                  cancelButtonText: "Cancel",
                }).then(async (result) => {
                  if (result.isConfirmed) {
                    console.log();
                    // await getLogout();
                    navigate(ROUTE_URL.login);
                    await sessionStorage.removeItem("session_token");
                  }
                });
              }}
              className="bg-purple text-white rounded-[10px]"
            >
              <span className="flex gap-2 items-center">
                Sign Out <LogOut />
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* {description && (
        <p className={`${css} text-darkGray mb-0`}>{description}</p>
      )} */}
    </>
  );
};

// import React from 'react'

// export const Header = () => {
//   return (
//     // <div>Header</div>
//     <></>
//   );
// }
export default Header;
