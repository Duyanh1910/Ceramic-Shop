export const toArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const normalizeTextParam = (value) => {
  if (!value) return "";

  return String(value)
    .replace(/màu/gi, "")
    .replace(/hợp mệnh/gi, "")
    .replace(/mệnh/gi, "")
    .replace(/\s+/g, " ")
    .trim();
};

const toLikePattern = (value) => {
  return `%${value.replace(/\s+/g, "%")}%`;
};

export const buildVariantAttributeFilter = ({
  thuocTinhList = [],
  menhList = [],
}) => {
  let sql = "";
  const params = [];

  thuocTinhList
    .map(normalizeTextParam)
    .filter(Boolean)
    .forEach((thuocTinh) => {
      sql += `
        AND EXISTS (
          SELECT 1
          FROM ChiTietBienThe ctt
          JOIN GiaTriThuocTinh gtt ON gtt.MaGiaTri = ctt.MaGiaTri
          WHERE ctt.MaBienThe = bt.MaBienThe
            AND (
              gtt.GiaTri = ?
              OR gtt.GiaTri LIKE ?
            )
        )
      `;

      params.push(thuocTinh, toLikePattern(thuocTinh));
    });

  menhList
    .map(normalizeTextParam)
    .filter(Boolean)
    .forEach((menh) => {
      sql += `
        AND EXISTS (
          SELECT 1
          FROM ChiTietBienThe ctt_menh
          JOIN GiaTriThuocTinh gtt_menh ON gtt_menh.MaGiaTri = ctt_menh.MaGiaTri
          JOIN ThuocTinh tt_menh ON tt_menh.MaThuocTinh = gtt_menh.MaThuocTinh
          WHERE ctt_menh.MaBienThe = bt.MaBienThe
            AND tt_menh.TenThuocTinh = 'Mệnh'
            AND (
              gtt_menh.GiaTri = ?
              OR gtt_menh.GiaTri LIKE ?
            )
        )
      `;

      params.push(menh, toLikePattern(menh));
    });

  return { sql, params };
};
export const extractCapacityAttributes = (queryText) => {
  if (!queryText) return [];

  const capacityMatches = String(queryText).matchAll(
    /(\d+(?:[\.,]\d+)?)\s*(lít|lit|l)(?=$|[\s,.!?;:])/gi,
  );

  return Array.from(capacityMatches).map((match) => {
    const value = match[1].replace(",", ".");
    return `${value}L`;
  });
};