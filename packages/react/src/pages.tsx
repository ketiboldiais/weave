import { BrowserRouter, Link, Outlet, Route, Routes } from "react-router-dom";
import MainDoc from "./demos/main.doc.mdx";
import QuadDoc from "./demos/quad.doc.mdx";
import AxesDoc from "./demos/axes.doc.mdx";
import TwineDoc from "./demos/twine.doc.mdx";

export const docLinks = {
  Intro: "/",
  Quadrilaterals: "/quad",
  Axes: "/axes",
  Twine: "/twine",
};

export const Main = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Page />}>
          <Route path={docLinks.Intro} element={<MainDoc />} />
          <Route path={docLinks.Quadrilaterals} element={<QuadDoc />} />
          <Route path={docLinks.Axes} element={<AxesDoc />} />
          <Route path={docLinks.Twine} element={<TwineDoc />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

import { BaseComponents } from "./MDXSchema.js";
import app from "./styles/app.module.scss";

function Page() {
  return (
    <div className={app.app}>
      <nav>
        <ul>
          {Object.entries(docLinks).map(([name, path]) => (
            <li key={name + path}>
              <Link to={path}>{name}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <main>
        <BaseComponents>
          <article className={app.page}>
            <Outlet />
          </article>
        </BaseComponents>
      </main>
    </div>
  );
}
