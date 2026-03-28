import React from "react";
import Navbar from "@/components/Navigation/Navbar";

export default function PublicLayout({ children }) {
  return (
    <>
      {" "}
      <Navbar />
      {children}
    </>
  );
}
