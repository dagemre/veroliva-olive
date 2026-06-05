"use client";

// Ödeme akışı — Adım 2: Teslimat Bilgileri, Adım 3: Ödeme (Emre'nin tasarımına göre).
// Sipariş Supabase place_order RPC'siyle oluşturulur (fiyatlar DB'den doğrulanır).
// NOT: Kart formu görseldir — kart verisi HİÇBİR YERE GÖNDERİLMEZ/SAKLANMAZ.
// Gerçek tahsilat iyzico entegrasyonuyla gelecek.
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "@/components/cart/CartProvider";
import CheckoutSteps from "@/components/cart/CheckoutSteps";
import PerksBand from "@/components/cart/PerksBand";
import { formatPrice } from "@/lib/products";
import { shippingCostFor } from "@/lib/cart";
import { clearStoredCoupon, getStoredCoupon, parseCouponResult } from "@/lib/coupon";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { Tables } from "@/lib/database.types";

type AddressRow = Tables<"addresses">;

type ShippingForm = {
  fullName: string;
  phone: string;
  email: string;
  addressLine: string;
  district: string;
  city: string;
  postalCode: string;
};

const EMPTY_FORM: ShippingForm = {
  fullName: "",
  phone: "",
  email: "",
  addressLine: "",
  district: "",
  city: "",
  postalCode: "",
};

const inputCls =
  "h-11 w-full border border-line bg-white px-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-gold-light focus:outline-none";
const labelCls = "mb-1.5 block text-[12px] font-semibold text-ink";

export default function CheckoutView() {
  const t = useTranslations("checkout");
  const tc = useTranslations("cart");
  const tAccount = useTranslations("accountPage.addresses");
  const locale = useLocale() as "tr" | "en";
  const router = useRouter();
  const { items, ready, subtotal, clear } = useCart();

  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [step, setStep] = useState<"shipping" | "payment">("shipping");

  // Teslimat
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("new");
  const [form, setForm] = useState<ShippingForm>(EMPTY_FORM);
  const [saveAddress, setSaveAddress] = useState(false);
  const [addressTitle, setAddressTitle] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Ödeme
  const [method, setMethod] = useState<"card" | "bank_transfer" | "cod">("card");
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvv: "" });
  const [saveCard, setSaveCard] = useState(false);
  const [billingSame, setBillingSame] = useState(true);
  const [billing, setBilling] = useState({ name: "", address: "" });
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Kupon (sepetten taşınır, burada yeniden doğrulanır)
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);

  // Oturum + kayıtlı adresler + profil ön doldurma
  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setAuthChecked(true);
      return;
    }
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user ?? null);
      setAuthChecked(true);
      if (!data.user) return;

      const [{ data: profile }, { data: addrs }] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, phone, email")
          .eq("id", data.user.id)
          .maybeSingle(),
        supabase
          .from("addresses")
          .select("*")
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false }),
      ]);

      setForm((f) => ({
        ...f,
        fullName: f.fullName || profile?.full_name || "",
        phone: f.phone || profile?.phone || "",
        email: f.email || profile?.email || data.user?.email || "",
      }));

      if (addrs && addrs.length > 0) {
        setAddresses(addrs);
        const def = addrs.find((a) => a.is_default) ?? addrs[0];
        setSelectedAddress(def.id);
      }
    });
  }, []);

  // Kuponu yeniden doğrula (ara toplam hazır olunca)
  const couponReady = ready && subtotal > 0;
  useEffect(() => {
    if (!couponReady) return;
    const stored = getStoredCoupon();
    const supabase = getSupabaseBrowser();
    if (!stored || !supabase) return;
    supabase
      .rpc("validate_coupon", { p_code: stored, p_subtotal: subtotal })
      .then(({ data, error }) => {
        if (error) return;
        const result = parseCouponResult(data);
        if (result.valid) {
          setCoupon({ code: result.code, discount: result.discount });
        } else {
          clearStoredCoupon();
        }
      });
  }, [couponReady, subtotal]);

  // Seçili kayıtlı adresi forma uygula
  const activeAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddress) ?? null,
    [addresses, selectedAddress],
  );

  const discount = coupon?.discount ?? 0;
  const shippingCost = shippingCostFor(subtotal);
  const total = Math.max(subtotal + shippingCost - discount, 0);

  // ── Erken durumlar ─────────────────────────────────────────────────────────
  if (!ready || !authChecked) {
    return <div className="min-h-[40vh]" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-6 sm:px-6">
        <CheckoutSteps current={2} />
        <div className="mt-10 border border-line bg-cream-light p-8 text-center sm:p-12">
          <h1 className="font-display text-3xl text-ink">{t("loginTitle")}</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
            {t("loginText")}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/giris"
              className="bg-olive px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-olive-deep"
            >
              {t("login")}
            </Link>
            <Link
              href="/kayit"
              className="border border-line bg-white px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-gold-light"
            >
              {t("register")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-10 text-center sm:px-6">
        <h1 className="font-display text-3xl text-ink">{t("emptyTitle")}</h1>
        <p className="mt-3 text-sm text-ink-soft">{t("emptyText")}</p>
        <Link
          href="/koleksiyon"
          className="mt-7 inline-block bg-olive px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-olive-deep"
        >
          {t("emptyCta")} →
        </Link>
      </div>
    );
  }

  // ── Doğrulama + sipariş ────────────────────────────────────────────────────
  function currentShipping(): ShippingForm {
    if (activeAddress) {
      return {
        fullName: activeAddress.full_name,
        phone: activeAddress.phone || form.phone,
        email: form.email,
        addressLine: activeAddress.address_line,
        district: activeAddress.district,
        city: activeAddress.city,
        postalCode: activeAddress.postal_code,
      };
    }
    return form;
  }

  function validateShipping(): boolean {
    const s = currentShipping();
    if (!s.fullName.trim() || !s.phone.trim() || !s.addressLine.trim() || !s.district.trim() || !s.city.trim()) {
      setFormError(t("required"));
      return false;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.email.trim())) {
      setFormError(t("emailInvalid"));
      return false;
    }
    setFormError(null);
    return true;
  }

  function handleContinue() {
    if (!validateShipping()) return;
    setStep("payment");
    window.scrollTo({ top: 0 });
  }

  async function handlePlaceOrder() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    if (method === "card") {
      const digits = card.number.replace(/\D/g, "");
      if (!card.name.trim() || digits.length < 12 || !card.expiry.trim() || card.cvv.trim().length < 3) {
        setOrderError(t("cardInvalid"));
        return;
      }
    }
    setOrderError(null);
    setPlacing(true);

    const s = currentShipping();
    const shippingJson: Record<string, unknown> = {
      full_name: s.fullName.trim(),
      phone: s.phone.trim(),
      address_line: s.addressLine.trim(),
      district: s.district.trim(),
      city: s.city.trim(),
      postal_code: s.postalCode.trim(),
      country: "Türkiye",
      email: s.email.trim(),
    };
    if (!billingSame && (billing.name.trim() || billing.address.trim())) {
      shippingJson.billing = { name: billing.name.trim(), address: billing.address.trim() };
    }

    // Yeni adres + "kaydet" işaretliyse adres defterine ekle (sipariş engellenmez)
    if (selectedAddress === "new" && saveAddress && user) {
      await supabase.from("addresses").insert({
        user_id: user.id,
        title: addressTitle.trim() || (locale === "tr" ? "Adresim" : "My Address"),
        full_name: s.fullName.trim(),
        phone: s.phone.trim(),
        address_line: s.addressLine.trim(),
        district: s.district.trim(),
        city: s.city.trim(),
        postal_code: s.postalCode.trim(),
        is_default: addresses.length === 0,
      });
    }

    const { data, error } = await supabase.rpc("place_order", {
      p_items: items.map((i) => ({ slug: i.slug, qty: i.qty })),
      p_shipping: shippingJson as never,
      p_payment_method: method,
      p_coupon_code: coupon?.code,
    });

    if (error || !data || typeof data !== "object" || Array.isArray(data)) {
      setPlacing(false);
      setOrderError(t("orderError"));
      return;
    }
    const orderNumber = String((data as { order_number?: unknown }).order_number ?? "");
    if (!orderNumber) {
      setPlacing(false);
      setOrderError(t("orderError"));
      return;
    }

    clear();
    clearStoredCoupon();
    router.push({
      pathname: "/siparis-onayi/[orderNumber]",
      params: { orderNumber },
    });
  }

  const setF = (key: keyof ShippingForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6 lg:px-8">
      <CheckoutSteps current={step === "shipping" ? 2 : 3} />

      <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* ── Sol kolon ── */}
        <div>
          {step === "shipping" ? (
            <div className="border border-line bg-cream-light p-5 sm:p-7">
              <h1 className="flex items-center gap-2 text-[15px] font-semibold uppercase tracking-[0.12em] text-ink">
                {t("shippingTitle")}
              </h1>

              {/* Kayıtlı adresler */}
              {addresses.length > 0 && (
                <fieldset className="mt-5">
                  <legend className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
                    {t("savedAddresses")}
                  </legend>
                  <div className="space-y-2.5">
                    {addresses.map((a) => (
                      <label
                        key={a.id}
                        className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${
                          selectedAddress === a.id
                            ? "border-olive bg-white"
                            : "border-line bg-white/50 hover:border-gold-light"
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress === a.id}
                          onChange={() => setSelectedAddress(a.id)}
                          className="mt-1 accent-olive"
                        />
                        <span className="min-w-0 text-sm">
                          <span className="flex items-center gap-2 font-semibold text-ink">
                            {a.title}
                            {a.is_default && (
                              <span className="border border-gold-light px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-gold">
                                {tAccount("default")}
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block text-ink-soft">
                            {a.full_name} — {a.address_line}, {a.district} / {a.city}
                          </span>
                        </span>
                      </label>
                    ))}
                    <label
                      className={`flex cursor-pointer items-center gap-3 border p-4 transition-colors ${
                        selectedAddress === "new"
                          ? "border-olive bg-white"
                          : "border-line bg-white/50 hover:border-gold-light"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === "new"}
                        onChange={() => setSelectedAddress("new")}
                        className="accent-olive"
                      />
                      <span className="text-sm font-semibold text-ink">{t("newAddress")}</span>
                    </label>
                  </div>
                </fieldset>
              )}

              {/* Adres formu */}
              {(selectedAddress === "new" || addresses.length === 0) && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="co-name" className={labelCls}>{t("fullName")}</label>
                    <input id="co-name" className={inputCls} value={form.fullName} onChange={setF("fullName")} autoComplete="name" />
                  </div>
                  <div>
                    <label htmlFor="co-phone" className={labelCls}>{t("phone")}</label>
                    <input id="co-phone" className={inputCls} value={form.phone} onChange={setF("phone")} autoComplete="tel" inputMode="tel" />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="co-email" className={labelCls}>{t("email")}</label>
                    <input id="co-email" className={inputCls} type="email" value={form.email} onChange={setF("email")} autoComplete="email" />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="co-address" className={labelCls}>{t("addressLine")}</label>
                    <textarea
                      id="co-address"
                      rows={2}
                      placeholder={t("addressPh")}
                      value={form.addressLine}
                      onChange={(e) => setForm((f) => ({ ...f, addressLine: e.target.value }))}
                      autoComplete="street-address"
                      className="w-full border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-gold-light focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="co-district" className={labelCls}>{t("district")}</label>
                    <input id="co-district" className={inputCls} value={form.district} onChange={setF("district")} autoComplete="address-level3" />
                  </div>
                  <div>
                    <label htmlFor="co-city" className={labelCls}>{t("city")}</label>
                    <input id="co-city" className={inputCls} value={form.city} onChange={setF("city")} autoComplete="address-level2" />
                  </div>
                  <div>
                    <label htmlFor="co-postal" className={labelCls}>{t("postalCode")}</label>
                    <input id="co-postal" className={inputCls} value={form.postalCode} onChange={setF("postalCode")} autoComplete="postal-code" inputMode="numeric" />
                  </div>
                  <div>
                    <label htmlFor="co-country" className={labelCls}>{t("country")}</label>
                    <input id="co-country" className={`${inputCls} text-ink-soft`} value="Türkiye" readOnly />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink">
                      <input
                        type="checkbox"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="accent-olive"
                      />
                      {t("saveAddress")}
                    </label>
                    {saveAddress && (
                      <div className="mt-3 max-w-xs">
                        <label htmlFor="co-addr-title" className={labelCls}>{t("addressTitleLabel")}</label>
                        <input
                          id="co-addr-title"
                          className={inputCls}
                          placeholder={t("addressTitlePh")}
                          value={addressTitle}
                          onChange={(e) => setAddressTitle(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Kayıtlı adres seçiliyken e-posta yine gerekli */}
              {selectedAddress !== "new" && addresses.length > 0 && (
                <div className="mt-5 max-w-sm">
                  <label htmlFor="co-email2" className={labelCls}>{t("email")}</label>
                  <input id="co-email2" className={inputCls} type="email" value={form.email} onChange={setF("email")} autoComplete="email" />
                </div>
              )}

              <div aria-live="polite">
                {formError && <p className="mt-4 text-[12px] text-[#a04545]">{formError}</p>}
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
                <Link href="/sepet" className="text-[13px] font-medium text-ink-soft transition-colors hover:text-gold">
                  ← {t("backToCart")}
                </Link>
                <button
                  type="button"
                  onClick={handleContinue}
                  className="bg-olive px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-olive-deep"
                >
                  {t("continueToPayment")} →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Ödeme yöntemi */}
              <div className="border border-line bg-cream-light p-5 sm:p-7">
                <h1 className="flex items-center gap-2.5 text-[15px] font-semibold uppercase tracking-[0.12em] text-ink">
                  {t("paymentTitle")}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-ink-soft">
                    <rect x="5" y="11" width="14" height="9" />
                    <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
                  </svg>
                </h1>
                <p className="mt-1.5 text-[12px] text-ink-soft">{t("sslAll")}</p>

                {/* Kredi kartı */}
                <div className={`mt-5 border transition-colors ${method === "card" ? "border-olive bg-white" : "border-line bg-white/50"}`}>
                  <label className="flex cursor-pointer items-center justify-between gap-3 p-4">
                    <span className="flex items-center gap-3">
                      <input type="radio" name="paym" checked={method === "card"} onChange={() => setMethod("card")} className="accent-olive" />
                      <span className="text-sm font-semibold text-ink">{t("methodCard")}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-soft" aria-hidden="true">
                      <span className="border border-line bg-white px-1.5 py-0.5 text-[#1A1F71]">VISA</span>
                      <span className="border border-line bg-white px-1.5 py-0.5 text-[#EB001B]">MC</span>
                      <span className="border border-line bg-white px-1.5 py-0.5 text-[#00457C]">troy</span>
                    </span>
                  </label>
                  {method === "card" && (
                    <div className="grid gap-4 border-t border-line p-4 sm:grid-cols-2 sm:p-5">
                      <div className="sm:col-span-2">
                        <label htmlFor="cc-name" className={labelCls}>{t("cardName")}</label>
                        <input id="cc-name" className={inputCls} placeholder={t("cardNamePh")} value={card.name} onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))} autoComplete="cc-name" />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="cc-number" className={labelCls}>{t("cardNumber")}</label>
                        <input id="cc-number" className={inputCls} placeholder="0000 0000 0000 0000" value={card.number} onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))} autoComplete="cc-number" inputMode="numeric" />
                      </div>
                      <div>
                        <label htmlFor="cc-expiry" className={labelCls}>{t("expiry")}</label>
                        <input id="cc-expiry" className={inputCls} placeholder="MM / YY" value={card.expiry} onChange={(e) => setCard((c) => ({ ...c, expiry: e.target.value }))} autoComplete="cc-exp" inputMode="numeric" />
                      </div>
                      <div>
                        <label htmlFor="cc-cvv" className={labelCls}>{t("cvv")}</label>
                        <input id="cc-cvv" className={inputCls} placeholder="123" value={card.cvv} onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value }))} autoComplete="cc-csc" inputMode="numeric" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="flex cursor-pointer items-start gap-2.5 text-[13px] text-ink">
                          <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} className="mt-0.5 accent-olive" />
                          <span>
                            <span className="block font-medium">{t("saveCard")}</span>
                            <span className="block text-[12px] text-ink-soft">{t("saveCardSub")}</span>
                          </span>
                        </label>
                      </div>
                      <p className="text-[11px] leading-relaxed text-ink-soft sm:col-span-2">
                        {t("cardTestNote")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Havale / EFT */}
                <div className={`mt-3 border transition-colors ${method === "bank_transfer" ? "border-olive bg-white" : "border-line bg-white/50"}`}>
                  <label className="flex cursor-pointer items-start gap-3 p-4">
                    <input type="radio" name="paym" checked={method === "bank_transfer"} onChange={() => setMethod("bank_transfer")} className="mt-0.5 accent-olive" />
                    <span>
                      <span className="block text-sm font-semibold text-ink">{t("methodBank")}</span>
                      <span className="mt-0.5 block text-[12px] text-ink-soft">{t("methodBankSub")}</span>
                    </span>
                  </label>
                  {method === "bank_transfer" && (
                    <p className="border-t border-line p-4 text-[12px] leading-relaxed text-ink-soft">
                      {t("bankNote")}
                    </p>
                  )}
                </div>

                {/* Kapıda ödeme */}
                <div className={`mt-3 border transition-colors ${method === "cod" ? "border-olive bg-white" : "border-line bg-white/50"}`}>
                  <label className="flex cursor-pointer items-start gap-3 p-4">
                    <input type="radio" name="paym" checked={method === "cod"} onChange={() => setMethod("cod")} className="mt-0.5 accent-olive" />
                    <span>
                      <span className="block text-sm font-semibold text-ink">{t("methodCod")}</span>
                      <span className="mt-0.5 block text-[12px] text-ink-soft">{t("methodCodSub")}</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Fatura bilgileri */}
              <div className="border border-line bg-cream-light p-5 sm:p-7">
                <h2 className="text-[14px] font-semibold uppercase tracking-[0.12em] text-ink">
                  {t("billingTitle")}
                </h2>
                <div className="mt-4 space-y-2.5">
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
                    <input type="radio" name="billing" checked={billingSame} onChange={() => setBillingSame(true)} className="accent-olive" />
                    {t("billingSame")}
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
                    <input type="radio" name="billing" checked={!billingSame} onChange={() => setBillingSame(false)} className="accent-olive" />
                    {t("billingDiff")}
                  </label>
                </div>
                {!billingSame && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="bill-name" className={labelCls}>{t("billingName")}</label>
                      <input id="bill-name" className={inputCls} value={billing.name} onChange={(e) => setBilling((b) => ({ ...b, name: e.target.value }))} />
                    </div>
                    <div>
                      <label htmlFor="bill-address" className={labelCls}>{t("billingAddress")}</label>
                      <input id="bill-address" className={inputCls} value={billing.address} onChange={(e) => setBilling((b) => ({ ...b, address: e.target.value }))} />
                    </div>
                  </div>
                )}
              </div>

              <div aria-live="polite">
                {orderError && <p className="text-[12px] text-[#a04545]">{orderError}</p>}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep("shipping")}
                  className="text-[13px] font-medium text-ink-soft transition-colors hover:text-gold"
                >
                  ← {t("back")}
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="bg-olive px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-olive-deep disabled:opacity-60"
                >
                  {placing ? t("placing") : `${t("placeOrder")} →`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Sağ: sipariş özeti ── */}
        <aside className="space-y-5 self-start lg:sticky lg:top-6">
          <div className="border border-line bg-cream-light p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[14px] font-semibold uppercase tracking-[0.12em] text-ink">
                {t("summaryTitle")}
              </h2>
              <Link href="/sepet" className="text-[12px] text-ink-soft underline-offset-4 hover:text-gold hover:underline">
                {t("editCart")}
              </Link>
            </div>

            <ul className="mt-5 space-y-4">
              {items.map((item) => (
                <li key={item.slug} className="flex items-center gap-3.5">
                  <span
                    className="relative block h-16 w-14 shrink-0 bg-parchment bg-cover bg-center"
                    style={{ backgroundImage: "url('/images/urun-fon.webp')" }}
                  >
                    <Image
                      src={`/images/products/${item.slug}.webp`}
                      alt={item.name}
                      width={877}
                      height={900}
                      sizes="56px"
                      className="h-full w-full object-contain p-1"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-ink">{item.name}</span>
                    <span className="block text-[11px] text-ink-soft">{item.size}</span>
                    <span className="mt-0.5 block text-[13px] font-medium text-ink">{formatPrice(item.price)}</span>
                  </span>
                  <span className="text-[12px] text-ink-soft">× {item.qty}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">{tc("subtotal")}</dt>
                <dd className="font-medium text-ink">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">{tc("shipping")}</dt>
                <dd className={shippingCost === 0 ? "font-medium text-[#4a7a3a]" : "font-medium text-ink"}>
                  {shippingCost === 0 ? tc("free") : formatPrice(shippingCost)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">{tc("discount")}</dt>
                <dd className="font-medium text-ink">
                  {discount > 0 ? `− ${formatPrice(discount)}` : "-"}
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
              <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink">{tc("total")}</span>
              <span className="font-display text-2xl text-olive">{formatPrice(total)}</span>
            </div>
            <p className="mt-1 text-[11px] text-ink-soft">{tc("vatIncluded")}</p>
          </div>

          {/* Avantaj listesi */}
          <div className="space-y-5 border border-line bg-cream-light p-6">
            {(
              [
                [tc("freeShippingTitle"), null, "M1.5 6h12v11h-12zM13.5 9h4.5l3 3.5V17h-7.5"],
                [tc("perkSameDay"), tc("perkSameDaySub"), "M12 7v5l3 2M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9Z"],
                [tc("perkReturn"), tc("perkReturnSub"), "M3 12a9 9 0 1 0 3-6.7M3 4.5V9h4.5"],
                [tc("perkSecure"), tc("perkSecureSub"), "M12 2.5 4.5 5.5v6c0 4.7 3.2 8 7.5 10 4.3-2 7.5-5.3 7.5-10v-6L12 2.5Z"],
              ] as const
            ).map(([title, sub, path]) => (
              <div key={title} className="flex items-start gap-3.5">
                <span className="mt-0.5 text-ink-soft" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d={path} />
                  </svg>
                </span>
                <span>
                  <span className="block text-[13px] font-semibold text-ink">{title}</span>
                  {sub && <span className="block text-[12px] text-ink-soft">{sub}</span>}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className="mt-10">
        <PerksBand />
      </div>
    </div>
  );
}
