export default function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-800 dark:text-blue-200 hover:underline cursor-pointer"
    >
      {children}
    </a>
  );
}
