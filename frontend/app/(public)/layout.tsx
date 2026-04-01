import { ReactNode } from "react";
import Navbar from "@/components/Navigation/Navbar";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {" "}
      <Navbar />
      {children}
    </>
  );
}
