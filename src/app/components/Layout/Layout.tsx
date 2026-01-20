import React, { useEffect, useState } from "react";
import { Toaster } from "sonner";
import useWindowSize from "../../core/hooks/windowResize";

// import Header from '../shared/Header';
// import { useLocation } from 'react-router-dom';
import Header from "../shared/Header";
import Sidebar from "../shared/Sidebar";

let sidebarOpen = true;
// const getSecondUrlSegment = (url: string) => {
//   const pathParts = url.split('/');
//   return pathParts.length > 2 ? pathParts[3] : '';
// };
const Layout = ({
  children,
  headerTitle = "Dashboard",
  css,
  description,
  toolbar,
}: {
  children?: React.ReactNode;
  headerTitle?: string;
  css?: string;
  description?: string;
  backNavigateUrl?: string;
  toolbar?: React.ReactNode;
}) => {
  const isDesktop = useWindowSize();
  // const location = useLocation();
  const [open, setOpen] = useState(sidebarOpen);
  // const [selectedPage, setSelectedPage] = useState('');
  // useEffect(() => {
  //   const locationName = getSecondUrlSegment(location.pathname);

  //   setSelectedPage(locationName);
  // });
  useEffect(() => {
    sidebarOpen = open;
  }, [open]);

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="flex h-screen">
        <aside
          className={`h-full ${isDesktop ? (open ? "w-52" : "w-16") : "absolute w-auto left-0 top-0 bg-transparent shadow-none z-20"}`}
        >
          <Sidebar setOpen={setOpen} open={open} />
        </aside>

        <main className="flex flex-col flex-1 min-w-0">
          <Header
            headerTitle={headerTitle}
            css={css}
            description={description}
            toolbar={toolbar}
          />
          {/* {toolbar && (
          <div className="sticky top-[20px] right-40 z-10 ml-auto mr-10">{toolbar}</div> */}
          {/* )} */}
          <div
            className={`p-4 flex-1 bg-lightBlue ${css} 2xl:pl-5 font-dmSans mt-[80px]`}
          >
            {children}
          </div>
        </main>
      </div>
    </>
  );
};

export default Layout;
