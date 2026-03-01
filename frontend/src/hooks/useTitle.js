import { useEffect } from 'react';

const useTitle = (title) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = `${title} | DPL-Shop`; // Добавляем название магазина к заголовку
    
    // Возвращаем предыдущий заголовок при размонтировании компонента
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
};

export default useTitle;
