import { Product, Category } from '@/types/erp.types';
import jsPDF from 'jspdf';
import logoImg from '@/assets/sem coraçao.png';

export type ImageFormat = 'square' | 'story' | 'feed' | 'banner';

export type BannerTemplate = 
  | 'Luxo'
  | 'Minimalista'
  | 'Pink'
  | 'Black'
  | 'Premium'
  | 'Neon'
  | 'Promoção'
  | 'Oferta'
  | 'Lançamento'
  | 'Últimas Unidades'
  | 'Mais Vendido';

// Helper to load image safely onto canvas
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Fallback placeholder image if URL fails
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = 400;
      fallbackCanvas.height = 400;
      const ctx = fallbackCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#2A1021';
        ctx.fillRect(0, 0, 400, 400);
        ctx.fillStyle = '#EC0E78';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PINK PULSE', 200, 190);
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('PRODUTO EXCLUSIVO', 200, 220);
      }
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.src = fallbackCanvas.toDataURL();
    };
    img.src = url || logoImg.src;
  });
};

// Rounded rectangle helper for 2D Canvas
const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

// Canvas text wrapping helper
const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 2
): number => {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let linesCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && n > 0) {
      linesCount++;
      if (linesCount === maxLines) {
        ctx.fillText(line.trim() + '...', x, currentY);
        return currentY + lineHeight;
      }
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  linesCount++;
  ctx.fillText(line.trim(), x, currentY);
  return currentY + lineHeight;
};

// ============================================================================
// PURE CANVAS CATALOG PAGE GENERATOR (100% Independent of DOM / CSS / html2canvas)
// ============================================================================
export async function generateCatalogPageCanvas(
  products: Product[],
  pageIndex: number,
  totalPages: number,
  categories: Category[]
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const width = 1600;
  const height = 2262; // Standard High Resolution A4 proportion (1:1.414)

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  // 1. Background Fill with Deep Dark Luxury Gradients
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#18181A');
  bgGrad.addColorStop(0.5, '#1E0E1B');
  bgGrad.addColorStop(1, '#121215');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Decorative Top Ambient Pink Glow
  const glow = ctx.createRadialGradient(width / 2, 200, 50, width / 2, 200, 700);
  glow.addColorStop(0, 'rgba(236, 14, 120, 0.18)');
  glow.addColorStop(1, 'rgba(236, 14, 120, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Outer Page Margin Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 3;
  roundRect(ctx, 40, 40, width - 80, height - 80, 28);
  ctx.stroke();

  // 2. Load Logo Image
  const logo = await loadImage(logoImg.src);

  // 3. Header Section (Y: 60 - 180) - Centered Logo with transparent background
  const logoAspect = logo.width / logo.height;
  let logoDrawH = 110;
  let logoDrawW = logoDrawH * logoAspect;
  if (logoDrawW > 450) {
    logoDrawW = 450;
    logoDrawH = logoDrawW / logoAspect;
  }
  const logoDrawX = (width - logoDrawW) / 2;
  const logoDrawY = 60 + (110 - logoDrawH) / 2;

  // Draw logo image directly on transparent background
  ctx.drawImage(logo, logoDrawX, logoDrawY, logoDrawW, logoDrawH);

  // Right Header Text
  ctx.textAlign = 'right';
  ctx.fillStyle = '#FF4FA0';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('ERP PREMIUM', width - 80, 105);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '18px sans-serif';
  ctx.fillText(`Página ${pageIndex + 1} de ${totalPages}`, width - 80, 137);

  // Header Divider Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 185);
  ctx.lineTo(width - 80, 185);
  ctx.stroke();

  // 4. Products Grid Section (4 Columns x 2 Rows = 8 Products)
  const cols = 4;
  const cardGapX = 28;
  const cardGapY = 32;
  const startX = 80;
  const startY = 215;
  const cardWidth = (width - 160 - (cols - 1) * cardGapX) / cols; // ~340px
  const cardHeight = 900;

  // Pre-load images for products on this page
  const loadedProductImgs = await Promise.all(
    products.map(p => loadImage(p.image_url || ''))
  );

  const getCategoryName = (id?: string) => {
    if (!id) return 'Acessórios';
    return categories.find(c => c.id === id)?.name || 'Geral';
  };

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const pImg = loadedProductImgs[i];

    const colIndex = i % cols;
    const rowIndex = Math.floor(i / cols);

    const cX = startX + colIndex * (cardWidth + cardGapX);
    const cY = startY + rowIndex * (cardHeight + cardGapY);

    // Card Background Box
    ctx.fillStyle = '#18181A';
    roundRect(ctx, cX, cY, cardWidth, cardHeight, 22);
    ctx.fill();

    // Card Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    roundRect(ctx, cX, cY, cardWidth, cardHeight, 22);
    ctx.stroke();

    // Photo Box Container
    const photoMargin = 16;
    const photoSize = cardWidth - photoMargin * 2; // ~308px
    const photoX = cX + photoMargin;
    const photoY = cY + photoMargin;

    ctx.fillStyle = '#111113';
    roundRect(ctx, photoX, photoY, photoSize, photoSize, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, photoX, photoY, photoSize, photoSize, 16);
    ctx.stroke();

    // Draw Image inside Photo Box with aspect cover
    ctx.save();
    roundRect(ctx, photoX, photoY, photoSize, photoSize, 16);
    ctx.clip();

    const imgAspect = pImg.width / pImg.height;
    let dW = photoSize;
    let dH = photoSize;
    let dX = photoX;
    let dY = photoY;

    if (imgAspect > 1) {
      dW = photoSize * imgAspect;
      dX = photoX - (dW - photoSize) / 2;
    } else {
      dH = photoSize / imgAspect;
      dY = photoY - (dH - photoSize) / 2;
    }

    ctx.drawImage(pImg, dX, dY, dW, dH);
    ctx.restore();

    // Highlight / Stock Badge on Photo Top Left
    let badgeLabel = 'DESTAQUE';
    if (product.stock <= 0) badgeLabel = 'ESGOTADO';
    else if (product.stock <= product.min_stock) badgeLabel = 'ÚLTIMAS UNIDADES';
    else if (Number(product.buy_price || 0) > 0 && Number(product.sell_price || 0) < Number(product.buy_price || 0) * 1.2) badgeLabel = 'PROMOÇÃO';

    ctx.fillStyle = 'rgba(236, 14, 120, 0.9)';
    roundRect(ctx, photoX + 12, photoY + 12, 130, 28, 8);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(badgeLabel, photoX + 77, photoY + 30);

    // Product Name
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'extrabold 22px "Plus Jakarta Sans", sans-serif';
    const textEndY = wrapText(
      ctx,
      product.name || 'Produto Sem Nome',
      cX + 20,
      photoY + photoSize + 32,
      cardWidth - 40,
      28,
      2
    );

    // Formatted Price
    const formattedPrice = `R$ ${Number(product.sell_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    ctx.fillStyle = '#FF4FA0';
    ctx.font = 'extrabold 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(formattedPrice, cX + 20, textEndY + 18);

    // Description Snippet
    const desc = product.description || 'Produto exclusivo com acabamento e durabilidade de altíssimo padrão.';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.font = '400 16px sans-serif';
    wrapText(
      ctx,
      desc,
      cX + 20,
      textEndY + 54,
      cardWidth - 40,
      22,
      3
    );

    // Card Footer Divider
    const footerDividerY = cY + cardHeight - 55;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cX + 20, footerDividerY);
    ctx.lineTo(cX + cardWidth - 20, footerDividerY);
    ctx.stroke();

    // Category Name & SKU
    const catName = getCategoryName(product.category_id);
    const skuCode = product.sku ? ` • SKU: ${product.sku}` : '';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`${catName.toUpperCase()}${skuCode}`, cX + 20, footerDividerY + 28);
  }

  // 5. Footer Section (Y: 2100 - 2220)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 2120);
  ctx.lineTo(width - 80, 2120);
  ctx.stroke();

  // Footer Text Left
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('PINK PULSE ERP • CATÁLOGO OFICIAL DE VENDAS', 80, 2170);

  // Footer Text Right
  ctx.textAlign = 'right';
  ctx.fillText('PRODUTOS DISPONÍVEIS MEDIANTE CONSULTA', width - 80, 2170);

  return canvas;
}

// ============================================================================
// EXPORT FUNCTIONS (PNG, JPG, PDF)
// ============================================================================

export async function exportCatalogAsPNG(
  products: Product[],
  categories: Category[],
  pageIndex: number = 0
): Promise<void> {
  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE) || 1;
  const pageProducts = products.slice(pageIndex * ITEMS_PER_PAGE, (pageIndex + 1) * ITEMS_PER_PAGE);

  const canvas = await generateCatalogPageCanvas(pageProducts, pageIndex, totalPages, categories);
  const dataUrl = canvas.toDataURL('image/png');

  downloadDataUrl(dataUrl, `catalogo-pink-pulse-pagina-${pageIndex + 1}.png`);
}

export async function exportCatalogAsJPG(
  products: Product[],
  categories: Category[],
  pageIndex: number = 0
): Promise<void> {
  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE) || 1;
  const pageProducts = products.slice(pageIndex * ITEMS_PER_PAGE, (pageIndex + 1) * ITEMS_PER_PAGE);

  const canvas = await generateCatalogPageCanvas(pageProducts, pageIndex, totalPages, categories);
  const dataUrl = canvas.toDataURL('image/jpeg', 1.0); // 100% Quality JPG

  downloadDataUrl(dataUrl, `catalogo-pink-pulse-pagina-${pageIndex + 1}.jpg`);
}

export async function exportCatalogAsPDF(
  products: Product[],
  categories: Category[],
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE) || 1;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  for (let i = 0; i < totalPages; i++) {
    if (onProgress) onProgress(i + 1, totalPages);

    const pageProducts = products.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE);
    const canvas = await generateCatalogPageCanvas(pageProducts, i, totalPages, categories);
    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    // Standard A4 dimensions in mm: 210 x 297
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  }

  pdf.save('catalogo-pink-pulse-oficial.pdf');
}

// Main generator for Social Media Graphics (1080x1080, 1080x1920, 1080x1350)
export async function generateSocialGraphic(
  product: Product,
  format: 'square' | 'story' | 'feed',
  options?: { badgeText?: string; qrCodeUrl?: string }
): Promise<string> {
  const canvas = document.createElement('canvas');
  let width = 1080;
  let height = 1080;

  if (format === 'story') {
    height = 1920;
  } else if (format === 'feed') {
    height = 1350;
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  // Load product image
  const productImg = await loadImage(product.image_url || '');

  // Background Gradient
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  if (format === 'story') {
    bgGradient.addColorStop(0, '#120810');
    bgGradient.addColorStop(0.4, '#1F0D19');
    bgGradient.addColorStop(0.8, '#2D0A22');
    bgGradient.addColorStop(1, '#111113');
  } else {
    bgGradient.addColorStop(0, '#18181A');
    bgGradient.addColorStop(0.5, '#220B1D');
    bgGradient.addColorStop(1, '#120712');
  }
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Decorative ambient glow
  const glow = ctx.createRadialGradient(width / 2, height * 0.35, 50, width / 2, height * 0.35, width * 0.6);
  glow.addColorStop(0, 'rgba(236, 14, 120, 0.25)');
  glow.addColorStop(1, 'rgba(236, 14, 120, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Header Brand Tag
  ctx.fillStyle = '#EC0E78';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('P I N K   P U L S E', width / 2, format === 'story' ? 140 : 100);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '500 20px sans-serif';
  ctx.fillText('CATÁLOGO EXCLUSIVO ERP', width / 2, format === 'story' ? 180 : 135);

  // Divider Line
  ctx.strokeStyle = 'rgba(236, 14, 120, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 120, format === 'story' ? 205 : 155);
  ctx.lineTo(width / 2 + 120, format === 'story' ? 205 : 155);
  ctx.stroke();

  // Product Image Frame
  let photoY = format === 'story' ? 260 : (format === 'feed' ? 200 : 180);
  let photoSize = format === 'story' ? 680 : (format === 'feed' ? 620 : 540);
  let photoX = (width - photoSize) / 2;

  // Frame Background card
  ctx.fillStyle = '#1A1A1E';
  ctx.shadowColor = 'rgba(236, 14, 120, 0.35)';
  ctx.shadowBlur = 40;

  roundRect(ctx, photoX, photoY, photoSize, photoSize, 32);
  ctx.fill();
  ctx.shadowBlur = 0; // reset shadow

  // Frame Border
  ctx.strokeStyle = 'rgba(236, 14, 120, 0.6)';
  ctx.lineWidth = 4;
  roundRect(ctx, photoX, photoY, photoSize, photoSize, 32);
  ctx.stroke();

  // Draw product photo inside clip
  ctx.save();
  roundRect(ctx, photoX + 8, photoY + 8, photoSize - 16, photoSize - 16, 26);
  ctx.clip();

  // Cover aspect ratio draw
  const imgAspect = productImg.width / productImg.height;
  let drawW = photoSize - 16;
  let drawH = photoSize - 16;
  let drawX = photoX + 8;
  let drawY = photoY + 8;

  if (imgAspect > 1) {
    drawW = (photoSize - 16) * imgAspect;
    drawX = photoX + 8 - (drawW - (photoSize - 16)) / 2;
  } else {
    drawH = (photoSize - 16) / imgAspect;
    drawY = photoY + 8 - (drawH - (photoSize - 16)) / 2;
  }

  ctx.drawImage(productImg, drawX, drawY, drawW, drawH);
  ctx.restore();

  // Badge Tag if available
  const badgeText = options?.badgeText || (product.stock <= product.min_stock ? '⚠ ÚLTIMAS UNIDADES' : '🔥 DESTAQUE');
  ctx.fillStyle = '#EC0E78';
  roundRect(ctx, photoX + 30, photoY + 30, 220, 48, 14);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, photoX + 140, photoY + 61);

  // Content Below Photo
  let contentY = photoY + photoSize + (format === 'story' ? 70 : 60);

  // Product Name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 42px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';

  // Wrap product name if long
  const name = product.name || 'Produto Sem Nome';
  if (name.length > 28) {
    const line1 = name.substring(0, 26) + '...';
    ctx.fillText(line1, width / 2, contentY);
    contentY += 50;
  } else {
    ctx.fillText(name, width / 2, contentY);
    contentY += 55;
  }

  // Formatted Price
  const priceFormatted = `R$ ${Number(product.sell_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  
  // Price pill badge
  const priceWidth = 320;
  const priceHeight = 72;
  const priceX = (width - priceWidth) / 2;
  
  const priceGrad = ctx.createLinearGradient(priceX, contentY, priceX + priceWidth, contentY + priceHeight);
  priceGrad.addColorStop(0, '#EC0E78');
  priceGrad.addColorStop(1, '#FF4FA0');
  ctx.fillStyle = priceGrad;
  roundRect(ctx, priceX, contentY, priceWidth, priceHeight, 20);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'extrabold 36px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(priceFormatted, width / 2, contentY + 48);

  contentY += priceHeight + 40;

  // Description / Subtitle
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = '400 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✨ Qualidade Superior • Envio 100% Discreto • Pronta Entrega', width / 2, contentY);

  // Footer CTA
  if (format === 'story') {
    contentY += 120;

    // Call to Action Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = 'rgba(236, 14, 120, 0.4)';
    ctx.lineWidth = 2;
    roundRect(ctx, 140, height - 220, width - 280, 110, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FF4FA0';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('💬 FALE CONOSCO NO WHATSAPP', width / 2, height - 165);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '20px sans-serif';
    ctx.fillText('Peça o seu agora mesmo com sigilo total', width / 2, height - 130);
  } else {
    // Footer for Square/Feed
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '18px sans-serif';
    ctx.fillText('Pink Pulse ERP • Atendimento VIP via WhatsApp', width / 2, height - 40);
  }

  return canvas.toDataURL('image/png');
}

// Banner Generator by Template Style
export async function generateBannerGraphic(
  product: Product,
  template: BannerTemplate
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630; // Standard Banner 1200x630 (Facebook/WhatsApp/Web)

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  const productImg = await loadImage(product.image_url || '');

  // Background style per template
  switch (template) {
    case 'Luxo': {
      const grad = ctx.createLinearGradient(0, 0, 1200, 630);
      grad.addColorStop(0, '#0F0B10');
      grad.addColorStop(0.5, '#1F0D19');
      grad.addColorStop(1, '#0B080C');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 630);

      // Gold-Pink Accent lines
      ctx.strokeStyle = 'rgba(236, 14, 120, 0.5)';
      ctx.lineWidth = 3;
      roundRect(ctx, 30, 30, 1140, 570, 24);
      ctx.stroke();
      break;
    }
    case 'Pink': {
      const grad = ctx.createLinearGradient(0, 0, 1200, 630);
      grad.addColorStop(0, '#EC0E78');
      grad.addColorStop(1, '#8B0D4E');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 630);
      break;
    }
    case 'Black': {
      ctx.fillStyle = '#09090B';
      ctx.fillRect(0, 0, 1200, 630);
      // Neon pink top & bottom lines
      ctx.fillStyle = '#EC0E78';
      ctx.fillRect(0, 0, 1200, 8);
      ctx.fillRect(0, 622, 1200, 8);
      break;
    }
    case 'Neon': {
      ctx.fillStyle = '#08030A';
      ctx.fillRect(0, 0, 1200, 630);

      // Neon glow background circles
      const radial = ctx.createRadialGradient(200, 200, 10, 200, 200, 400);
      radial.addColorStop(0, 'rgba(236, 14, 120, 0.4)');
      radial.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, 1200, 630);
      break;
    }
    case 'Promoção':
    case 'Oferta': {
      const grad = ctx.createLinearGradient(0, 0, 1200, 630);
      grad.addColorStop(0, '#2A081A');
      grad.addColorStop(1, '#11040A');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 630);
      break;
    }
    default: {
      const grad = ctx.createLinearGradient(0, 0, 1200, 630);
      grad.addColorStop(0, '#18181A');
      grad.addColorStop(1, '#230E1F');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 630);
      break;
    }
  }

  // Draw Product Photo on the Right side
  const photoSize = 480;
  const photoX = 660;
  const photoY = 75;

  ctx.fillStyle = '#1A1A1E';
  roundRect(ctx, photoX, photoY, photoSize, photoSize, 28);
  ctx.fill();

  ctx.strokeStyle = '#EC0E78';
  ctx.lineWidth = 3;
  roundRect(ctx, photoX, photoY, photoSize, photoSize, 28);
  ctx.stroke();

  ctx.save();
  roundRect(ctx, photoX + 6, photoY + 6, photoSize - 12, photoSize - 12, 22);
  ctx.clip();
  ctx.drawImage(productImg, photoX + 6, photoY + 6, photoSize - 12, photoSize - 12);
  ctx.restore();

  // Left Content Column
  ctx.textAlign = 'left';

  // Brand Badge
  ctx.fillStyle = '#EC0E78';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('PINK PULSE  •  ERP BANNER', 80, 110);

  // Template Title Badge
  const badgeTitleMap: Record<BannerTemplate, string> = {
    Luxo: '💎 EXCLUSIVIDADE & LUXO',
    Minimalista: '✨ COLEÇÃO ESSENCIAL',
    Pink: '💖 SEU MOMENTO PINK',
    Black: '🖤 EDIÇÃO LIMITADA',
    Premium: '🏆 ALTÍSSIMO PADRÃO',
    Neon: '⚡ TENDÊNCIA ABSOLUTA',
    Promoção: '🔥 SUPER PROMOÇÃO',
    Oferta: '🏷️ OFERTA IMPERDÍVEL',
    Lançamento: '🆕 NOVO LANÇAMENTO',
    'Últimas Unidades': '⚠ POUCAS UNIDADES EM ESTOQUE',
    'Mais Vendido': '⭐ CAMPEÃO DE VENDAS',
  };

  const badgeText = badgeTitleMap[template] || '✨ PRODUTO EM DESTAQUE';
  ctx.fillStyle = 'rgba(236, 14, 120, 0.2)';
  ctx.strokeStyle = '#EC0E78';
  ctx.lineWidth = 1.5;
  roundRect(ctx, 80, 140, 380, 44, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(badgeText, 100, 168);

  // Product Name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'extrabold 38px "Plus Jakarta Sans", sans-serif';

  const name = product.name || 'Produto Especial';
  if (name.length > 22) {
    ctx.fillText(name.substring(0, 20) + '...', 80, 240);
  } else {
    ctx.fillText(name, 80, 240);
  }

  // Price Display
  const priceFormatted = `R$ ${Number(product.sell_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  
  ctx.fillStyle = '#EC0E78';
  ctx.font = 'extrabold 52px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(priceFormatted, 80, 330);

  // Subtitle / Guarantee
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = '400 20px sans-serif';
  ctx.fillText('📦 Produto 100% Original com Envio Discreto', 80, 390);

  // Call to Action Button
  ctx.fillStyle = '#EC0E78';
  roundRect(ctx, 80, 440, 320, 64, 18);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PEÇA NO WHATSAPP 💬', 240, 480);

  return canvas.toDataURL('image/png');
}

// Download Helper
export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
