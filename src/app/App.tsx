import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/lib/queryClient";
import { Home } from "@/pages/Home";
import { Detail } from "@/pages/Detail";
import { Search } from "@/pages/Search";
import { MyActivity } from "@/pages/MyActivity";
import { Filter } from "@/pages/Filter";
import { Awards } from "@/pages/Awards";
import { AllComments } from "@/pages/AllComments";
import { BottomTabBar } from "@/features/tab-bar";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/makgeolli/:id" element={<Detail />} />
          <Route path="/filter/:type" element={<Filter />} />
          <Route path="/awards/:awardId" element={<Awards />} />
          <Route path="/comments/all" element={<AllComments />} />
          <Route path="/search" element={<Search />} />
          <Route path="/my-activity" element={<MyActivity />} />
        </Routes>
        <BottomTabBar />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
