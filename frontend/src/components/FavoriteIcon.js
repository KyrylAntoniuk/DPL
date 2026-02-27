import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAddFavoriteMutation, useRemoveFavoriteMutation } from '../redux/api/usersApiSlice';
import { updateFavorites } from '../redux/slices/authSlice';

const FavoriteIcon = ({ productId }) => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  // Проверяем, есть ли товар в массиве избранного пользователя
  const isFavorite = userInfo?.favorites?.some(fav => fav._id === productId);

  const [addFavorite, { isLoading: isAdding }] = useAddFavoriteMutation();
  const [removeFavorite, { isLoading: isRemoving }] = useRemoveFavoriteMutation();

  const toggleFavoriteHandler = async (e) => {
    e.preventDefault(); // Предотвращаем переход по ссылке, если иконка внутри <Link>
    e.stopPropagation(); // Останавливаем всплытие события

    if (!userInfo) {
      toast.info('Пожалуйста, войдите в систему, чтобы добавлять в избранное');
      return;
    }

    try {
      let updatedFavorites;
      if (isFavorite) {
        updatedFavorites = await removeFavorite(productId).unwrap();
      } else {
        updatedFavorites = await addFavorite(productId).unwrap();
      }
      // Обновляем состояние в authSlice для мгновенного отклика UI
      dispatch(updateFavorites(updatedFavorites));
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div 
      className="favorite-icon" 
      onClick={toggleFavoriteHandler} 
      style={{ cursor: 'pointer', position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}
    >
      {isFavorite ? (
        <FaHeart size={24} color="red" />
      ) : (
        <FaRegHeart size={24} color="gray" />
      )}
    </div>
  );
};

export default FavoriteIcon;
