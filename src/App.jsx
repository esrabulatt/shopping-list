import { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, PlusCircle, Trash2, Filter, Search, RotateCcw, Wallet } from 'lucide-react';
import './App.css';

const shops = [
  { id: 1, name: "Migros" },
  { id: 2, name: "Metro" },
  { id: 3, name: "Bim" },
  { id: 4, name: "CarrefourSa" },
  { id: 5, name: "Macro Center" },
  { id: 6, name: "Eataly" }
];

const categories = [
  { id: 1, name: "Elektronik" },
  { id: 2, name: "Oyuncak" },
  { id: 3, name: "Şarküteri" },
  { id: 4, name: "Bakliyat" },
  { id: 5, name: "Fırın" },
  { id: 6, name: "Kasap" }
];

const defaultProducts = [
  // 1: ELEKTRONİK
  { id: 1, categoryId: 1, name: "Bluetooth Kulaklık", defaultPrice: 850 },
  { id: 2, categoryId: 1, name: "USB Type-C Kablo", defaultPrice: 8000 },
  { id: 3, categoryId: 1, name: "Powerbank 10.000 mAh", defaultPrice: 650 },
  { id: 4, categoryId: 1, name: "Kablosuz Mouse", defaultPrice: 1000 },

  // 2: OYUNCAK
  { id: 5, categoryId: 2, name: "LEGO Başlangıç Seti", defaultPrice: 850 },
  { id: 6, categoryId: 2, name: "Oyuncak Araba", defaultPrice: 1050 },
  { id: 7, categoryId: 2, name: "Peluş Ayı", defaultPrice: 750 },
  { id: 8, categoryId: 2, name: "1000 Parça Puzzle", defaultPrice: 1200 },

  // 3: ŞARKÜTERİ
  { id: 9, categoryId: 3, name: "Ezine Peyniri (500 gr)", defaultPrice: 680 },
  { id: 10, categoryId: 3, name: "Siyah Zeytin (1 kg)", defaultPrice: 720 },
  { id: 11, categoryId: 3, name: "Dana Sucuk (250 gr)", defaultPrice: 650 },
  { id: 12, categoryId: 3, name: "Tereyağı (500 gr)", defaultPrice: 640 },

  // 4: BAKLİYAT
  { id: 13, categoryId: 4, name: "Koçbaşı Nohut (1 kg)", defaultPrice: 65 },
  { id: 14, categoryId: 4, name: "Kırmızı Mercimek (1 kg)", defaultPrice: 45 },
  { id: 15, categoryId: 4, name: "Baldo Pirinç (1 kg)", defaultPrice: 75 },
  { id: 16, categoryId: 4, name: "Pilavlık Bulgur (1 kg)", defaultPrice: 75 },

  // 5: FIRIN
  { id: 17, categoryId: 5, name: "Somun Ekmek", defaultPrice: 25 },
  { id: 18, categoryId: 5, name: "Susamlı Simit", defaultPrice: 30 },
  { id: 19, categoryId: 5, name: "Tereyağlı Kruvasan", defaultPrice: 110 },
  { id: 20, categoryId: 5, name: "Tam Buğday Ekmeği", defaultPrice: 60 },

  // 6: KASAP
  { id: 21, categoryId: 6, name: "Dana Kıyma (1 kg)", defaultPrice: 800 },
  { id: 22, categoryId: 6, name: "Kuzu Pirzola (1 kg)", defaultPrice: 1050 },
  { id: 23, categoryId: 6, name: "Tavuk Göğsü (1 kg)", defaultPrice: 650 },
  { id: 24, categoryId: 6, name: "Dana Antrikot (1 kg)", defaultPrice: 1200 }
];

function App() {
  const [shop, setShop] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState(() => {
    const savedBudget = localStorage.getItem("shoppingBudget");
    return savedBudget ? Number(savedBudget) : 0;
  });
  
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem("shoppingProducts");
    if (savedProducts) {
      return JSON.parse(savedProducts);
    }
    return [];
  });
  
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [filteredShopId, setFilteredShopId] = useState("");
  const [filteredCategoryId, setFilteredCategoryId] = useState("");
  const [filteredStatus, setFilteredStatus] = useState("all");
  const [filteredName, setFilteredName] = useState("");

  useEffect(() => {
    localStorage.setItem("shoppingProducts", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("shoppingBudget", budget);
  }, [budget]);

  const availableProducts = category
    ? defaultProducts.filter((p) => p.categoryId === Number(category))
    : [];

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setSelectedProductId(""); 
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const shopMatch = filteredShopId === "" || product.shop === filteredShopId;
      const categoryMatch = filteredCategoryId === "" || product.category === filteredCategoryId;
      const statusMatch =
        filteredStatus === "all" ||
        (filteredStatus === "bought" && product.isBought) ||
        (filteredStatus === "notBought" && !product.isBought);

      const nameMatch = product.productName.toLowerCase().includes(filteredName.toLowerCase());

      return shopMatch && categoryMatch && statusMatch && nameMatch;
    });
  }, [products, filteredShopId, filteredCategoryId, filteredStatus, filteredName]);

  const handleAddProduct = () => {
    const chosen = defaultProducts.find((p) => p.id === Number(selectedProductId));

    if (!chosen || !shop || !category) {
      alert("Lütfen ürün, market ve kategori seçiniz!");
      return;
    }

    const calculatedPrice = chosen.defaultPrice * Number(quantity);

    const newProduct = {
      id: crypto.randomUUID(),
      productName: `${chosen.name} (${quantity} Adet)`,
      quantity: Number(quantity),
      price: calculatedPrice,
      shop,
      category,
      isBought: false
    };

    setProducts((prev) => {
      const updated = [...prev, newProduct];
      checkShoppingCompleted(updated);
      return updated;
    });

    setSelectedProductId("");
    setQuantity(1);
    setShop("");
    setCategory("");
  };

  const toggleBought = (id) => {
    setProducts((prevProducts) => {
      const updated = prevProducts.map((p) =>
        p.id === id ? { ...p, isBought: !p.isBought } : p
      );
      checkShoppingCompleted(updated);
      return updated;
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Bu ürünü listeden silmek istediğinize emin misiniz?")) {
      setProducts((prevProducts) => prevProducts.filter((p) => p.id !== id));
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Tüm alışveriş listesini temizlemek istediğinize emin misiniz?")) {
      setProducts([]);
    }
  };

  const handleResetFilters = () => {
    setFilteredShopId("");
    setFilteredCategoryId("");
    setFilteredStatus("all");
    setFilteredName("");
  };

  const checkShoppingCompleted = (currentProducts) => {
    if (currentProducts.length === 0) return;
    const allBought = currentProducts.every((p) => p.isBought);

    if (allBought) {
      setTimeout(() => {
        alert("Harika! Tüm alışverişinizi tamamladınız 🎉");
      }, 100);
    }
  };

  const totalAmount = useMemo(() => {
    return products.reduce((toplam, item) => toplam + Number(item.price || 0), 0);
  }, [products]);
  
  const boughtAmount = useMemo(() => {
    return products
      .filter((p) => p.isBought)
      .reduce((toplam, item) => toplam + Number(item.price || 0), 0);
  }, [products]);

  const remainingAmount = totalAmount - boughtAmount;
  const budgetRemaining = budget - totalAmount;

  const boughtCount = products.filter((p) => p.isBought).length;
  const totalCount = products.length;
  const remainingCount = totalCount - boughtCount;
  const completedPercentage = totalCount === 0
    ? 0
    : Math.round((boughtCount / totalCount) * 100);

  return (
    <div className="max-w-5xl mx-auto my-4 sm:my-8 p-3 sm:p-6 bg-slate-50 rounded-2xl shadow-sm border border-gray-200">
   
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
          Alışveriş Paneli
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">
          Market listesini yönet, bütçeni takip et ve kolayca filtrele.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">

        {/* SOL SÜTUN (4 Birim) - Artık doğrudan Form ile başlıyor */}
        <div className="md:col-span-4 flex flex-col gap-4 sm:gap-6">
          
          {/* Form Alanı */}
          <div className="flex flex-col gap-3 bg-white p-4 rounded-xl shadow-xs border border-gray-100">
            <h3 className="font-semibold text-gray-700 text-sm border-b pb-2 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              Yeni Ürün Ekle
            </h3>
            
            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={shop}
              onChange={(e) => setShop(e.target.value)}
            >
              <option value="">Market seçiniz</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={category}
              onChange={handleCategoryChange}
            >
              <option value="">Kategori seçiniz</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <div className="grid grid-cols-3 gap-2">
              <select
                disabled={!category}
                className="col-span-2 w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                <option value="">
                  {category ? "Ürün seçiniz" : "Önce kategori seçiniz"}
                </option>
                {availableProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.defaultPrice}₺)
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="Adet"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            <button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg p-2.5 transition-colors cursor-pointer text-sm mt-1 flex items-center justify-center gap-2"
              onClick={handleAddProduct}
            >
              <PlusCircle className="w-4 h-4" />
              Ürün Ekle
            </button>
          </div>

          {/* Özet Kartları */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <div className="bg-indigo-50 p-3 rounded-xl text-center border border-indigo-100">
              <span className="text-xs text-indigo-600 font-semibold block">Toplam Ürün</span>
              <span className="text-xl font-bold text-indigo-900">{totalCount}</span>
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl text-center border border-emerald-100">
              <span className="text-xs text-emerald-600 font-semibold block">Alınan</span>
              <span className="text-xl font-bold text-emerald-900">{boughtCount}</span>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl text-center border border-amber-100">
              <span className="text-xs text-amber-600 font-semibold block">Kalan</span>
              <span className="text-xl font-bold text-amber-900">{remainingCount}</span>
            </div>

            <div className="bg-orange-50 p-3 rounded-xl text-center border border-orange-100">
              <span className="text-xs text-orange-600 font-semibold block">Harcanan</span>
              <span className="text-xl font-bold text-orange-900">₺{boughtAmount}</span>
            </div>

            <div className="bg-purple-50 p-3 rounded-xl text-center border border-purple-100 col-span-2">
              <span className="text-xs text-purple-600 font-semibold block">Kalan Tutar</span>
              <span className="text-xl font-bold text-purple-900">₺{remainingAmount}</span>
            </div>
          </div>

          {/* Alışveriş İlerlemesi Kartı */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-600">Alışveriş İlerlemesi</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{boughtCount} / {totalCount} ürün</span>
                <span className="text-xs font-bold text-indigo-600">%{completedPercentage}</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${completedPercentage}%` }}
              ></div>
            </div>
          </div>

        </div>

        {/* SAĞ SÜTUN (8 Birim) */}
        <div className="md:col-span-8 flex flex-col gap-4">
          
          {/* BÜTÇE ALANI - Yeni Konumu (Sağ Üst) */}
          <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-700 text-sm">Alışveriş Bütçesi</h3>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="number"
                  min="0"
                  placeholder="Bütçe girin"
                  value={budget || ""}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="flex-1 sm:w-40 border border-gray-300 rounded-lg p-2 bg-gray-50 text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <div className="flex items-center justify-center px-3 rounded-lg bg-gray-100 text-gray-600 font-semibold text-sm">₺</div>
              </div>
            </div>

            {budget > 0 && (
              <div
                className={`mt-3 p-2.5 rounded-lg text-xs sm:text-sm font-medium ${
                  budgetRemaining < 0
                    ? "bg-red-50 text-red-600 border border-red-100"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                }`}
              >
                {budgetRemaining < 0
                  ? `⚠️ Bütçenizi ₺${Math.abs(budgetRemaining)} aştınız.`
                  : `Bütçenizden ₺${budgetRemaining} kaldı.`}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs p-3 sm:p-4 flex flex-col gap-4">
            
            {/* Filtre Kontrolleri */}
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-2 flex-1 w-full sm:w-auto">
                <select 
                  className="border border-gray-300 rounded-lg p-2 text-xs bg-gray-50 outline-none flex-1 sm:flex-none"
                  value={filteredShopId}
                  onChange={(e) => setFilteredShopId(e.target.value)}
                >
                  <option value="">Tüm Marketler</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>{shop.name}</option>
                  ))}
                </select>

                <select
                  className="border border-gray-300 rounded-lg p-2 text-xs bg-gray-50 outline-none flex-1 sm:flex-none"
                  value={filteredCategoryId}
                  onChange={(e) => setFilteredCategoryId(e.target.value)}
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>

                <div className="relative flex-1 min-w-[130px] w-full sm:w-auto">
                  <input 
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 pl-7 text-xs bg-gray-50 outline-none"
                    value={filteredName}
                    onChange={(e) => setFilteredName(e.target.value)}
                    placeholder="Ürün ara..." 
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2.5" />
                </div>

                {(filteredShopId || filteredCategoryId || filteredName || filteredStatus !== "all") && (
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 p-2 bg-indigo-50 rounded-lg transition-colors"
                    title="Filtreleri Temizle"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Temizle
                  </button>
                )}
              </div>
            </div>

            {/* Radio Durum Filtreleri */}
            <div className="flex flex-wrap gap-3 text-xs text-gray-600 border-t pt-3 items-center">
              <span className="font-medium text-gray-400 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Durum:
              </span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  value="all"
                  checked={filteredStatus === "all"}
                  onChange={(e) => setFilteredStatus(e.target.value)}
                />
                Tümü
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  value="bought"
                  checked={filteredStatus === "bought"}
                  onChange={(e) => setFilteredStatus(e.target.value)}
                />
                Satın Alınanlar
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  value="notBought"
                  checked={filteredStatus === "notBought"}
                  onChange={(e) => setFilteredStatus(e.target.value)}
                />
                Satın Alınmayanlar
              </label>
            </div>

            {/* Ürün Tablosu */}
            {filteredProducts.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-10 border-t">
                Henüz listenizde ürün bulunmuyor.
              </p>
            ) : (
              <div className="overflow-x-auto border-t">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                    <tr>
                      <th className="p-3 w-10 text-center">Durum</th>
                      <th className="p-3">Ürün</th>
                      <th className="p-3">Market</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Fiyat</th>
                      <th className="p-3 text-center">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs sm:text-sm text-gray-700">
                    {filteredProducts.map((item) => {
                      const foundShop = shops.find((s) => s.id === Number(item.shop));
                      const foundCategory = categories.find((c) => c.id === Number(item.category));

                      return (
                        <tr
                          key={item.id}
                          onClick={() => toggleBought(item.id)}
                          className={`cursor-pointer transition-colors ${
                            item.isBought ? "bg-gray-50/80" : "hover:bg-indigo-50/30"
                          }`}
                        >
                          <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={item.isBought}
                              onChange={() => toggleBought(item.id)}
                              className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-600"
                            />
                          </td>
                          <td className={`p-3 font-medium ${item.isBought ? "line-through text-gray-400" : "text-gray-800"}`}>
                            {item.productName}
                          </td>
                          <td className={`p-3 ${item.isBought ? "line-through text-gray-400" : ""}`}>
                            {foundShop ? foundShop.name : "Belirtilmedi"}
                          </td>
                          <td className={`p-3 ${item.isBought ? "line-through text-gray-400" : ""}`}>
                            {foundCategory ? foundCategory.name : "Belirtilmedi"}
                          </td>
                          <td className={`p-3 font-semibold ${item.isBought ? "line-through text-gray-400" : "text-emerald-700"}`}>
                            {item.price ? `₺${item.price}` : "-"}
                          </td>
                          <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer border border-red-200 mx-auto"
                              title="Ürünü Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Listeyi Temizle Butonu */}
            {products.length > 0 && (
              <div className="flex justify-end pt-2 border-t">
                <button
                  onClick={handleClearAll}
                  className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Tüm Listeyi Temizle
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default App;