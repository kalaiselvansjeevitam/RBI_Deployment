import { Suspense } from "react";
import "./App.css";
import { RouterProvider } from "react-router-dom";
import MainRoutes from "./app/routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QUERY_CLIENT_DEFAULT_OPTIONS } from "./app/core/constants/queryClientConfig";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: QUERY_CLIENT_DEFAULT_OPTIONS,
  });
  return (
    <div className="">
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<div>loading...</div>}>
          <RouterProvider router={MainRoutes} />
        </Suspense>
      </QueryClientProvider>
    </div>
  );
}

export default App;
