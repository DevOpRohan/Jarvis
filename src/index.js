import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import Chat from "./Chat";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <Chat />
  </StrictMode>
);
