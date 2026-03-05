export const metadata = {
  title: 'Show HN: Omni – Open-source workplace search and chat, built on Postgres',
  description: 'Solving: Show HN: Omni – Open-source workplace search and chat, built on Postgres',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
