import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { MainLayout } from "../src/layouts/MainLayout";
import { CalculatorPage } from "./pages/CalculatorPage";
import { PredictorPage } from "./pages/PredictorPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SubjectProvider } from "./utils/SubjectContext";

// Создаем конфигурацию роутов
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/calculator" replace /> }, // Авто-редирект на калькулятор
      { path: "calculator", element: <CalculatorPage /> },
      { path: "predictor", element: <PredictorPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
    ],
  },
]);

export default function App() {
  return (
    <SubjectProvider>
      <RouterProvider router={router} />
    </SubjectProvider>
  );
}