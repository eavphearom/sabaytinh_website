import useScrollReveal from "../../hooks/useScrollReveal";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import useShopping from "../../hooks/useShopping";
import FavoriteButton from "../../components/product/FavoriteButton";
import useProductDetail from "../../hooks/useProductDetail";

function available(stock, status) {
  const normalized = String(status || "")
    .toUpperCase()
    .replaceAll(" ", "_");
  return Number(stock) > 0 && normalized !== "OUT_OF_STOCK";
}

function VariantDetails({ product, variant, variants, onVariantChange }) {
  const { addToCart } = useShopping();
  const [cartMessage, setCartMessage] = useState("");
  const images = [...(variant?.images ?? [])].sort(
    (a, b) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)),
  );
  const sizes = variant?.stock ?? variant?.sizes ?? [];
  const inStock = available(variant?.total_stock, variant?.stock_status);
  const firstSize = sizes.find((size) =>
    available(size.qty, size.stock_status),
  );
  const [selectedSizeId, setSelectedSizeId] = useState(
    firstSize?.size_id ?? null,
  );
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const selectedSize = sizes.find((size) => size.size_id === selectedSizeId);
  const stock =
    inStock &&
    selectedSize &&
    available(selectedSize.qty, selectedSize.stock_status)
      ? Math.min(Number(selectedSize.qty), Number(variant.total_stock))
      : 0;
  const selectedImage = images[imageIndex];
  const moveImage = (direction) =>
    setImageIndex(
      (index) => (index + direction + images.length) % images.length,
    );

  return (
    <section className="mt-5 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div data-scroll-reveal="left">
        <div className="relative overflow-hidden rounded-lg bg-[#F7F8FA]">
          <FavoriteButton
            product={{
              ...product,
              price: variant?.price,
              image: images[0]?.image,
            }}
            className="absolute right-4 top-4 z-10 rounded-full bg-white p-3 text-[#64748B]"
          />
          {selectedImage ? (
            <img
              src={selectedImage.image}
              alt={product.name + " - " + variant.color_name}
              className="h-[320px] w-full object-contain p-8 sm:h-[420px] lg:h-[500px]"
            />
          ) : (
            <div className="flex h-[320px] items-center justify-center text-sm text-[#64748B] sm:h-[420px] lg:h-[500px]">
              No image available
            </div>
          )}
        </div>
        {images.length > 0 && (
          <div className="mt-5 flex items-center gap-4">
            <button
              type="button"
              onClick={() => moveImage(-1)}
              disabled={images.length < 2}
              className="rounded-full p-2 disabled:opacity-30"
              aria-label="Previous product image"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex min-w-0 flex-1 gap-3 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={image.id ?? image.image}
                  type="button"
                  onClick={() => setImageIndex(index)}
                  aria-label={"View product image " + (index + 1)}
                  aria-pressed={imageIndex === index}
                  className={
                    "h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-[#F7F8FA] p-1.5 sm:h-24 sm:w-24 " +
                    (imageIndex === index
                      ? "border-[#E96400]"
                      : "border-transparent")
                  }
                >
                  <img
                    src={image.image}
                    alt={product.name + " image " + (index + 1)}
                    className="h-full w-full object-contain"
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => moveImage(1)}
              disabled={images.length < 2}
              className="rounded-full p-2 disabled:opacity-30"
              aria-label="Next product image"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
      <div data-scroll-reveal="right" className="lg:pt-1">
        <p className="font-michroma text-xs font-semibold uppercase tracking-wide text-[#E96400]">
          {product.brand_name}
        </p>
        <h1 className="mt-1 font-michroma text-2xl leading-tight text-[#07182E] sm:text-4xl">
          {product.name}
        </h1>
        <p className="mt-2 text-sm font-semibold text-[#64748B]">
          {product.category_name}
        </p>
        <p
          className="mt-4 text-2xl font-black text-[#E96400]"
          aria-live="polite"
        >
          {variant?.price != null
            ? "$" + Number(variant.price).toFixed(2)
            : "Price unavailable"}
        </p>
        {product.description && (
          <p className="mt-4 whitespace-pre-line break-words text-sm leading-6 text-[#475569]">
            {product.description}
          </p>
        )}

        <div className="mt-6 border-t border-[#EEF2F7] pt-5">
          <p className="font-michroma text-sm text-[#07182E]">
            Color: {variant?.color_name ?? "Unavailable"}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {variants.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onVariantChange(item.id)}
                aria-label={"Select " + item.color_name}
                aria-pressed={variant?.id === item.id}
                title={item.color_name}
                style={{ backgroundColor: item.color_hex || "#E5E7EB" }}
                className={
                  "h-8 w-8 cursor-pointer rounded-full border border-[#D1D5DB] ring-2 ring-white " +
                  (variant?.id === item.id
                    ? "outline outline-2 outline-[#E96400]"
                    : "")
                }
              />
            ))}
          </div>
        </div>
        <div className="mt-5">
          <p className="font-michroma text-sm text-[#07182E]">Size</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {sizes.map((size) => (
              <button
                key={size.size_id}
                type="button"
                disabled={!inStock || !available(size.qty, size.stock_status)}
                onClick={() => {
                  setSelectedSizeId(size.size_id);
                  setQuantity(1);
                  setCartMessage("");
                }}
                aria-pressed={selectedSizeId === size.size_id}
                className={
                  "h-10 min-w-10 cursor-pointer rounded-md border px-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-35 disabled:line-through " +
                  (selectedSizeId === size.size_id
                    ? "border-[#E96400] bg-[#FFF5ED] text-[#E96400]"
                    : "border-[#E6EAF0] text-[#475569]")
                }
              >
                {size.size}
              </button>
            ))}
            {sizes.length === 0 && (
              <p className="text-sm text-[#64748B]">
                No sizes available for this color.
              </p>
            )}
          </div>
          <p
            role="status"
            className={
              "mt-4 text-sm font-medium " +
              (stock > 0 ? "text-green-600" : "text-red-500")
            }
          >
            {stock > 0
              ? "In Stock - " +
                stock +
                " available in size " +
                selectedSize.size
              : "Out of stock"}
          </p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="flex h-11 items-center justify-between rounded-md bg-[#F4F6F8] px-3">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              disabled={quantity <= 1 || stock === 0}
              className="disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span className="text-sm font-extrabold text-[#07182E]">
              {stock > 0 ? quantity : 0}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.min(stock, value + 1))}
              disabled={quantity >= stock}
              className="disabled:opacity-30"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            type="button"
            disabled={stock === 0}
            onClick={() => {
              try {
                addToCart(product, variant, selectedSize, quantity);
                setCartMessage("Added to cart.");
                toast.success("Added to cart.");
              } catch (error) {
                setCartMessage(error.message);
                toast.error(error.message);
              }
            }}
            className="flex h-11 items-center justify-center gap-2 rounded-md bg-[#E96400] text-sm font-extrabold text-white transition hover:bg-[#C95500] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingCart size={17} /> Add to Cart
          </button>
        </div>
        {cartMessage && (
          <p role="status" className="mt-3 text-sm text-[#475569]">
            {cartMessage}{" "}
            <Link to="/cart" className="text-[#E96400] underline">
              View cart
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}

function ProductContent({ product }) {
  const variants = product.variants ?? [];
  const [variantId, setVariantId] = useState(
    (variants.find((item) => item.is_default) ?? variants[0])?.id,
  );
  const variant = variants.find((item) => item.id === variantId);
  return (
    <>
      <nav
        className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#94A3B8]"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="hover:text-[#E96400]">
          Home
        </Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-[#E96400]">
          Shop
        </Link>
        <span>/</span>
        {product.category_name && (
          <>
            <span>{product.category_name}</span>
            <span>/</span>
          </>
        )}
        <span className="text-[#07182E]">{product.name}</span>
      </nav>
      <VariantDetails
        key={variant?.id ?? "empty"}
        product={product}
        variant={variant}
        variants={variants}
        onVariantChange={setVariantId}
      />
    </>
  );
}

export default function ProductDetail() {
  const revealRef = useScrollReveal();
  const { id } = useParams();
  const { product, loading, error, retry } = useProductDetail(id);
  return (
    <main ref={revealRef} className="bg-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        {loading ? (
          <p role="status" className="py-16 text-center text-[#64748B]">
            Loading product...
          </p>
        ) : error ? (
          <div className="py-16 text-center">
            <p role="alert" className="text-red-500">
              {error}
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 rounded-md bg-[#E96400] px-4 py-2 text-white"
            >
              Try again
            </button>
            <Link to="/shop" className="ml-4 text-[#E96400]">
              Back to shop
            </Link>
          </div>
        ) : (
          product && <ProductContent key={product.id} product={product} />
        )}
      </div>
    </main>
  );
}
