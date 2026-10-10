"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Palette, X } from "lucide-react";

const designs = [
  { id: "atlas", name: "Classic", description: "A quiet, familiar directory." },
  {
    id: "brutalism",
    name: "Brutalism",
    description: "Clean lines. Honest structure.",
  },
  {
    id: "bento",
    name: "Bento grid",
    description: "Balanced tiles and open space.",
  },
  {
    id: "clay",
    name: "Claymorphism",
    description: "Soft surfaces, gently raised.",
  },
  {
    id: "maximalism",
    name: "Maximalism",
    description: "Editorial rhythm, restrained color.",
  },
  {
    id: "glass",
    name: "Glassmorphism",
    description: "Light layers and subtle depth.",
  },
] as const;
const modes = ["light", "dark", "amoled"] as const;
const accents = ["blue", "lime", "rose", "orange"] as const;

export default function Appearance() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [design, setDesign] = useState("bento");
  const [mode, setMode] = useState("dark");
  const [accent, setAccent] = useState("blue");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const d = root.dataset.design;
    const m = root.dataset.theme;
    const a = root.dataset.accent;
    if (designs.some((item) => item.id === d)) setDesign(d!);
    if (modes.some((item) => item === m)) setMode(m!);
    if (accents.some((item) => item === a)) setAccent(a!);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.dataset.design = design;
    root.dataset.theme = mode;
    root.dataset.accent = accent;
    try {
      localStorage.setItem("atlas-design", design);
      localStorage.setItem("atlas-theme", mode);
      localStorage.setItem("atlas-accent", accent);
    } catch {
      /* Private browsing can restrict device preferences. */
    }
  }, [design, mode, accent, ready]);

  return (
    <>
      <button
        className="appearance-trigger"
        onClick={() => dialog.current?.showModal()}
        aria-haspopup="dialog"
      >
        <Palette size={18} />
        <span>Theme</span>
      </button>
      <dialog
        ref={dialog}
        className="theme-dialog"
        aria-labelledby="theme-title"
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current?.close();
        }}
      >
        <div className="theme-dialog-inner">
          <header>
            <div>
              <h2 id="theme-title">Make it yours.</h2>
              <p>A quieter way to explore.</p>
            </div>
            <button
              className="icon-button"
              aria-label="Close theme settings"
              onClick={() => dialog.current?.close()}
            >
              <X size={20} />
            </button>
          </header>
          <fieldset>
            <legend>Layout</legend>
            <div className="design-options">
              {designs.map((item) => (
                <label className="design-option" key={item.id}>
                  <input
                    type="radio"
                    name="design"
                    value={item.id}
                    checked={design === item.id}
                    onChange={() => setDesign(item.id)}
                  />
                  <span
                    className={"design-preview preview-" + item.id}
                    aria-hidden="true"
                  >
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="design-option-text">
                    <strong>{item.name}</strong>
                    <small>{item.description}</small>
                  </span>
                  <Check
                    className="choice-check"
                    size={16}
                    aria-hidden="true"
                  />
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Brightness</legend>
            <div className="brightness-options">
              {modes.map((item) => (
                <label key={item}>
                  <input
                    type="radio"
                    name="brightness"
                    checked={mode === item}
                    onChange={() => setMode(item)}
                  />
                  <span>{item === "amoled" ? "AMOLED" : item}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Accent</legend>
            <div className="accent-options">
              {accents.map((item) => (
                <label key={item}>
                  <input
                    type="radio"
                    name="accent"
                    checked={accent === item}
                    onChange={() => setAccent(item)}
                  />
                  <span
                    className={"accent-swatch swatch-" + item}
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="theme-dialog-footer">
            <span>Saved on this device.</span>
            <button className="pill" onClick={() => dialog.current?.close()}>
              Done
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
