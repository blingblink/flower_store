'use client'
import { signOut } from "next-auth/react"
// import { useRouter } from "next/navigation";

const LogOutSection = ({ user }) => {
  // const router = useRouter();
  if (!user) return;

  const onSubmit = async () => {
    signOut({ callbackUrl: '/' });
  }

  return (
    <div>
      <h2 className="text-base font-semibold leading-7 text-gray-900">Hành động</h2>

      <div className="mt-6 flex">
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={onSubmit}
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

export default LogOutSection;