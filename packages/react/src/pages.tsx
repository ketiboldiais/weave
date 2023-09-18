import {
  BrowserRouter,
  Link,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import BG from "./demos/appendix/index.mdx";
import SET_THEORY from "./demos/appendix/set-theory.mdx";
import EXPOSITION from "./demos/appendix/exposition.mdx";
import NUMBER_THEORY from "./demos/appendix/number-theory-1.mdx";
import PRECALCULUS from "./demos/appendix/precalculus.mdx";
import PHYSICS from "./demos/appendix/physics.mdx";
import GEOMETRY from "./demos/appendix/geometry.mdx";

import INDEX from "./demos/doc.main.mdx";
import TWINE from "./demos/doc.twine.mdx";
import VECTOR from "./demos/doc.vector.mdx";
import MATRIX from "./demos/doc.matrix.mdx";
import CAM from "./demos/doc.cam.mdx";
import GRAPHICS from "./demos/doc.graphics.mdx";

import { MainPage } from "./MDXSchema.js";
import { BaseComponents } from "./MDXSchema.js";
import app from "./styles/app.module.scss";
import { ReactNode } from "react";
import { TopScroll } from "./hooks/TopScroll";

const MAIN = () => (
  <MainPage>
    <INDEX />
  </MainPage>
);

const NOTE = ({ children }: { children: ReactNode }) => {
  return (
    <div className={app.note}>
      {children}
    </div>
  );
};

type LinkEntry = {
  path: string;
  title: string;
  visible: boolean;
  page: JSX.Element;
  // doc?: boolean;
  note?: boolean;
};

const noteLinks: LinkEntry[] = [
  {
    title: "Number Theory",
    path: "/elementary-number-theory",
    visible: false,
    page: <NUMBER_THEORY />,
  },
  {
    title: "Elementary Geometry",
    path: "/geometry",
    visible: false,
    page: <GEOMETRY />,
  },
  {
    title: "Set Theory",
    path: "/set-theory",
    visible: false,
    page: <SET_THEORY />,
  },
  {
    title: "Writing Mathematics",
    path: "/exposition",
    visible: false,
    page: <EXPOSITION />,
  },
  {
    title: "Precalculus",
    path: "/precalculus",
    visible: false,
    page: <PRECALCULUS />,
  },
  {
    title: "Physics",
    path: "/physics",
    visible: false,
    page: <PHYSICS />,
  },
].map((note: LinkEntry) => {
  note.note = true;
  return note;
});

export const docLinks: LinkEntry[] = [
  { title: "Intro", path: "/", visible: true, page: <MAIN /> },
  { title: "Graphics", path: "/graphics", visible: true, page: <GRAPHICS /> },
  { title: "Algebra", path: "/cam", visible: true, page: <CAM /> },
  { title: "Matrix", path: "/matrix", visible: true, page: <MATRIX /> },
  { title: "Vector", path: "/vector", visible: true, page: <VECTOR /> },
  { title: "Twine", path: "/twine", visible: true, page: <TWINE /> },
  { title: "Appendix", path: "/appendix", visible: true, page: <BG /> },
  ...noteLinks,
];

export const Main = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Page />}>
          {docLinks.map((link) => (
            <Route
              path={link.path}
              element={link.note ? <NOTE>{link.page}</NOTE> : link.page}
              key={link.path}
            />
          ))}
          <Route path={"/tangle"} element={<TWINE />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

const pageVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  },
};

const pageTransition = {
  type: "tween",
  ease: "linear",
  duration: 0.5,
};
import { motion } from "framer-motion";
function AnimationLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <motion.div
      key={pathname}
      initial={"initial"}
      animate={"in"}
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}

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
      <AnimationLayout>
        <main>
          <BaseComponents>
            <article className={app.page}>
              <Outlet />
              <footer>Ketib Oldiais | &copy; 2023</footer>
            </article>
          </BaseComponents>
        </main>
      </AnimationLayout>
      <TopScroll />
    </div>
  );
}
