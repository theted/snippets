/* eslint-disable max-len */
import React, { useContext } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
// import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
// import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';

// import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {
  a11yLight, agate, anOldHope, androidstudio, arduinoLight, arta, ascetic, atelierCaveDark, atelierCaveLight, atelierDuneDark, atelierDuneLight, atelierEstuaryDark, atelierEstuaryLight, atelierForestDark, atelierForestLight, atelierHeathDark, atelierHeathLight, atelierLakesideDark, atelierLakesideLight, atelierPlateauDark, atelierPlateauLight, atelierSavannaDark, atelierSavannaLight, atelierSeasideDark, atelierSeasideLight, atelierSulphurpoolDark, atelierSulphurpoolLight, atomOneDark, atomOneDarkReasonable, atomOneLight, brownPaper, codepenEmbed, colorBrewer, darcula, dark, defaultStyle, docco, dracula, far, foundation, github, githubGist, gml, googlecode, gradientDark, gradientLight, grayscale, gruvboxDark, gruvboxLight, hopscotch, hybrid, idea, irBlack, isblEditorDark, isblEditorLight, kimbieDark, kimbieLight, lightfair, lioshi, magula, monoBlue, monokai, monokaiSublime, nightOwl, nnfx, nnfxDark, nord, obsidian, ocean, paraisoDark, paraisoLight, pojoaque, purebasic, qtcreatorDark, qtcreatorLight, railscasts, rainbow, routeros, schoolBook, shadesOfPurple, solarizedDark, solarizedLight, srcery, stackoverflowDark, stackoverflowLight, sunburst, tomorrow, tomorrowNight, tomorrowNightBlue, tomorrowNightBright, tomorrowNightEighties, vs, vs2015, xcode, xt256, zenburn,
} from 'react-syntax-highlighter/dist/esm/styles/hljs';

// ...

import { ThemeContext } from '../contexts/themeContext';
import { Snippet as ISnippet } from '../types';
import { capitalize } from '../utils/helpers';

// setup languages
// SyntaxHighlighter.registerLanguage('javascript', js);

type Props = ISnippet & {
  onDelete: any; // () => void;
  onEdit: any; // () => void;
  theme: string;
}

const allStyles = {
  a11yLight, agate, anOldHope, androidstudio, arduinoLight, arta, ascetic, atelierCaveDark, atelierCaveLight, atelierDuneDark, atelierDuneLight, atelierEstuaryDark, atelierEstuaryLight, atelierForestDark, atelierForestLight, atelierHeathDark, atelierHeathLight, atelierLakesideDark, atelierLakesideLight, atelierPlateauDark, atelierPlateauLight, atelierSavannaDark, atelierSavannaLight, atelierSeasideDark, atelierSeasideLight, atelierSulphurpoolDark, atelierSulphurpoolLight, atomOneDark, atomOneDarkReasonable, atomOneLight, brownPaper, codepenEmbed, colorBrewer, darcula, dark, defaultStyle, docco, dracula, far, foundation, github, githubGist, gml, googlecode, gradientDark, gradientLight, grayscale, gruvboxDark, gruvboxLight, hopscotch, hybrid, idea, irBlack, isblEditorDark, isblEditorLight, kimbieDark, kimbieLight, lightfair, lioshi, magula, monoBlue, monokai, monokaiSublime, nightOwl, nnfx, nnfxDark, nord, obsidian, ocean, paraisoDark, paraisoLight, pojoaque, purebasic, qtcreatorDark, qtcreatorLight, railscasts, rainbow, routeros, schoolBook, shadesOfPurple, solarizedDark, solarizedLight, srcery, stackoverflowDark, stackoverflowLight, sunburst, tomorrow, tomorrowNight, tomorrowNightBlue, tomorrowNightBright, tomorrowNightEighties, vs, vs2015, xcode, xt256, zenburn,
};

const classes = {
  container: 'm-12 group relative rounded-xl',
  heading: 'py-3 relative text-white',
  title: 'text-3xl',
  code: 'text-xl',
  language: 'absolute right-6 bottom-6',
  controls: 'absolute bottom-0 right-0 text-white p-4 transition duration-300 opacity-0 group-hover:opacity-100',
};

const customStyle = {
  padding: '2.5em',
  borderRadius: '12px',
  transition: 'all 300ms',
  boxShadow: 'inset 0 -5em 3em rgba(0,0,0,0.05)',
};

const Snippet: React.FC<Props> = ({
  id,
  title = '',
  content = '',
  description = '',
  language,
  onDelete,
  onEdit,
  theme,
}) => {
  const { showLineNumbers } = useContext(ThemeContext);

  return (
    <div className={classes.container}>
      <div className={classes.heading}>
        <h3 className={classes.title}>{capitalize(title)}</h3>
        <p>{description}</p>
        <span className={classes.language}>{language}</span>
      </div>
      <div className={classes.code}>
        <SyntaxHighlighter
          language={language || 'javascript'}
          style={allStyles[theme]}
          customStyle={customStyle}
          showLineNumbers={showLineNumbers}
          wrapLongLines
        >
          {content}
        </SyntaxHighlighter>
      </div>
      <div className={classes.controls}>
        <button
          type="button"
          onClick={() => onDelete(id)}
          className="mr-3"
        >
          <i className="icon-trash" />
          {' '}
          Delete
        </button>
        <button
          type="button"
          onClick={() => onEdit(id)}
          className="mr-3"
        >
          <i className="icon-pencil" />
          {' '}
          Edit
        </button>
      </div>
    </div>
  );
};

export default Snippet;
