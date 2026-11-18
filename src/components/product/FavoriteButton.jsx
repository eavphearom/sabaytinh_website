import { Heart } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import useShopping from "../../hooks/useShopping";

export default function FavoriteButton({ product, className = "" }) {
  const { favorites, toggleFavorite } = useShopping();
  const [error, setError] = useState("");
  const saved = favorites.some((item) => String(item.id) === String(product.id));
  return <>
    <button type="button" disabled={product.id == null} className={className}
      aria-pressed={saved} aria-label={`${saved ? "Remove" : "Add"} ${product.name} ${saved ? "from" : "to"} wishlist`}
      onClick={() => {
        try {
          toggleFavorite(product);
          setError("");
          toast.success(saved ? "Removed from wishlist." : "Added to wishlist.");
        } catch (error) {
          setError(error.message);
          toast.error(error.message);
        }
      }}>
      <Heart size={18} className={saved ? "fill-red-500 text-red-500" : ""} />
    </button>
    {error && <span role="alert" className="text-xs text-red-500">{error}</span>}
  </>;
}
