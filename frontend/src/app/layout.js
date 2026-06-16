import './globals.css';

export const metadata = {
  title: 'Cartify - Belanja Online Aman dan Cepat',
  description: 'Platform E-Commerce Modern, Aman, dan Terpercaya',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
          precedence="default"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          precedence="default"
        />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;family=Outfit:wght@600;700&amp;display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <script dangerouslySetInnerHTML={{__html: `
          tailwind.config = {
            darkMode: "class",
            theme: {
              extend: {
                colors: {
                  "inverse-surface": "#2d3133",
                  "secondary-container": "#87faaa",
                  "on-tertiary": "#ffffff",
                  "on-secondary-fixed": "#00210d",
                  "on-primary": "#ffffff",
                  "surface-variant": "#e0e3e6",
                  "surface-bright": "#f7f9fc",
                  "primary-fixed": "#76fca3",
                  "secondary-fixed": "#87faaa",
                  "inverse-on-surface": "#eff1f4",
                  "on-tertiary-fixed": "#002111",
                  "surface-container-highest": "#e0e3e6",
                  "outline-variant": "#bccabc",
                  "on-surface": "#191c1e",
                  "secondary": "#008f4c",
                  "primary-container": "#00aa5b",
                  "background": "#f7f9fc",
                  "on-surface-variant": "#3d4a3f",
                  "on-background": "#191c1e",
                  "secondary-fixed-dim": "#6bdd90",
                  "on-error-container": "#93000a",
                  "on-primary-fixed-variant": "#005229",
                  "on-error": "#ffffff",
                  "outline": "#6d7b6e",
                  "surface-container-low": "#f2f4f7",
                  "surface-container-high": "#e6e8eb",
                  "tertiary-fixed-dim": "#a5d1b4",
                  "on-tertiary-fixed-variant": "#274e39",
                  "surface-container": "#eceef1",
                  "on-primary-fixed": "#00210d",
                  "on-secondary-fixed-variant": "#005229",
                  "tertiary-fixed": "#c1edcf",
                  "on-primary-container": "#003518",
                  "error": "#ba1a1a",
                  "tertiary-container": "#739d83",
                  "primary": "#00aa5b",
                  "surface-tint": "#00aa5b",
                  "on-secondary": "#ffffff",
                  "inverse-primary": "#57df89",
                  "on-secondary-container": "#00743c",
                  "surface-dim": "#d8dadd",
                  "primary-fixed-dim": "#57df89",
                  "error-container": "#ffdad6",
                  "tertiary": "#3f674f",
                  "on-tertiary-container": "#093320",
                  "surface": "#f7f9fc",
                  "surface-container-lowest": "#ffffff"
                },
                borderRadius: {
                  "DEFAULT": "0.25rem",
                  "lg": "0.5rem",
                  "xl": "0.75rem",
                  "xxl": "1.0rem",
                  "full": "9999px"
                },
                spacing: {
                  "margin-mobile": "16px",
                  "lg": "24px",
                  "container-max": "1280px",
                  "xs": "4px",
                  "xxl": "48px",
                  "xl": "32px",
                  "gutter": "24px",
                  "xxxl": "64px",
                  "base": "4px",
                  "md": "16px",
                  "sm": "8px"
                },
                fontFamily: {
                  "body-lg": ["Inter"],
                  "caption": ["Inter"],
                  "headline-lg": ["Outfit"],
                  "display-lg": ["Outfit"],
                  "display-lg-mobile": ["Outfit"],
                  "headline-md": ["Outfit"],
                  "body-md": ["Inter"],
                  "label-md": ["Inter"]
                }
              }
            }
          }
        `}} />
      </head>
      <body>
        {children}
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          async
        ></script>
      </body>
    </html>
  );
}
