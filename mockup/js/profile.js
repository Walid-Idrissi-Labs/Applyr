const renderProfile = () => {
  return `
    <div class="max-w-4xl mx-auto pb-10 transition-colors duration-300">
      <h2 class="text-[20px] border-b-2 border-[#111] dark:border-gray-800 pb-3 mb-6 font-bold flex items-center gap-2 dark:text-white">
        <i data-lucide="user" class="w-5 h-5"></i> My Profile
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div class="space-y-6">
          <div class="border-2 border-[#111] dark:border-gray-800 rounded-xl bg-white dark:bg-[#111] p-6 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
            <h3 class="font-bold border-b-2 border-gray-100 dark:border-gray-800 pb-2 mb-4 text-[14px] dark:text-gray-200">Personal Information</h3>
            <div class="space-y-4">
              <div class="flex flex-col gap-1.5">
                <label class="font-bold text-gray-600 dark:text-gray-400 text-[12px]">Full Name</label>
                <input type="text" value="John Doe" class="border-2 border-[#111] dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#111] dark:focus:ring-gray-500 bg-white dark:bg-[#0a0a0a] dark:text-white" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="font-bold text-gray-600 dark:text-gray-400 text-[12px]">Email Address</label>
                <input type="email" value="john.doe@example.com" class="border-2 border-[#111] dark:border-gray-700 rounded-md p-2 bg-gray-50 dark:bg-gray-800 text-gray-500 cursor-not-allowed" readonly />
              </div>
              <button class="border-2 border-[#111] dark:border-gray-700 rounded-md bg-[#111] dark:bg-white text-white dark:text-[#111] px-4 py-2 font-bold hover:bg-white dark:hover:bg-[#eee] hover:text-[#111] transition-colors mt-2 w-full shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px]">
                Update
              </button>
            </div>
          </div>

          <div class="border-2 border-[#111] dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#111] p-6">
            <h3 class="font-bold border-b-2 border-gray-200 dark:border-gray-800 pb-2 mb-4 text-[14px] dark:text-gray-200">Security</h3>
            <div class="space-y-3">
              <input type="password" placeholder="Current Password" class="w-full border-2 border-[#111] dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#111] dark:focus:ring-gray-500 bg-white dark:bg-[#0a0a0a] dark:text-white" />
              <input type="password" placeholder="New Password" class="w-full border-2 border-[#111] dark:border-gray-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#111] dark:focus:ring-gray-500 bg-white dark:bg-[#0a0a0a] dark:text-white" />
              <button class="border-2 border-[#111] dark:border-gray-700 rounded-md bg-white dark:bg-[#1a1a1a] text-[#111] dark:text-white px-4 py-2 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full mt-2">
                Change Password
              </button>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="border-2 border-[#111] dark:border-gray-800 rounded-xl bg-white dark:bg-[#111] p-6 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
            <h3 class="font-bold border-b-2 border-gray-100 dark:border-gray-800 pb-2 mb-4 text-[14px] dark:text-gray-200">Preferences</h3>
            <div class="space-y-4">
              <label class="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked class="mt-1 w-4 h-4 accent-[#111] dark:accent-white cursor-pointer" />
                <div>
                  <div class="font-bold group-hover:text-blue-600 dark:text-gray-200 transition-colors">Follow-up Email (D-1)</div>
                  <div class="text-[11px] text-gray-500 dark:text-gray-400">Receive a reminder the day before a deadline.</div>
                </div>
              </label>
              <label class="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked class="mt-1 w-4 h-4 accent-[#111] dark:accent-white cursor-pointer" />
                <div>
                  <div class="font-bold group-hover:text-blue-600 dark:text-gray-200 transition-colors">Weekly Summary</div>
                  <div class="text-[11px] text-gray-500 dark:text-gray-400">A status report via email every Monday.</div>
                </div>
              </label>
            </div>
          </div>

          <div class="border-2 border-dashed border-red-400 dark:border-red-900 rounded-xl bg-red-50 dark:bg-red-900/10 p-6">
            <h3 class="font-bold border-b-2 border-red-200 dark:border-red-900 text-red-600 dark:text-red-500 pb-2 mb-4 text-[14px]">Danger Zone</h3>
            <div class="space-y-3">
              <button class="w-full border-2 border-[#111] dark:border-gray-700 rounded-md bg-white dark:bg-[#1a1a1a] dark:text-white px-4 py-2 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center gap-2 transition-colors">
                <i data-lucide="download" class="w-4 h-4"></i> Export my data
              </button>
              <button class="w-full border-2 border-red-600 dark:border-red-900 rounded-md bg-red-600 dark:bg-red-900/50 text-white px-4 py-2 font-bold hover:bg-white dark:hover:bg-red-900 hover:text-red-600 transition-colors flex items-center justify-center gap-2">
                <i data-lucide="trash-2" class="w-4 h-4"></i> Delete account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};
