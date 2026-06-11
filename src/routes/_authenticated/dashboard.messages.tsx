import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard/messages")({
  component: () => (
    <div>
      <h1 className="text-2xl font-extrabold">Messages</h1>
      <p className="mt-2 text-sm text-text-2">Realtime chat with the LaunchBridge team. (Coming next iteration.)</p>
    </div>
  ),
});
