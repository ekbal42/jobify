import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useActionData,
  useFetchers,
  useMatches,
} from "@remix-run/react";
import { Notification } from "./components/Notification";
import { useEffect, useState } from "react";
import { LinksFunction } from "@remix-run/node";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const matches = useMatches();
  const actionData = useActionData<ActionData>();
  const fetchers = useFetchers();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const generateToastId = () => Math.random().toString(36).substring(2, 9);

  const loaderToasts = matches
    .map((match) => (match.data as LoaderData)?.toast)
    .filter(Boolean) as Toast[];

  useEffect(() => {
    if (loaderToasts.length > 0) {
      setToasts((prev) => {
        const newToasts = loaderToasts.filter(
          (toast) => !prev.some((t) => t.message === toast.message)
        );
        return [
          ...prev,
          ...newToasts.map((toast) => ({ ...toast, id: generateToastId() })),
        ];
      });
    }
  }, [loaderToasts]);

  useEffect(() => {
    if (actionData?.toast) {
      setToasts((prev: any) => {
        const toastExists = prev.some(
          (t: any) => t.message === actionData.toast?.message
        );
        if (!toastExists) {
          return [...prev, { ...actionData.toast, id: generateToastId() }];
        }
        return prev;
      });
    }
  }, [actionData]);

  useEffect(() => {
    fetchers.forEach((fetcher) => {
      const toast = (fetcher.data as ActionData)?.toast;
      if (toast) {
        setToasts((prev) => {
          const toastExists = prev.some((t) => t.message === toast.message);
          if (!toastExists) {
            return [...prev, { ...toast, id: generateToastId() }];
          }
          return prev;
        });
      }
    });
  }, [fetchers]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        {/* Render all toasts */}
        {toasts.map((toast) => (
          <Notification
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
export interface LoaderData {
  toast?: Toast;
}

export interface ActionData {
  toast?: Toast;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}
