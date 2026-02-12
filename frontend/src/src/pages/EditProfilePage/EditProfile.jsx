import React from "react";
import NavBar from "../HomePage/NavBar";
import Section1 from "./Section1";
import Footer from "../HomePage/Footer";

export default function EditProfile() {
  return (
    <div className="dark min-h-screen flex flex-col bg-[#020617] text-gray-100">
      <NavBar />
      <main className="flex-grow">
        <Section1 />
      </main>
      <Footer />
    </div>
  );
}
