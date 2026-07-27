/**
 * Persistent floating WhatsApp button. Fixed bottom-left so it doesn't
 * collide with the video button (bottom-right). Opens a pre-filled chat.
 */
const WHATSAPP_URL =
  "https://api.whatsapp.com/send?phone=61400765488&text=Hello%2C%20I%20would%20like%20more%20information.%F0%9F%98%80";

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 left-5 z-[60] flex items-center gap-3 rounded-full bg-[#25D366] py-3 pl-3 pr-5 text-white shadow-2xl transition-transform duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:bottom-8 md:left-8"
    >
      <span className="flex size-10 items-center justify-center">
        <svg viewBox="0 0 32 32" fill="currentColor" className="size-8">
          <path d="M16.003 3.2c-7.06 0-12.79 5.73-12.79 12.79 0 2.25.59 4.45 1.71 6.39L3.2 28.8l6.6-1.73a12.74 12.74 0 006.2 1.58h.01c7.05 0 12.79-5.73 12.79-12.79 0-3.42-1.33-6.63-3.75-9.05a12.7 12.7 0 00-9.05-3.61zm0 23.3h-.01a10.6 10.6 0 01-5.4-1.48l-.39-.23-3.92 1.03 1.05-3.82-.25-.4a10.58 10.58 0 01-1.62-5.62c0-5.86 4.77-10.63 10.64-10.63 2.84 0 5.51 1.11 7.52 3.12a10.56 10.56 0 013.11 7.52c0 5.86-4.77 10.63-10.63 10.63zm5.83-7.96c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1.01 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.54-.71-.55-.18-.01-.4-.01-.61-.01-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.64s1.14 3.06 1.29 3.27c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.16-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37z" />
        </svg>
      </span>
      <span className="text-sm font-semibold uppercase tracking-wide max-sm:hidden">
        Chat with us
      </span>
    </a>
  );
}
