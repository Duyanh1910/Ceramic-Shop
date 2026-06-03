export const toArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};
export const mergeUniqueTextList = (...sources) => [
  ...new Set(
    sources
      .flatMap((source) => toArray(source))
      .map((value) => String(value || "").trim())
      .filter(Boolean),
  ),
];
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

  mergeUniqueTextList(thuocTinhList.map(normalizeTextParam))
  .filter(Boolean)
  .forEach((thuocTinh) => {
    const likePattern = toLikePattern(thuocTinh);

    sql += `
      AND (
        EXISTS (
          SELECT 1
          FROM ChiTietBienThe ctt
          JOIN GiaTriThuocTinh gtt ON gtt.MaGiaTri = ctt.MaGiaTri
          WHERE ctt.MaBienThe = bt.MaBienThe
            AND (
              gtt.GiaTri = ?
              OR gtt.GiaTri LIKE ?
            )
        )
        OR bt.TenBienThe LIKE ?
      )
    `;

    params.push(thuocTinh, likePattern, likePattern);
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

const CAN_VALUES = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5];
const CHI_VALUES = [0, 0, 1, 1, 2, 2, 0, 0, 1, 1, 2, 2];

const MENH_VALUES = {
  1: "Kim",
  2: "Thủy",
  3: "Hỏa",
  4: "Thổ",
  5: "Mộc",
};

export const getMenhByBirthYear = (birthYear) => {
  const year = Number(birthYear);

  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    return null;
  }

  const canValue = CAN_VALUES[(year - 4) % 10];
  const chiValue = CHI_VALUES[(year - 4) % 12];

  let menhValue = canValue + chiValue;

  if (menhValue > 5) {
    menhValue -= 5;
  }

  return MENH_VALUES[menhValue] || null;
};

export const extractBirthYear = ({ namSinh, queryText }) => {
  if (namSinh) {
    const value = Array.isArray(namSinh) ? namSinh[0] : namSinh;
    const year = Number(value);

    if (Number.isInteger(year) && year >= 1900 && year <= 2100) {
      return year;
    }
  }

  const text = String(queryText || "");

  const explicitYearMatch = text.match(
    /(?:sinh\s*năm|năm\s*sinh|sn|sinh\s*nam|nam\s*sinh)\s*(19\d{2}|20\d{2}|2100)\b/i,
  );

  if (explicitYearMatch) {
    return Number(explicitYearMatch[1]);
  }

  return null;
};

export const extractBudgetAmount = ({ nganSachRaw, queryText, birthYear }) => {
  const text = String(queryText || "").toLowerCase();

  const parseDecimalNumber = (value) => {
    return parseFloat(String(value).replace(",", "."));
  };

  const parseVndNumber = (value) => {
    const normalizedValue = String(value).replace(/[.,\s]/g, "");
    const numberValue = Number(normalizedValue);

    return Number.isNaN(numberValue) ? 0 : numberValue;
  };

  const regexTrieu =
    /(\d+(?:[\.,]\d+)?)\s*(triệu|tr|củ)(?=$|[\s,.!?;:])/i;

  const regexNgan =
    /(\d+(?:[\.,]\d+)?)\s*(k|ngàn|nghìn)(?=$|[\s,.!?;:])/i;

  const regexVnd =
    /(\d+(?:[\.,]\d+)*)\s*(đ|₫|vnd|vnđ|đồng|dong)(?=$|[\s,.!?;:])/i;

  const matchTrieu = text.match(regexTrieu);
  const matchNgan = text.match(regexNgan);
  const matchVnd = text.match(regexVnd);

  if (matchTrieu) {
    const so = parseDecimalNumber(matchTrieu[1]);
    return so * 1000000;
  }

  if (matchNgan) {
    const so = parseDecimalNumber(matchNgan[1]);
    return so * 1000;
  }

  if (matchVnd) {
    return parseVndNumber(matchVnd[1]);
  }

  if (!nganSachRaw) return 0;

  const rawValue = Array.isArray(nganSachRaw) ? nganSachRaw[0] : nganSachRaw;
  const so = Number(rawValue);

  if (Number.isNaN(so)) return 0;

  const isBirthYear = birthYear && Number(birthYear) === so;

  if (isBirthYear) return 0;

  const hasBudgetKeyword =
    /(ngân sách|tài chính|tầm|khoảng|dưới|duoi|tối đa|toi da|không quá|khong qua|giá|gia|tiền|tien)/i.test(
      text,
    );

  if (!hasBudgetKeyword) return 0;

  if (so < 30) {
    return so * 1000000;
  }

  if (so >= 30 && so <= 10000) {
    return so * 1000;
  }

  return so;
};

const normalizeNeedText = (value) => {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
};

const hasAnyKeyword = (text, keywords) => {
  return keywords.some((keyword) => text.includes(keyword));
};

const SHOPPING_NEED_RULES = [
  {
    displayText: "quà tân gia",
    keywords: ["tan gia", "mung nha moi", "nha moi"],
    searchKeywords: ["Bộ ấm trà", "Bộ đồ ăn", "Bình hoa", "Lục bình"],
  },
  {
    displayText: "quà biếu sang trọng",
    keywords: [
      "bieu sep",
      "bieu tang",
      "qua bieu",
      "doi tac",
      "sang trong",
      "cao cap",
    ],
    searchKeywords: ["Bộ ấm trà", "Lục bình", "Tượng phong thủy", "Bình hoa"],
  },
  {
    displayText: "quà sinh nhật",
    keywords: ["sinh nhat"],
    searchKeywords: ["Bình hoa", "Bộ ấm trà", "Tượng gốm", "Khay mứt"],
  },
  {
    displayText: "quà cưới hỏi",
    keywords: ["cuoi", "cuoi hoi"],
    searchKeywords: ["Bộ đồ ăn", "Bộ ấm trà", "Bình hoa"],
  },
  {
    displayText: "quà tiếp khách",
    keywords: ["tiep khach"],
    searchKeywords: ["Bộ ấm trà", "Khay mứt"],
  },
  {
  displayText: "lục bình phong thủy",
  keywords: ["luc binh"],
  searchKeywords: ["Lục bình", "Đồ phong thủy"],
},
{
  displayText: "tượng phong thủy",
  keywords: ["tuong phong thuy"],
  searchKeywords: ["Tượng phong thủy", "Đồ phong thủy"],
},
{
  displayText: "đồ phong thủy",
  keywords: ["do phong thuy", "phong thuy", "tai loc", "vat pham"],
  searchKeywords: ["Đồ phong thủy", "Tượng phong thủy", "Lục bình"],
},
  {
    displayText: "đồ trang trí",
    keywords: ["phong khach", "decor", "trang tri"],
    searchKeywords: ["Đồ trang trí", "Bình hoa", "Tượng gốm", "Lục bình"],
  },
  {
    displayText: "đồ thờ cúng",
    keywords: ["tho cung", "do tho", "ban tho", "tam linh"],
    searchKeywords: ["Đồ thờ", "Bát hương", "Mâm bồng"],
  },
  {
    displayText: "đồ phòng bếp",
    keywords: ["phong bep", "nha bep", "an uong", "ban an", "bua com"],
    searchKeywords: [
      "Đồ phòng bếp",
      "Bộ đồ ăn",
      "Nồi sứ / Chảo sứ",
      "Muỗng sứ / Đũa sứ",
    ],
  },
  {
    displayText: "nhu cầu quà tặng",
    keywords: ["qua", "tang", "bieu"],
    searchKeywords: [
      "Bộ ấm trà",
      "Bình hoa",
      "Khay mứt",
      "Bộ đồ ăn",
      "Tượng phong thủy",
      "Lục bình",
    ],
  },
];

const findShoppingNeedRule = (text) => {
  return SHOPPING_NEED_RULES.find((rule) =>
    hasAnyKeyword(text, rule.keywords),
  );
};

export const resolveShoppingNeedSearch = ({
  danhMucRaw = "",
  queryText = "",
}) => {
  const rawCategory = String(danhMucRaw || "").trim();
  const normalizedCategory = normalizeNeedText(rawCategory);
  const normalizedText = normalizeNeedText(`${rawCategory} ${queryText || ""}`);

  if (rawCategory) {
    const categoryRule = findShoppingNeedRule(normalizedCategory);

    if (categoryRule) {
      return {
        searchKeywords: categoryRule.searchKeywords,
        searchKeyword: categoryRule.searchKeywords[0] || "",
        displayText: categoryRule.displayText,
        isNeed: true,
      };
    }

    return {
      searchKeywords: [rawCategory],
      searchKeyword: rawCategory,
      displayText: rawCategory,
      isNeed: false,
    };
  }

  const textRule = findShoppingNeedRule(normalizedText);

  if (textRule) {
    return {
      searchKeywords: textRule.searchKeywords,
      searchKeyword: textRule.searchKeywords[0] || "",
      displayText: textRule.displayText,
      isNeed: true,
    };
  }

  return {
    searchKeywords: [],
    searchKeyword: "",
    displayText: "",
    isNeed: false,
  };
};

export const resolveFengShuiCategorySearch = resolveShoppingNeedSearch;

export const buildCategorySearchCondition = ({ searchKeywords = [] }) => {
  const keywords = [
    ...new Set(
      toArray(searchKeywords)
        .map((keyword) => String(keyword || "").trim())
        .filter(Boolean),
    ),
  ];

  if (keywords.length === 0) {
    return { sql: "", params: [] };
  }

  const params = [];
  const conditions = keywords.map((keyword) => {
    const searchValue = `%${keyword.replace(/\s+/g, "%")}%`;

    params.push(searchValue, searchValue, searchValue);

    return `
      (
        dm.TenDanhMuc LIKE ?
        OR dm_parent.TenDanhMuc LIKE ?
        OR sp.TenSanPham LIKE ?
      )
    `;
  });

  return {
    sql: ` AND (${conditions.join(" OR ")})`,
    params,
  };
};
