"use client";

import { PropsWithChildren } from "react";
import { ThemeProvider } from "./mt-components";

export function Providers({ children }: PropsWithChildren) {
    return <ThemeProvider>{children}</ThemeProvider>;
}
