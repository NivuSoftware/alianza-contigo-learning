const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

function cookie(name: string) {
  return document.cookie
    .split("; ")
    .find((value) => value.startsWith(`${name}=`))
    ?.split("=")[1];
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession() {
  if (!refreshPromise) {
    const csrf = cookie("alianza_refresh_csrf");
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: csrf ? { "X-CSRF-TOKEN": decodeURIComponent(csrf) } : {},
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function api<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const method = init.method?.toUpperCase() || "GET";
  const csrf = cookie(
    method === "POST" && path === "/auth/refresh" ? "alianza_refresh_csrf" : "alianza_access_csrf",
  );
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(csrf ? { "X-CSRF-TOKEN": decodeURIComponent(csrf) } : {}),
      ...init.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  const canRefresh =
    response.status === 401 &&
    retry &&
    path !== "/auth/login" &&
    path !== "/auth/register" &&
    path !== "/auth/refresh";
  if (canRefresh && (await refreshSession())) return api<T>(path, init, false);
  if (!response.ok)
    throw new ApiError(data.message || "No pudimos completar la solicitud.", response.status);
  return data as T;
}

async function formRequest<T>(path: string, body: FormData, retry = true): Promise<T> {
  const csrf = cookie("alianza_access_csrf");
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: csrf ? { "X-CSRF-TOKEN": decodeURIComponent(csrf) } : {},
    body,
  });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401 && retry && (await refreshSession())) {
    return formRequest<T>(path, body, false);
  }
  if (!response.ok)
    throw new ApiError(data.message || "No pudimos completar la solicitud.", response.status);
  return data as T;
}

export async function upload(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const data = await formRequest<{ url: string }>("/uploads", body);
  return data.url;
}

export async function apiForm<T>(path: string, body: FormData): Promise<T> {
  return formRequest<T>(path, body);
}
