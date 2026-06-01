
import React from 'react'

const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className='relative min-h-screen overflow-hidden w-full flex justify-center pt-24 pb-12'>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout