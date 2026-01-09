import { createBrowserRouter } from "react-router-dom";
import { authProtectedRoutes, authRoutes } from "./routes";

const MainRoutes = createBrowserRouter([...authProtectedRoutes, ...authRoutes]);

export default MainRoutes;
