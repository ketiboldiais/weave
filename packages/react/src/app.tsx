import { Pages } from "./pages.js";
import css from './styles/app.module.scss';
import "./index.css";

export const App = () => {
  return (
    <div className={css.app}>
      <Pages />
    </div>
  );
};
