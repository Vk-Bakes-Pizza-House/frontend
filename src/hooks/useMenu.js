import { useState, useEffect } from 'react';

const useMenu = () => {
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    // Fetch menu from API
    // setMenu(data);
  }, []);

  return menu;
};

export default useMenu;