import "./globals.css";

export const metadata = {
  title: "Create a prompt — Human Renaissance",
  description: "Create a commission prompt for Human Renaissance.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
