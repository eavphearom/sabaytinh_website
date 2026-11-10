import ButtonLoading from "./ButtonLoading";

export default function Button({
  children,
  type = "button",
  variant = "primary",
  loading = false,
  disabled = false,
  onClick,
  className = "",
  
}) {
  const variants = {
    primary: "bg-[#2E7AF0] text-white hover:bg-[#1F66D8]",
    secondary:
      "border border-[#D7DFEA] bg-white text-[#03152B] hover:bg-[#F7F9FC]",
    warning: "bg-amber-50 text-amber-700 hover:bg-amber-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`
        inline-flex items-center cursor-pointer justify-center rounded-lg px-4 py-2 text-sm font-semibold
        transition
        disabled:cursor-not-allowed disabled:opacity-50
        ${variants[variant]}
        ${className}
      `}
    >
      {loading ? <ButtonLoading>{children}</ButtonLoading> : children}
    </button>
  );
}
