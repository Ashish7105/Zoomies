"use client";

export default function LoginCard({children}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-cream">

    <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-200 text-center w-80">

      <img
        src="/logo.png"
        alt="Login Image"
        className="w-40 mx-auto mb-6"
      />
      {children}

     
    </div>
    </div>
  );
}
