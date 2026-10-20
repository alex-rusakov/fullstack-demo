"use client";

import { useEffect, useState } from "react";

type Item = { id: number; title: string; body: string };
type State = { status: "loading" | "ready" | "error"; items: Item[]; error?: string };

export default function Home() {
  const [state, setState] = useState<State>({ status: "loading", items: [] });
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const loadItems = async () => {
    setState({ status: "loading", items: [] });
    try {
      const res = await fetch("/api/items");
      if (res.status === 401) {
        setState({ status: "ready", items: [] });
        return;
      }
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setState({ status: "ready", items: data.items });
    } catch (e) {
      setState({ status: "error", items: [], error: (e as Error).message });
    }
  };

  useEffect(() => { loadItems(); }, []);

  const auth = async (path: "register" | "login") => {
    setAuthError(null);
    const res = await fetch("/api/auth/" + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setAuthError(data.error || "Something went wrong");
      return;
    }
    await loadItems();
  };

  const addItem = async () => {
    if (!title.trim()) return;
    await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body: "" }),
    });
    setTitle("");
    await loadItems();
  };

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Full-Stack Demo</h1>

      <section>
        <h2>Account</h2>
        <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={() => auth("register")}>Sign up</button>
        <button onClick={() => auth("login")}>Sign in</button>
        {authError && <p role="alert">{authError}</p>}
      </section>

      <section>
        <h2>Items</h2>
        <input placeholder="New item title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button onClick={addItem}>Add</button>

        {state.status === "loading" && <p>Loading…</p>}
        {state.status === "error" && <p role="alert">Error: {state.error}</p>}
        {state.status === "ready" && state.items.length === 0 && <p>No items yet — sign up and add the first one.</p>}
        {state.status === "ready" && state.items.map((item) => (
          <article key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
