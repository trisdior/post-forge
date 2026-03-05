export const metadata = {
  title: 'MacBook Neo',
  description: 'Solving: MacBook Neo',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
