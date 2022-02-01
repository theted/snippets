import React, { useContext, useState } from 'react';
import { ThemeContext } from '../contexts/themeContext';
import { THEMES } from '../config';
import Dropdown from '../components/Dropdown';
import Modal from '../components/Modal';
import Box from '../components/Box';

const options = THEMES.map((lang) => ({ label: lang, value: lang }));

const Preferences: any = () => {
  const {
    showLineNumbers, setLineNumbers, setTheme,
  } = useContext(ThemeContext);

  const [localShowLineNumbers, setLocalShowLineNumbers] = useState<boolean>(showLineNumbers);

  const [showPreferences, setShowPreferences] = useState<boolean>(false);

  const toggleShowLineNumbers = () => {
    setLocalShowLineNumbers(!localShowLineNumbers);
    setLineNumbers(localShowLineNumbers);
  };

  const setThemeCallback = (e: any) => {
    const { target: { value } } = e;
    setTheme(value);
  };

  const toggleShow = () => {
    setShowPreferences(!showPreferences);
  };

  if (!showPreferences) {
    return (
      <div>
        <button type="button" onClick={toggleShow} className="text-white">
          <i className="demo-icon icon-cog" />
          {' '}
          Preferences
        </button>
      </div>
    );
  }

  return (
    <Modal closeModal={() => { setShowPreferences(false); }}>
      <Box title="Preferences">
        <input
          name="showLineNumbers"
          type="checkbox"
          checked={localShowLineNumbers}
          onChange={toggleShowLineNumbers}
        />
        {' '}
        show line numbers

        <Dropdown
          options={options}
          name="theme"
          onChange={setThemeCallback}
        />

        <button type="button" onClick={toggleShow}>Hide preferences</button>
      </Box>
    </Modal>
  );
};

export default Preferences;
