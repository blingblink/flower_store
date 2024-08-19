'use client'

import useSWR from "swr";

import UserInfoSection from './UserInfoSection';
import AddressSection from './AddressSection';
import ResetPasswordSection from './ResetPasswordSection';
import LogOutSection from './LogOutSection';


async function getUser(url) {
  const res = await fetch(url);
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
 
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
  }
 
  return res.json();
}

export default function UserProfilePage() {
  const { data: user } = useSWR("/api/users/me", getUser);

  return (
    <>
      <div className="mx-auto max-w-4xl lg:flex lg:gap-x-16 lg:px-8">
        <main className="px-4 py-16 sm:px-6 lg:flex-auto lg:px-0 lg:py-20">
          <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
            <UserInfoSection user={user} />
            <AddressSection user={user} />
            <ResetPasswordSection user={user} />
            <LogOutSection user={user} />
          </div>
        </main>
      </div>
    </>
  )
}
