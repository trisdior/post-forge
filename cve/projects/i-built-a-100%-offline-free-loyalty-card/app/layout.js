export const metadata = {
  title: 'I built a 100% offline, free loyalty card wallet because I hated holding up the checkout line.',
  description: 'Solving: I built a 100% offline, free loyalty card wallet because I hated holding up the ',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
