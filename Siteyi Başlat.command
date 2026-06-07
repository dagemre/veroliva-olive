#!/bin/bash
# Veroliva — siteyi kendi bilgisayarında başlatır.
# Kullanım: Bu dosyaya çift tıkla. (İlk seferde sağ tık > Aç gerekebilir.)

cd "$(dirname "$0")"

# Node.js'i bul (Homebrew / standart kurulum yolları dahil)
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo "⚠️  Node.js yüklü değil. İndirme sayfası açılıyor..."
  open "https://nodejs.org/en/download"
  echo "Yeşil 'LTS' sürümünü indirip kur, sonra bu dosyaya tekrar çift tıkla."
  echo ""
  read -p "Kapatmak için Enter'a bas..."
  exit 1
fi

echo ""
echo "🫒 Veroliva sitesi hazırlanıyor..."
echo "   (İlk çalıştırmada paket kurulumu birkaç dakika sürebilir.)"
echo ""

npm install --no-audit --no-fund

echo ""
echo "✅ Site başlatılıyor — tarayıcı birazdan kendiliğinden açılacak."
echo "   Kapatmak için bu pencerede Ctrl+C yap veya pencereyi kapat."
echo ""

(sleep 6 && open "http://localhost:3000") &
npm run dev
