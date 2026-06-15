export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 p-8 text-center font-sans">
      <h1 className="text-3xl font-bold text-black">Схожу на рынок</h1>
      <p className="max-w-md text-zinc-600">
        Сайт в разработке. Пока доступен старый прототип каталога:
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <a
          className="rounded-full bg-black px-6 py-3 font-medium text-white"
          href="/proto/desktop.html"
        >
          Прототип (десктоп)
        </a>
        <a
          className="rounded-full border border-black px-6 py-3 font-medium text-black"
          href="/proto/mobile.html"
        >
          Прототип (мобильный)
        </a>
      </div>
    </div>
  );
}
