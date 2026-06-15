import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { categories, getSeasonalProducts } from "@/data/catalog";

const steps = [
  {
    title: "Соберите список продуктов",
    description:
      "Выбирайте товары из каталога — это список покупок, а не жёсткий заказ. Перед оформлением его можно изменить.",
    icon: "📝",
  },
  {
    title: "Мы сходим на рынок и всё купим",
    description:
      "Получим список в Telegram, сходим на рынок в Ялте и соберём для вас самые свежие продукты.",
    icon: "🧺",
  },
  {
    title: "Доставим в течение часа",
    description:
      "Курьер привезёт заказ по указанному адресу. Оплата — после сборки, когда сумма будет точной.",
    icon: "🚲",
  },
];

export default function Home() {
  const seasonal = getSeasonalProducts();

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Hero */}
      <section className="bg-primary/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-12 text-center md:py-16">
          <span className="rounded-[10px] bg-white px-4 py-1 text-sm font-semibold text-primary-dark shadow-sm">
            г. Ялта · доставка в течение часа
          </span>
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight md:text-5xl">
            Свежие продукты с рынка — прямо к вашей двери
          </h1>
          <p className="max-w-xl text-muted">
            Соберите список продуктов, мы сходим на рынок, выберем самое
            свежее и привезём заказ в течение часа.
          </p>
          <Link
            href="/catalog"
            className="rounded-[10px] bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm"
          >
            Перейти в каталог
          </Link>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-primary-dark">
            <span aria-hidden>✅</span> У нас не обманывают
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-primary-dark">
            <span className="rounded-[10px] bg-white px-3 py-1 shadow-sm">⚖️ Точный вес</span>
            <span className="rounded-[10px] bg-white px-3 py-1 shadow-sm">🥬 Свежие продукты</span>
            <span className="rounded-[10px] bg-white px-3 py-1 shadow-sm">💰 Реальная стоимость</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-6xl px-4">
        <h2 className="mb-4 text-xl font-bold">Как это работает</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="rounded-[10px] border border-black/5 bg-card p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-2xl">{step.icon}</span>
                <span className="text-xs font-bold text-primary-dark">
                  Шаг {i + 1}
                </span>
              </div>
              <h3 className="mb-1 font-semibold">{step.title}</h3>
              <p className="text-sm text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Seasonal */}
      <section className="mx-auto w-full max-w-6xl px-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">🍓 Сейчас самый сезон</h2>
          <Link href="/catalog" className="text-sm font-semibold text-primary-dark">
            Весь каталог →
          </Link>
        </div>
        <div className="flex flex-nowrap gap-4 overflow-x-auto pb-2">
          {seasonal.map((product) => (
            <div key={product.id} className="w-44 shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto w-full max-w-6xl px-4">
        <h2 className="mb-4 text-xl font-bold">Категории</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/catalog?category=${c.id}`}
              className="flex items-center gap-3 rounded-[10px] border border-black/5 bg-card p-3 shadow-sm hover:border-primary/30"
            >
              <span className="text-2xl">{c.icon}</span>
              <span className="text-sm font-semibold">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
