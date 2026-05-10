import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

const router = getRouter();

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

// Using clean render to avoid hydration invariant errors
root.render(<RouterProvider router={router} />);
