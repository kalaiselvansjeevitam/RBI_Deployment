import React, { useState } from "react";
import useWindowSize from "../../core/hooks/windowResize";
import Sidebar from "../shared/Sidebar";
import Header from "../shared/Header";
import { Toaster } from "sonner";

const Layout = ({
  children,
  headerTitle = "Dashboard",
  css,
  toolbar,
}: {
  children?: React.ReactNode;
  headerTitle?: string;
  css?: string;
  toolbar?: React.ReactNode;
}) => {
  const isDesktop = useWindowSize();

  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="flex h-screen">
        {/* DESKTOP SIDEBAR */}
        {isDesktop && (
          <aside className={`transition-all ${desktopOpen ? "w-52" : "w-16"}`}>
            <Sidebar open={desktopOpen} setOpen={setDesktopOpen} />
          </aside>
        )}

        {/* MAIN */}
        <main className="flex flex-col flex-1 min-w-0 overflow-auto">
          <Header
            headerTitle={headerTitle}
            css={css}
            toolbar={toolbar}
            onMenuClick={() => setMobileOpen(true)}
            // onLogoClick={() => setDesktopOpen((prev) => !prev)} // toggle sidebar
          />

          <div className="flex-1 bg-lightBlue p-4 pt-[64px] font-dmSans">
            {children}
          </div>
        </main>

        {/* MOBILE SIDEBAR */}
        {!isDesktop && (
          <Sidebar
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            open={undefined} // explicitly allow desktop props undefined
            setOpen={undefined} // explicitly allow desktop props undefined
          />
        )}
      </div>
    </>
  );
};

export default Layout;
