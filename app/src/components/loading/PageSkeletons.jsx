function Skeleton({ className = '' }) {
  return <div className={`loading-skeleton ${className}`} aria-hidden="true" />;
}

function Lines({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className={`h-3 ${index === count - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

function LoadingRegion({ children, label }) {
  return (
    <div role="status" aria-label={label} aria-busy="true">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <LoadingRegion label="Loading dashboard">
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-7 w-44" />
        <div className="space-y-2"><Skeleton className="h-6 w-64" /><Skeleton className="h-3 w-48" /></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[0, 1].map((item) => <div key={item} className="neu-card p-4 space-y-5"><Skeleton className="h-4 w-36" /><Lines /></div>)}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="neu-card p-4 space-y-3"><Skeleton className="h-3 w-20" /><Skeleton className="h-8 w-12" /></div>)}
        </div>
      </div>
    </LoadingRegion>
  );
}

export function ApplicationsSkeleton({ viewMode = 'list' }) {
  if (viewMode === 'board') {
    return (
      <LoadingRegion label="Loading applications">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }, (_, column) => <div key={column} className="neu-card p-4 space-y-4"><Skeleton className="h-4 w-24" />{Array.from({ length: 2 }, (_, card) => <div key={card} className="rounded-lg border-2 border-gray-200 dark:border-gray-800 p-3"><Lines count={2} /></div>)}</div>)}
        </div>
      </LoadingRegion>
    );
  }

  return (
    <LoadingRegion label="Loading applications">
      <div className="neu-card overflow-hidden">
        {Array.from({ length: 5 }, (_, row) => <div key={row} className="grid grid-cols-[1.3fr_1fr_.7fr] gap-5 border-b border-gray-100 dark:border-gray-800 p-4 last:border-0"><Lines count={2} /><Skeleton className="h-5 w-24" /><Skeleton className="h-4 w-20 justify-self-end" /></div>)}
      </div>
    </LoadingRegion>
  );
}

export function ApplicationDetailSkeleton() {
  return (
    <LoadingRegion label="Loading application details">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4"><Skeleton className="h-10 w-10" /><div className="space-y-2"><Skeleton className="h-6 w-56" /><Skeleton className="h-3 w-36" /></div></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="neu-card p-5 lg:col-span-2 space-y-5"><Skeleton className="h-4 w-36" /><Lines count={6} /></div>
          <div className="space-y-4">{Array.from({ length: 2 }, (_, index) => <div key={index} className="neu-card p-5 space-y-4"><Skeleton className="h-4 w-28" /><Lines /></div>)}</div>
        </div>
      </div>
    </LoadingRegion>
  );
}

export function ResumesSkeleton() {
  return (
    <LoadingRegion label="Loading resumes">
      <div className="space-y-6">
        <div className="neu-card p-6 grid grid-cols-1 lg:grid-cols-3 gap-7"><div className="space-y-4"><Skeleton className="h-5 w-44" /><Lines count={4} /></div><div className="lg:col-span-2"><Skeleton className="h-64 w-full" /></div></div>
        <Skeleton className="h-4 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{Array.from({ length: 3 }, (_, index) => <div key={index} className="neu-card p-5 space-y-4"><Skeleton className="h-5 w-36" /><Lines /></div>)}</div>
      </div>
    </LoadingRegion>
  );
}

export function NotificationsSkeleton() {
  return (
    <LoadingRegion label="Loading notifications">
      <div className="neu-card overflow-hidden">{Array.from({ length: 5 }, (_, index) => <div key={index} className="flex items-start gap-4 border-b border-gray-100 dark:border-gray-800 p-4 last:border-0"><Skeleton className="h-2 w-2 rounded-full mt-1" /><div className="flex-1"><Lines count={2} /></div></div>)}</div>
    </LoadingRegion>
  );
}

export function CompactListSkeleton() {
  return (
    <LoadingRegion label="Loading applications">
      <div className="space-y-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="rounded-lg border-2 border-gray-100 dark:border-gray-800 p-3"><Lines count={2} /></div>)}</div>
    </LoadingRegion>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <LoadingRegion label="Loading admin dashboard">
      <div className="max-w-5xl mx-auto space-y-6"><Skeleton className="h-7 w-56" /><div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="neu-card p-4 space-y-3"><Skeleton className="h-3 w-28" /><Skeleton className="h-8 w-20" /></div>)}</div><div className="neu-card p-4"><Skeleton className="h-64 w-full" /></div><div className="neu-card p-4"><Lines count={5} /></div></div>
    </LoadingRegion>
  );
}

export function UsersSkeleton() {
  return (
    <LoadingRegion label="Loading users">
      <div className="max-w-5xl mx-auto space-y-5"><Skeleton className="h-7 w-48" /><Skeleton className="h-10 w-full" /><div className="neu-card overflow-hidden">{Array.from({ length: 6 }, (_, row) => <div key={row} className="grid grid-cols-[1fr_1.4fr_.5fr] gap-5 border-b border-gray-100 dark:border-gray-800 p-4 last:border-0"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-48" /><Skeleton className="h-5 w-16 justify-self-end" /></div>)}</div></div>
    </LoadingRegion>
  );
}
