import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-3 text-3xl font-bold tracking-tight">404</h1>
        <p className="mb-4 text-md text-muted-foreground">This page could not be found.</p>
        <Link href="/" className="text-sm text-primary underline-offset-4 hover:underline">
          Return to editor
        </Link>
      </div>
    </div>
  );
}
