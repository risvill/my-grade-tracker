import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "../src/layouts/MainLayout"; // Создадим ниже
import { CalculatorPage } from "./pages/CalculatorPage";
import { PredictorPage } from "./pages/PredictorPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SubjectProvider } from "./utils/SubjectContext";

export default function App() {
  return (
    <SubjectProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<CalculatorPage />} />
          <Route path="calculator" element={<CalculatorPage />} />
          <Route path="predictor" element={<PredictorPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </SubjectProvider>
  );
}