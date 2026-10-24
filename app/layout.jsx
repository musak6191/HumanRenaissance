import "./globals.css";

export const metadata = {
  title: "Human Renaissance — Art commissions, reimagined",
  description: "A marketplace for meaningful art commissions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
