import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cv/$id")({ component: CvIdLayout });

function CvIdLayout() {
  return <Outlet />;
}
