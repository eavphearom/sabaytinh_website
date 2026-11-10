import { Camera, RotateCcw, Save } from "lucide-react";
import Input from "../../components/ui/Input";

const inputClass = "mt-2 h-11 rounded-xl border-[#E5EAF0] bg-[#FAFBFC] px-4 text-sm text-[#07182E] focus:border-[#E96400] focus:ring-[#E96400]/10";

export default function Profile() {
  return (
    <div className="rounded-2xl border border-[#E6EAF0] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.04)] sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#E96400]">Profile</p>
        <h1 className="mt-3 font-michroma text-2xl font-semibold text-[#07182E] sm:text-3xl">Edit Profile</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#64748B]">
          Keep your personal details up to date for faster checkout and order updates.
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-4 rounded-2xl bg-[#F8FAFC] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF3E8] text-xl font-semibold text-[#E96400]">
            BH
          </div>
          <div>
            <p className="text-sm font-semibold text-[#07182E]">Profile photo</p>
            <p className="mt-1 text-xs font-medium text-[#64748B]">PNG or JPG up to 2MB.</p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-fit cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#E5EAF0] bg-white px-4 text-sm font-semibold text-[#07182E] transition hover:border-[#E96400] hover:text-[#E96400]"
        >
          <Camera size={16} />
          Change Image
        </button>
      </div>

      <form className="mt-7 grid gap-4 md:grid-cols-2">
        {/* <Input name="firstName" label="First Name" defaultValue="Bun" className={inputClass} />
        <Input name="lastName" label="Last Name" defaultValue="Heng" className={inputClass} /> */}
        <Input name="username" label="Username" defaultValue="bunheng" className={inputClass} />
        <Input name="email" type="email" label="Email" defaultValue="bunheng@example.com" disabled className={`${inputClass} disabled:bg-[#EEF2F6] disabled:text-[#94A3B8]`} />
        <Input name="phone" label="Phone" defaultValue="096 5231 272" className={inputClass} />

        <div className="flex flex-col gap-3 pt-2 sm:flex-row md:col-span-2">
          <button
            type="button"
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#E96400] px-5 text-sm font-semibold text-white transition hover:bg-[#C95500]"
          >
            <Save size={16} />
            Save Changes
          </button>
          <button
            type="reset"
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#E5EAF0] bg-white px-5 text-sm font-semibold text-[#07182E] transition hover:border-[#E96400] hover:text-[#E96400]"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
