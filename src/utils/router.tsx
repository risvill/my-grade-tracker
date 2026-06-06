import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { CalculatorPage } from "../pages/CalculatorPage";
import { PredictorPage } from "../pages/PredictorPage";
import { AnalyticsPage } from "../pages/AnalyticsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/calculator" replace /> },
      
      { path: "calculator", element: <CalculatorPage /> },
      { path: "predictor", element: <PredictorPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
    ],
  },
]);