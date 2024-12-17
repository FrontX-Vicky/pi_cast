import React, { createContext, useState } from 'react';

// Create the context
export const SearchContext = createContext();

let globalSearchValue = ''; // Global variable for outside functions

export const SearchProvider = ({ children }) => {
  const [inputValue, setInputValue] = useState('');

  const setSharedProcessedValue = (value) => {
    setInputValue(value);
    globalSearchValue = value; // Update global value
  };

  return (
    <SearchContext.Provider value={{ inputValue, setSharedProcessedValue }}>
      {children}
    </SearchContext.Provider>
  );
};

// Export the global variable getter
export const getSearchValue = () => globalSearchValue;
