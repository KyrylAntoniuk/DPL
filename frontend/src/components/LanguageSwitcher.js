import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavDropdown } from 'react-bootstrap';
import { FaGlobe } from 'react-icons/fa';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <NavDropdown 
      title={<span><FaGlobe /> {i18n.language === 'uk' ? 'UA' : 'EN'}</span>} // Исправлено UK на UA
      id="language-switcher"
    >
      <NavDropdown.Item onClick={() => changeLanguage('en')}>English</NavDropdown.Item>
      <NavDropdown.Item onClick={() => changeLanguage('uk')}>Українська</NavDropdown.Item>
    </NavDropdown>
  );
};

export default LanguageSwitcher;
