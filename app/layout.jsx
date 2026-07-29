import '../src/index.css';

export const metadata = {
  title: 'VyapaarOS — AI Business Operating System',
  description: 'One AI employee that runs your entire back office.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
