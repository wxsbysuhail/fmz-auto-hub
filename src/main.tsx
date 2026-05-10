import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

const router = getRouter();

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

// Ensure we are doing a clean render for SPA mode
root.render(<RouterProvider router={router} />);
