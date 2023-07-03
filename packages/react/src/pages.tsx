import { BrowserRouter, Link, Outlet, Route, Routes } from "react-router-dom";

import css from "./styles/app.module.scss";
import navcss from './styles/nav.module.scss';
import TreeDoc from "./demos/tree.doc.mdx";
import MainDoc from "./demos/main.doc.mdx";
import { ReactNode, useEffect, useState } from "react";

export const docLinks = {
  Intro: "/",
  Trees: "/tree",
};

export const Pages = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Page />}>
          <Route path={docLinks.Intro} element={<MainDoc />} />
          <Route path={docLinks.Trees} element={<TreeDoc />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

function Nav({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const attribute = "(prefers-color-scheme: dark)";
    const prefersDark = window.matchMedia(attribute);
    if (prefersDark.matches) {
      setDark(true);
    }
    prefersDark.addEventListener("change", (e) => setDark(e.matches));
  }, []);
  return (
    <div className={dark ? css.dark : css.light}>
      <nav className={navcss.nav}>
        <ul>
          {Object.entries(docLinks).map(([name, path]) => (
            <li key={name + path}>
              <Link to={path}>{name}</Link>
            </li>
          ))}
        </ul>
        <button onClick={() => setDark(!dark)}>
          {dark ? "\u263c" : "\u263d"}
        </button>
      </nav>
      {children}
    </div>
  );
}

import pagecss from './styles/page.module.scss';

function Page() {
  return (
    <Nav>
      <main>
        <article className={pagecss.page}>
          <Outlet />
        </article>
      </main>
    </Nav>
  );
}
