import { CarProvider } from "@/core/carContext";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CarProvider>
          {children}
        </CarProvider>
      </body>
    </html>
  );
}
