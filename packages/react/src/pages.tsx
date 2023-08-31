import { BrowserRouter, Link, Outlet, Route, Routes } from "react-router-dom";
import MainDoc from "./demos/main.doc.mdx";
import TWINE from "./demos/twine.doc.mdx";
import VECTOR from "./demos/vector.doc.mdx";
import BG from "./demos/appendix/index.mdx";
import SET_THEORY from "./demos/appendix/set-theory.mdx";
import { MainPage } from "./MDXSchema.js";
import { BaseComponents } from "./MDXSchema.js";
import app from "./styles/app.module.scss";
import { ReactNode } from "react";
import ScrollToTop from "./hooks/ScrollToTop";

const MAIN = () => (
  <MainPage>
    <MainDoc />
  </MainPage>
);
const DOC = ({ children }: { children: ReactNode }) => {
  return (
    <div className={app.doc}>
      {children}
    </div>
  );
};

type LinkEntry = {
  path: string;
  title: string;
  visible: boolean;
  page: JSX.Element;
  submenu?: LinkEntry[];
  doc?: boolean;
};

// deno-fmt-ignore
export const docLinks: LinkEntry[] = [
{title: "Intro", path: "/", visible: true, page: <MAIN/> },
{title: "Vector", path: "/vector", visible: true, page: <VECTOR/> },
{title: "Twine", path: "/twine", visible: true, page: <TWINE/> },
{title: "Appendix", path: "/appendix", visible: true, page: <BG/> },
{title: "Set Theory", doc: true, path: "/set-theory", visible: false, page: <SET_THEORY/>},
];

export const Main = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Page />}>
          {docLinks.map((link) => (
            <Route
              path={link.path}
              element={link.doc ? <DOC>{link.page}</DOC> : link.page}
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
            <Outlet/>
            <footer>Ketib Oldiais | &copy; 2023</footer>
          </article>
        </BaseComponents>
      </main>
    </div>
  );
}
