import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/lib/queryClient";
import { Home } from "@/pages/Home";
import { Detail } from "@/pages/Detail";
import { Search } from "@/pages/Search";
import { MyActivity } from "@/pages/MyActivity";
import { BottomTabBar } from "@/features/tab-bar";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/makgeolli/:id" element={<Detail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/my-activity" element={<MyActivity />} />
        </Routes>
        <BottomTabBar />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
