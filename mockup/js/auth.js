const renderAuth = () => {
  return `
    <div class="min-h-screen bg-gray-100 dark:bg-[#0a0a0a] flex items-center justify-center p-4 transition-colors duration-300">
      <div class="w-full max-w-sm bg-white dark:bg-[#111] border-2 border-[#111] dark:border-gray-800 rounded-xl shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] flex flex-col overflow-hidden">
        <div class="bg-gray-50 dark:bg-[#1a1a1a] border-b-2 border-[#111] dark:border-gray-800 p-5 text-center shrink-0 flex justify-between items-center">
          <div class="w-8"></div>
          <h1 class="font-bold text-[22px] tracking-widest dark:text-white">Applyr</h1>
          <button onclick="toggleTheme()" class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <i data-lucide="${state.theme === 'light' ? 'moon' : 'sun'}" class="w-4 h-4 dark:text-white"></i>
          </button>
        </div>
        <div class="p-6">
          <h2 class="font-bold text-[16px] mb-6 text-center dark:text-gray-200">
            ${state.authMode === 'login' ? 'Sign In' : 'Create an Account'}
          </h2>
          <form onsubmit="handleAuth(event)">
            ${state.authMode === 'register' ? `
              <div class="mb-4">
                <label class="block font-bold mb-1 text-[12px] dark:text-gray-400">Full Name</label>
                <input required type="text" placeholder="John Doe" class="w-full border-2 border-[#111] dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#111] dark:focus:ring-gray-500 bg-white dark:bg-[#0a0a0a] dark:text-white" />
              </div>
            ` : ''}
            <div class="mb-4">
              <label class="block font-bold mb-1 text-[12px] dark:text-gray-400">Email Address</label>
              <input required type="email" placeholder="john@example.com" class="w-full border-2 border-[#111] dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#111] dark:focus:ring-gray-500 bg-white dark:bg-[#0a0a0a] dark:text-white" />
            </div>
            <div class="mb-6">
              <div class="flex justify-between items-center mb-1">
                <label class="font-bold text-[12px] dark:text-gray-400">Password</label>
                ${state.authMode === 'login' ? `<a href="#" class="text-[10px] text-gray-500 hover:text-[#111] dark:hover:text-white hover:underline">Forgot?</a>` : ''}
              </div>
              <input required type="password" placeholder="••••••••" class="w-full border-2 border-[#111] dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#111] dark:focus:ring-gray-500 bg-white dark:bg-[#0a0a0a] dark:text-white" />
            </div>
            <button type="submit" class="w-full border-2 border-[#111] dark:border-gray-700 rounded-md bg-[#111] dark:bg-white text-white dark:text-[#111] p-2.5 font-bold hover:bg-white dark:hover:bg-[#eee] hover:text-[#111] transition-colors shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px]">
              ${state.authMode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
          <div class="mt-6 text-center border-t border-dashed border-gray-300 dark:border-gray-800 pt-5">
            <p class="text-[11px] text-gray-500 mb-3">
              ${state.authMode === 'login' ? 'Don\'t have an account?' : 'Already have an account?'}
            </p>
            <button type="button" onclick="toggleAuthMode()" class="border-2 border-[#111] dark:border-gray-700 rounded-md bg-white dark:bg-[#1a1a1a] text-[#111] dark:text-white px-4 py-1.5 text-[11px] font-bold hover:bg-gray-50 dark:hover:bg-[#222] transition-colors shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px]">
              ${state.authMode === 'login' ? 'Create an account' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
};
