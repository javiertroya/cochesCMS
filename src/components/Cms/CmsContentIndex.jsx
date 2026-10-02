const CmsContentIndex = ({ items = [] }) => (
    <section className="py-8">
        <div className="rounded-xl border border-brand-primary/10 bg-brand-light p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900">Índice</h2>
            <hr className="my-3 border-gray-200" />
            <ol className="space-y-3">
                {items.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
                            {index + 1}
                        </span>
                        <a
                            href={item.href}
                            className="text-sm leading-6 text-brand-primary transition-colors hover:text-brand-dark hover:underline"
                        >
                            {item.text}
                        </a>
                    </li>
                ))}
            </ol>
        </div>
    </section>
)

export default CmsContentIndex
