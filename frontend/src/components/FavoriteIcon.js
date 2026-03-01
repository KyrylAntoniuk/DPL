import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAddFavoriteMutation, useRemoveFavoriteMutation } from '../redux/api/usersApiSlice';
import { updateFavorites } from '../redux/slices/authSlice';

const FavoriteIcon = ({ productId }) => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const isFavorite = userInfo?.favorites?.some(fav => fav._id === productId);

  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();

  const toggleFavoriteHandler = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userInfo) {
      toast.info('Please login to add to favorites');
      return;
    }

    try {
      let updatedFavorites;
      if (isFavorite) {
        updatedFavorites = await removeFavorite(productId).unwrap();
      } else {
        updatedFavorites = await addFavorite(productId).unwrap();
      }
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
