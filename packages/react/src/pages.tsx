import { BrowserRouter, Link, Outlet, Route, Routes } from "react-router-dom";
import MainDoc from "./demos/main.doc.mdx";
import QUAD from "./demos/quad.doc.mdx";
import AXES from "./demos/axes.doc.mdx";
import TWINE from "./demos/twine.doc.mdx";
import VECTOR from "./demos/vector.doc.mdx";
import { MainPage } from "./MDXSchema.js";
import { BaseComponents } from "./MDXSchema.js";
import app from "./styles/app.module.scss";

const MAIN = () => (
  <MainPage>
    <MainDoc />
  </MainPage>
);

const Dropdown = ({ links }: { links: LinkEntry[] }) => {
  return (
    <ul className={`dropdown`}>
    </ul>
  );
};

type LinkEntry = {
  path: string;
  title: string;
  visible: boolean;
  page: JSX.Element;
  submenu?: LinkEntry[];
};

export const docLinks: LinkEntry[] = [
  { title: "Intro", path: "/", visible: true, page: <MAIN /> },
  { title: "Quadrilaterals", path: "/quad", visible: false, page: <QUAD /> },
  { title: "Axes", path: "/axes", visible: false, page: <AXES /> },
  { title: "Vector", path: "/vector", visible: true, page: <VECTOR /> },
  { title: "Twine", path: "/twine", visible: true, page: <TWINE /> },
];

export const Main = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Page />}>
          {docLinks.map((link) => (
            <Route
              path={link.path}
              element={link.page}
              key={link.path}
            />
          ))}
          <Route path={"/tangle"} element={<TWINE />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};



function Page() {
  return (
    <div className={app.app}>
      <nav>
        <ul>
          {(docLinks).map((link) => (
            link.visible && (
              <li key={name + link.path}>
                <Link to={link.path}>{link.title}</Link>
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
