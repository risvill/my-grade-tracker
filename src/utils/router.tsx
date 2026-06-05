import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { CalculatorPage } from "../pages/CalculatorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "calculator", element: <CalculatorPage /> }
      // Остальные пути пока удали или закомментируй
    ],
  },
]);