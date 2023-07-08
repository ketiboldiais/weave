import { BrowserRouter, Link, Outlet, Route, Routes } from "react-router-dom";
import navcss from "./styles/nav.module.scss";
import MainDoc from "./demos/main.doc.mdx";
import QuadDoc from "./demos/quad.doc.mdx";
import { ReactNode } from "react";

export const docLinks = {
  Intro: "/",
  Quadrilaterals: '/quad'
};

export const Pages = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Page />}>
          <Route path={docLinks.Intro} element={<MainDoc />} />
          <Route path={docLinks.Quadrilaterals} element={<QuadDoc />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

function Nav({ children }: { children: ReactNode }) {
  return (
    <>
      <nav className={navcss.nav}>
        <ul>
          {Object.entries(docLinks).map(([name, path]) => (
            <li key={name + path}>
              <Link to={path}>{name}</Link>
            </li>
          ))}
        </ul>
      </nav>
      {children}
    </>
  );
}

import pagecss from "./styles/page.module.scss";

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
