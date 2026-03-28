"use client";
import { useEffect, useState, Suspense } from "react";
import { Button, Select, SelectItem, Slider, Accordion, AccordionItem, Spinner, Pagination } from "@heroui/react";
import { SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import ProductCard from "@/components/store/ProductCard";
import { productsApi, categoriesApi, motorcycleApi } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner color="primary" size="lg" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [engines, setEngines] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    brand_id: searchParams.get("brand_id") || "",
    model_id: "",
    cc: "",
    min_price: 0,
    max_price: 5000,
    sort: "newest",
  });

  useEffect(() => {
    Promise.all([categoriesApi.list(), motorcycleApi.brands(), motorcycleApi.engines()]).then(
      ([c, b, e]) => { setCategories(c.data); setBrands(b.data); setEngines(e.data); }
    );
  }, []);

  useEffect(() => {
    if (filters.brand_id) {
      motorcycleApi.models(Number(filters.brand_id)).then((r) => setModels(r.data));
    }
  }, [filters.brand_id]);

  useEffect(() => {
    setLoading(true);
    const params: any = { page, limit: 20, sort: filters.sort };
    if (filters.category) params.category = filters.category;
    if (filters.brand_id) params.brand_id = filters.brand_id;
    if (filters.model_id) params.model_id = filters.model_id;
    if (filters.cc) params.cc = filters.cc;
    if (filters.min_price) params.min_price = filters.min_price;
    if (filters.max_price < 5000) params.max_price = filters.max_price;

    productsApi.list(params).then((r) => setProducts(r.data)).finally(() => setLoading(false));
  }, [filters, page]);

  const clearFilters = () =>
    setFilters({ category: "", brand_id: "", model_id: "", cc: "", min_price: 0, max_price: 5000, sort: "newest" });

  const FilterSidebar = () => (
    <div className="space-y-4">
      <Accordion variant="splitted" className="gap-3">
        <AccordionItem key="category" title={<span className="text-white font-semibold text-sm">{t("product.category")}</span>} className="bg-[#111] border border-[#222]">
          <div className="space-y-2 pb-2">
            {categories.map((c) => (
              <button key={c.id} onClick={() => setFilters((f) => ({ ...f, category: c.slug }))}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                  ${filters.category === c.slug ? "bg-primary/20 text-primary" : "text-white/60 hover:text-white"}`}>
                {c.name_en}
              </button>
            ))}
          </div>
        </AccordionItem>

        <AccordionItem key="brand" title={<span className="text-white font-semibold text-sm">{t("product.motorcycleBrand")}</span>} className="bg-[#111] border border-[#222]">
          <Select size="sm" placeholder="Select brand" className="w-full"
            onChange={(e) => setFilters((f) => ({ ...f, brand_id: e.target.value, model_id: "" }))}>
            {brands.map((b) => <SelectItem key={b.id}>{b.name}</SelectItem>)}
          </Select>
          {models.length > 0 && (
            <Select size="sm" placeholder="Select model" className="w-full mt-2"
              onChange={(e) => setFilters((f) => ({ ...f, model_id: e.target.value }))}>
              {models.map((m) => <SelectItem key={m.id}>{m.name}</SelectItem>)}
            </Select>
          )}
        </AccordionItem>

        <AccordionItem key="engine" title={<span className="text-white font-semibold text-sm">{t("product.engineCC")}</span>} className="bg-[#111] border border-[#222]">
          <div className="grid grid-cols-2 gap-2 pb-2">
            {engines.map((e) => (
              <button key={e.id} onClick={() => setFilters((f) => ({ ...f, cc: String(e.cc) }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors
                  ${filters.cc === String(e.cc) ? "bg-primary border-primary text-white" : "border-[#333] text-white/60 hover:border-primary/50"}`}>
                {e.label}
              </button>
            ))}
          </div>
        </AccordionItem>

        <AccordionItem key="price" title={<span className="text-white font-semibold text-sm">{t("product.priceRange")}</span>} className="bg-[#111] border border-[#222]">
          <div className="px-2 pb-2">
            <Slider
              label={`RM${filters.min_price} — RM${filters.max_price}`}
              step={50} minValue={0} maxValue={5000}
              defaultValue={[0, 5000]}
              color="secondary"
              className="w-full"
              onChange={(val: any) => setFilters((f) => ({ ...f, min_price: val[0], max_price: val[1] }))}
            />
          </div>
        </AccordionItem>
      </Accordion>

      <Button variant="bordered" size="sm" className="w-full text-white/50" startContent={<X size={14} />} onPress={clearFilters}>
        {t("product.clearFilters")}
      </Button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">{t("nav.products")}</h1>
          <p className="text-white/40 text-sm mt-1">{products.length} products</p>
        </div>
        <div className="flex gap-3">
          <Button variant="bordered" size="sm" className="md:hidden text-white/60" startContent={<SlidersHorizontal size={14} />}
            onPress={() => setShowFilters(!showFilters)}>
            {t("product.filter")}
          </Button>
          <Select size="sm" className="w-44 hidden md:flex" placeholder={t("product.sort")}
            onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}>
            <SelectItem key="newest">{t("product.sortNewest")}</SelectItem>
            <SelectItem key="price_asc">{t("product.sortPriceAsc")}</SelectItem>
            <SelectItem key="price_desc">{t("product.sortPriceDesc")}</SelectItem>
          </Select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Desktop */}
        <aside className="hidden md:block w-64 shrink-0"><FilterSidebar /></aside>

        {/* Mobile Filter Sheet */}
        {showFilters && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/80" onClick={() => setShowFilters(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-[#111] rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
              <h3 className="text-white font-bold mb-4">{t("product.filter")}</h3>
              <FilterSidebar />
              <Button color="primary" className="w-full mt-4 font-bold" onPress={() => setShowFilters(false)}>Apply Filters</Button>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner color="primary" size="lg" /></div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/30 text-xl mb-4">{t("product.noProducts")}</p>
              <Button color="primary" variant="bordered" onPress={clearFilters}>{t("product.clearFilters")}</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              <div className="flex justify-center mt-10">
                <Pagination total={Math.ceil(products.length / 20)} page={page} onChange={setPage} color="primary" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
