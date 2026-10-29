import Link from "next/link";
import type { ReactNode } from "react";

export function Shell({ children, trailing }: { children: ReactNode; trailing?: ReactNode }) {
  return (
    <>
      <a className="skip" href="#content">Skip to content</a>
      <div className="wrap">
        <header className="topbar">
          <Link className="brand" href="/">Daybook</Link>
          <div className="top-actions">{trailing}</div>
        </header>
        <main id="content">{children}</main>
        <footer className="foot">
          <p>Plans stay in this browser. Grok writes them. Daybook makes the budget add up.</p>
        </footer>
      </div>
    </>
  );
}
