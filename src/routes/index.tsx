import { createFileRoute } from "@tanstack/react-router";
import { BeninShell } from "@/components/benin/BeninShell";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <BeninShell />;
}
