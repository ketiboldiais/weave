import { Pages } from "./pages.js";
import css from './styles/app.module.scss';

export const App = () => {
  return (
    <div className={css.app}>
      <Pages />
    </div>
  );
};
