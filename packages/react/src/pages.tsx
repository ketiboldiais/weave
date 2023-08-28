import { BrowserRouter, Link, Outlet, Route, Routes } from "react-router-dom";
import MainDoc from "./demos/main.doc.mdx";
import QuadDoc from "./demos/quad.doc.mdx";
import AxesDoc from "./demos/axes.doc.mdx";
import TwineDoc from "./demos/twine.doc.mdx";
import VectorDoc from "./demos/vector.doc.mdx";
import { MainPage } from "./MDXSchema.js";

type LinkEntry = {
  path: string;
  visible: boolean;
};

export const docLinks: Record<string, LinkEntry> = {
  Intro: { path: "/", visible: true },
  Quadrilaterals: { path: "/quad", visible: false },
  Axes: { path: "/axes", visible: false },
  Vector: { path: "/vector", visible: true },
  Twine: { path: "/twine", visible: true },
};

const MAIN = () => (
  <MainPage>
    <MainDoc />
  </MainPage>
);

export const Main = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Page />}>
          <Route path={docLinks.Intro.path} element={<MAIN />} />
          <Route path={docLinks.Quadrilaterals.path} element={<QuadDoc />} />
          <Route path={docLinks.Axes.path} element={<AxesDoc />} />
          <Route path={docLinks.Twine.path} element={<TwineDoc />} />
          <Route path={docLinks.Vector.path} element={<VectorDoc />} />
          <Route path={"/tangle"} element={<TwineDoc />} />
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
            path.visible && (
              <li key={name + path}>
                <Link to={path.path}>{name}</Link>
              </li>
            )
          ))}
        </ul>
      </nav>
      <main>
        <BaseComponents>
          <article className={app.page}>
            <Outlet />
            <footer>&copy; 2023 Ketib Oldiais</footer>
          </article>
        </BaseComponents>
      </main>
    </div>
  );
}
