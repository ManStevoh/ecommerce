import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-600">
        This page is not published yet. Configure it in Super Admin → Site.
      </p>
      <Link
        href="/"
        className="mt-6 text-sm font-medium text-blue-600 hover:underline"
      >
        Back to home
      </Link>
    </div>
  );
}
