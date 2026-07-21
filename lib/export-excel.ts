import ExcelJS from "exceljs/dist/exceljs.min.js";
import { formatTanggalWaktu } from "./format-waktu";

/**
 * Export data ke .xlsx dengan foto TERTANAM LANGSUNG di sel (bukan link teks).
 *
 * Sebelumnya export pakai library `xlsx` (SheetJS versi gratis) yang tidak bisa
 * menyisipkan gambar sama sekali — jadi kolom foto cuma berisi link URL mentah
 * yang harus dibuka satu-satu. Sekarang pakai `exceljs`: setiap kolom yang
 * namanya mengandung "foto"/"photo"/"gambar"/"selfie" dan berisi URL akan
 * di-fetch lalu ditempel sebagai gambar langsung di selnya.
 */

function isKolomFoto(namaKolom: string): boolean {
  return /foto|photo|gambar|selfie/i.test(namaKolom);
}

function isStringTanggalIso(nilai: unknown): nilai is string {
  return typeof nilai === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(nilai);
}

function isUrlFoto(nilai: unknown): nilai is string {
  return typeof nilai === "string" && /^https?:\/\//i.test(nilai);
}

type HasilFoto = { dataUrl: string; extension: "jpeg" | "png" | "gif" };

async function ambilFotoSebagaiDataUrl(url: string): Promise<HasilFoto | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();

    let extension: HasilFoto["extension"] = "jpeg";
    if (blob.type.includes("png")) extension = "png";
    else if (blob.type.includes("gif")) extension = "gif";

    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Gagal membaca foto"));
      reader.readAsDataURL(blob);
    });

    return { dataUrl, extension };
  } catch {
    // Foto gagal diambil (link mati/CORS) — baris tetap diexport, sel foto dikosongkan
    return null;
  }
}

export async function exportExcelDenganFoto(
  data: Record<string, unknown>[],
  namaFile: string,
  onProgress?: (selesai: number, total: number) => void
): Promise<void> {
  if (!data || data.length === 0) {
    throw new Error("Tidak ada data untuk diexport.");
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Data");

  const kolom = Object.keys(data[0]);
  const kolomFoto = kolom.filter(isKolomFoto);

  sheet.columns = kolom.map((k) => ({
    header: k,
    key: k,
    width: kolomFoto.includes(k) ? 16 : 22,
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2F8AF0" } };
  headerRow.alignment = { vertical: "middle" };

  const total = data.length * Math.max(kolomFoto.length, 1);
  let selesai = 0;

  for (let i = 0; i < data.length; i++) {
    const baris = data[i];
    const nilaiBaris: Record<string, unknown> = {};

    for (const k of kolom) {
      const v = baris[k];
      if (kolomFoto.includes(k)) {
        nilaiBaris[k] = ""; // teks link dikosongkan, diganti gambar di bawah
      } else if (isStringTanggalIso(v)) {
        nilaiBaris[k] = formatTanggalWaktu(v);
      } else {
        nilaiBaris[k] = (v as string | number | null | undefined) ?? "";
      }
    }

    const excelRow = sheet.addRow(nilaiBaris);
    const adaFotoDiBaris = kolomFoto.some((k) => isUrlFoto(baris[k]));
    if (adaFotoDiBaris) excelRow.height = 72;

    for (const k of kolomFoto) {
      const url = baris[k];
      if (!isUrlFoto(url)) {
        selesai++;
        onProgress?.(selesai, total);
        continue;
      }

      const foto = await ambilFotoSebagaiDataUrl(url);
      selesai++;
      onProgress?.(selesai, total);
      if (!foto) continue;

      const imageId = workbook.addImage({
        base64: foto.dataUrl,
        extension: foto.extension,
      });

      const colIndex = kolom.indexOf(k);
      sheet.addImage(imageId, {
        tl: { col: colIndex, row: excelRow.number - 1 },
        ext: { width: 96, height: 96 },
        editAs: "oneCell",
      });
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = `${namaFile}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}
