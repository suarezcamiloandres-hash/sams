# Sam's Coffee — 3D Animated Storefront

Sitio de marca para **Sam's Coffee** (café de especialidad colombiano, Huila) con
experiencia 3D animada — latas flotantes, animaciones de scroll con GSAP y
escenas React Three Fiber — conectado a **Shopify** (checkout) y **Prismic** (contenido).

Basado en el proyecto educativo [Fizzi](https://github.com/prismicio-community/course-fizzi-next)
de Prismic (licencia Apache-2.0), adaptado a la marca y catálogo de Sam's Coffee.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Estilos | Tailwind CSS (paleta espresso/crema/gold) |
| 3D | Three.js + React Three Fiber + drei |
| Animación | GSAP + ScrollTrigger |
| Contenido | Prismic (Slice Machine) con fallback local |
| Commerce | Shopify Storefront API (carrito + checkout) |
| Fuentes | Montserrat + Alex Brush (Google Fonts) |

## Correr en local

```bash
npm install
npm run next:dev   # solo Next.js (sin Slice Machine)
# o
npm run dev        # Next.js + Slice Machine (requiere cuenta Prismic)
```

Abre http://localhost:3000. **Sin Prismic ni Shopify configurados, el sitio
funciona igual**: renderiza el contenido local de `src/lib/fallbackSlices.ts`
y los botones de compra redirigen al sitio actual.

## Conectar Prismic (contenido editable por el cliente)

1. Crea una cuenta en [prismic.io](https://prismic.io) y un repositorio llamado
   `sams-coffee` (o cambia `repositoryName` en `slicemachine.config.json`).
2. Corre `npm run slicemachine`, entra a http://localhost:9999 y haz push de
   los slices al repositorio.
3. (Opcional) `npm run set-up-content` migra el contenido base del curso Fizzi
   como andamiaje; luego edita los textos en Prismic con el copy de Sam's
   (los textos correctos están en los `mocks.json` de cada slice y en
   `src/lib/fallbackSlices.ts`).
4. En Prismic crea el documento `page` con UID `home` y publícalo.

## Conectar Shopify (checkout real)

1. En el admin de Shopify: **Settings → Apps and sales channels → Develop apps
   → Create app** → habilita los scopes de Storefront API → **Install** →
   copia el *Storefront access token*.
2. Crea los 4 productos con estos handles (o ajusta `PRODUCTS` en
   `src/lib/shopify.ts`):
   - `huila-origin-coffee` — $19.00 AUD
   - `geisha-coffee` — $15.00 AUD
   - `caturra-premium` — $18.00 AUD
   - `special-reserve` — $15.00 AUD
3. Copia `.env.example` a `.env.local` y completa:
   ```
   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=<tu-tienda>.myshopify.com
   NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=<token>
   ```
4. El botón **Buy now** del carrusel crea un carrito vía
   `/api/checkout?flavor=<id>` y redirige al checkout de Shopify.

## Estructura clave

```
src/
  components/
    SamsLogo.tsx       # wordmark SVG (Alex Brush + Montserrat)
    SodaCan.tsx        # lata 3D con etiquetas por variedad (public/labels/*)
    FloatingCan.tsx    # wrapper con flotación
  slices/
    Hero/              # intro 3D + tagline "Single Origin Coffee, for the world"
    SkyDive/           # lata volando entre nubes — "From Huila to the world"
    AlternatingText/   # historia: altitud, caficultoras, trazabilidad
    Carousel/          # selector de los 4 cafés con precio y Buy now
    BigText/           # statement tipográfico gigante
  lib/
    shopify.ts         # cliente Storefront API + productos fallback
    fallbackSlices.ts  # contenido local cuando Prismic no existe aún
  app/api/checkout/    # crea carrito Shopify y redirige al checkout
public/labels/         # texturas de etiqueta (huila, geisha, caturra, reserve)
```

## Reemplazar las etiquetas placeholder

Las texturas en `public/labels/*.png` (1086×583) son placeholders generados.
Cuando el cliente entregue el diseño final de etiqueta, exporta un PNG del
mismo tamaño por variedad y reemplaza los archivos — el modelo 3D las toma
automáticamente.

## Deploy

Pensado para [Vercel](https://vercel.com): importa el repo, agrega las dos
variables de entorno de Shopify y despliega. Configura el webhook de Prismic
(`/api/revalidate`) para refrescar contenido al publicar.
