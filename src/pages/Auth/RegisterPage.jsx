import { startGoogleLogin } from "../../services/googleLogin";
import authService from "../../services/authService";
import { safeReturnPath } from "../../services/authSession";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import googleIcon from "../../assets/google.png";
import heroShoe from "../../assets/welcome_page/first_page.png";
import Button from "../../components/ui/Button";

function AuthInput({
  label,
  icon: Icon,
  type = "text",
  rightAction,
  helperText,
  ...props
}) {
  return (
    <label className="block text-sm font-medium text-[#202e40]">
      {label}
      <span className="relative mt-2 block">
        <Icon
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A98AA]"
        />
        <input
          type={type}
          className="h-12 w-full rounded-xl border border-[#E5EAF0] bg-[#FAFBFC] pl-11 pr-12 text-sm text-[#202e40] outline-none transition placeholder:text-[#9AA6B5] focus:border-[#E96400] focus:bg-white focus:ring-4 focus:ring-[#E96400]/10"
          {...props}
        />
        {rightAction}
      </span>
      {helperText && (
        <span className="mt-1.5 block text-[11px] font-semibold text-[#64748B]">
          {helperText}
        </span>
      )}
    </label>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const returnTo = safeReturnPath(location.state?.from);
  const handleGoogle = async () => {
    if (loading) return;
    setLoading(true); setError("");
    try { await startGoogleLogin(authService.startGoogle, returnTo); }
    catch (error) { setError(error.response?.data?.message || error.message || "Unable to start Google login."); setLoading(false); }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (!form.acceptedTerms) { setError("Please accept the terms to continue."); return; }
    setLoading(true); setError("");
    try {
      await authService.register({ username: form.username.trim(), email: form.email.trim(), password: form.password, phone: form.phone.trim() });
      navigate("/login", { replace: true, state: { from: returnTo, message: "Account created. Sign in to continue." } });
    } catch (error) { setError(error.response?.data?.message || error.message || "Unable to create your account."); }
    finally { setLoading(false); }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7F4EF] px-4 py-8 sm:px-6">
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#FFE0C8]" />
      <div className="absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-[#E96400]/10" />

      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden bg-[#ff9b65] p-8 lg:block">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to store
          </Link>

          <div className="mt-12">
            <p className="font-michroma text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#e1e0de]">
              Go Shoes
            </p>
            <h1 className="mt-4 max-w-sm font-michroma text-3xl font-extrabold leading-tight text-white">
              Create your step-ready account.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/65">
              Save favorites, check out faster, and keep every new pair within
              easy reach.
            </p>
          </div>

          <div className="absolute bottom-6 left-6 right-6 rounded-3xl p-2">
            <img
              src={heroShoe}
              alt="Featured shoe"
              className="mx-auto w-full object-contain  drop-shadow-[0_30px_40px_rgba(0,0,0,0.3)]"
            />
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#64748B] transition hover:text-[#E96400] lg:hidden"
          >
            <ArrowLeft size={16} />
            Back to store
          </Link>

          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 text-center sm:text-left">
              <p className="font-michroma text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#E96400]">
                Join Go Shoes
              </p>
              <h2 className="mt-4 font-michroma text-3xl font-extrabold text-[#07182E]">
                Create account
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#64748B]">
                Start saving your favorite styles today.
              </p>
            </div>

            <button
              onClick={handleGoogle}
              disabled={loading}
              type="button"
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#E5EAF0] bg-white text-sm font-semibold text-[#07182E] transition hover:border-[#F8C9A5] hover:bg-[#FFF8F2]"
            >
              <img src={googleIcon} alt="" className="h-5 w-5 object-contain" />
              Sign up with Google
            </button>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#E5EAF0]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
                Or use email
              </span>
              <div className="h-px flex-1 bg-[#E5EAF0]" />
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5">
              {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
              <AuthInput
                label="Username"
                icon={User}
                name="username" required
                placeholder="Your username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />

              <AuthInput
                label="Email Address"
                icon={Mail}
                name="email" required
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />

              <AuthInput label="Phone" icon={User} name="phone" type="tel" required
                value={form.phone} onChange={handleChange} autoComplete="tel" placeholder="012345678" />

              <AuthInput
                label="Password"
                icon={LockKeyhole}
                name="password" required minLength={6}
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                helperText="Use at least 6 characters."
                rightAction={
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A98AA] transition hover:text-[#07182E]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              <AuthInput
                label="Confirm Password"
                icon={LockKeyhole}
                name="confirmPassword" required minLength={6}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                rightAction={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A98AA] transition hover:text-[#07182E]"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              <label className="flex items-start gap-3 text-xs leading-5 text-[#64748B]">
                <input
                  name="acceptedTerms"
                  type="checkbox"
                  checked={form.acceptedTerms}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-[#CBD5E1] accent-[#E96400]"
                />
                <span>
                  I agree to the{" "}
                  <button type="button" className="font-semibold text-[#E96400]">
                    Terms & Conditions
                  </button>{" "}
                  and{" "}
                  <button type="button" className="font-semibold text-[#E96400]">
                    Privacy Policy
                  </button>
                  .
                </span>
              </label>

              <Button
                type="submit"
                loading={loading}
                disabled={!form.acceptedTerms}
                className="h-12 w-full rounded-xl bg-[#E96400] text-white hover:bg-[#C95500]"
              >
                Create Account
              </Button>
            </form>

            <p className="mt-7 text-center text-sm text-[#64748B]">
              Already have an account?{" "}
              <Link
                to="/login"
                state={{ from: returnTo }}
                className="font-semibold text-[#E96400] transition hover:text-[#C95500]"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
