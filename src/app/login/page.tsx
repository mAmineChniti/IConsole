import Login from "@/components/Login/Login";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "IConsole | Login",
};

export default function LoginPage() {
  return <Login />;
}
