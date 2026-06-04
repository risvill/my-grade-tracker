import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "../src/layouts/MainLayout"; // Создадим ниже
import { CalculatorPage } from "../src/pages/calculator/CalculatorPage";
import { PredictorPage } from "../src/pages/predictor/PredictorPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<CalculatorPage />} />
          <Route path="calculator" element={<CalculatorPage />} />
          <Route path="predictor" element={<PredictorPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}