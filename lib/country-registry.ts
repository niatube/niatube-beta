 /**
 * ==========================================================
 * NiaTube Creator Economy™ (NCE)
 * Country Registry
 * ==========================================================
 */

export type CountryRecord = {
  isoCode: string;
  country: string;
  region:
    | "North Africa"
    | "West Africa"
    | "Central Africa"
    | "East Africa"
    | "Southern Africa"
    | "Diaspora";
  currencyCode: string;
  supportProfileCode: string;
};

export const COUNTRY_REGISTRY: CountryRecord[] = [

    
    // ---------- North Africa ----------
  {
    isoCode: "DZ",
    country: "Algeria",
    region: "North Africa",
    currencyCode: "DZD",
    supportProfileCode: "DZ_DZD",
    
  },
  {
    isoCode: "EG",
    country: "Egypt",
    region: "North Africa",
    currencyCode: "EGP",
    supportProfileCode: "EG_EGP",
    
  },
  {
    isoCode: "LY",
    country: "Libya",
    region: "North Africa",
    currencyCode: "LYD",
    supportProfileCode: "LY_LYD",
    
  },
  {
    isoCode: "MA",
    country: "Morocco",
    region: "North Africa",
    currencyCode: "MAD",
    supportProfileCode: "MA_MAD",
    
  },
  {
    isoCode: "SD",
    country: "Sudan",
    region: "North Africa",
    currencyCode: "SDG",
    supportProfileCode: "SD_SDG",
    
  },
  {
    isoCode: "TN",
    country: "Tunisia",
    region: "North Africa",
    currencyCode: "TND",
    supportProfileCode: "TN_TND",
    
  },

  // ---------- West Africa ----------
{
  isoCode: "BJ",
  country: "Benin",
  region: "West Africa",
  currencyCode: "XOF",
  supportProfileCode: "WA_XOF",

},
{
  isoCode: "BF",
  country: "Burkina Faso",
  region: "West Africa",
  currencyCode: "XOF",
  supportProfileCode: "WA_XOF",
  
},
{
  isoCode: "CI",
  country: "Côte d'Ivoire",
  region: "West Africa",
  currencyCode: "XOF",
  supportProfileCode: "WA_XOF",
  
},
{
  isoCode: "GW",
  country: "Guinea-Bissau",
  region: "West Africa",
  currencyCode: "XOF",
  supportProfileCode: "WA_XOF",
  
},
{
  isoCode: "ML",
  country: "Mali",
  region: "West Africa",
  currencyCode: "XOF",
  supportProfileCode: "WA_XOF",
  
},
{
  isoCode: "NE",
  country: "Niger",
  region: "West Africa",
  currencyCode: "XOF",
  supportProfileCode: "WA_XOF",
  
},
{
  isoCode: "SN",
  country: "Senegal",
  region: "West Africa",
  currencyCode: "XOF",
  supportProfileCode: "WA_XOF",
  
},
{
  isoCode: "TG",
  country: "Togo",
  region: "West Africa",
  currencyCode: "XOF",
  supportProfileCode: "WA_XOF",
  
},
{
  isoCode: "NG",
  country: "Nigeria",
  region: "West Africa",
  currencyCode: "NGN",
  supportProfileCode: "NG_NGN",
  
},
{
  isoCode: "GH",
  country: "Ghana",
  region: "West Africa",
  currencyCode: "GHS",
  supportProfileCode: "GH_GHS",
  
},
  // ---------- Central Africa ----------
{
  isoCode: "CM",
  country: "Cameroon",
  region: "Central Africa",
  currencyCode: "XAF",
  supportProfileCode: "CA_XAF",
  
},
{
  isoCode: "CF",
  country: "Central African Republic",
  region: "Central Africa",
  currencyCode: "XAF",
  supportProfileCode: "CA_XAF",
  
},
{
  isoCode: "TD",
  country: "Chad",
  region: "Central Africa",
  currencyCode: "XAF",
  supportProfileCode: "CA_XAF",
  
},
{
  isoCode: "CG",
  country: "Republic of the Congo",
  region: "Central Africa",
  currencyCode: "XAF",
  supportProfileCode: "CA_XAF",
  
},
{
  isoCode: "GQ",
  country: "Equatorial Guinea",
  region: "Central Africa",
  currencyCode: "XAF",
  supportProfileCode: "CA_XAF",
  
},
{
  isoCode: "GA",
  country: "Gabon",
  region: "Central Africa",
  currencyCode: "XAF",
  supportProfileCode: "CA_XAF",
  
},
{
  isoCode: "AO",
  country: "Angola",
  region: "Central Africa",
  currencyCode: "AOA",
  supportProfileCode: "AO_AOA",
  
},
{
  isoCode: "CD",
  country: "Democratic Republic of the Congo",
  region: "Central Africa",
  currencyCode: "CDF",
  supportProfileCode: "CD_CDF",
  
},
  

  // ---------- East Africa ----------
{
  isoCode: "BI",
  country: "Burundi",
  region: "East Africa",
  currencyCode: "BIF",
  supportProfileCode: "BI_BIF",
  
},
{
  isoCode: "DJ",
  country: "Djibouti",
  region: "East Africa",
  currencyCode: "DJF",
  supportProfileCode: "DJ_DJF",
  
},
{
  isoCode: "ER",
  country: "Eritrea",
  region: "East Africa",
  currencyCode: "ERN",
  supportProfileCode: "ER_ERN",
  
},
{
  isoCode: "ET",
  country: "Ethiopia",
  region: "East Africa",
  currencyCode: "ETB",
  supportProfileCode: "ET_ETB",
  
},
{
  isoCode: "KE",
  country: "Kenya",
  region: "East Africa",
  currencyCode: "KES",
  supportProfileCode: "KE_KES",
  
},
{
  isoCode: "RW",
  country: "Rwanda",
  region: "East Africa",
  currencyCode: "RWF",
  supportProfileCode: "RW_RWF",
  
},
{
  isoCode: "SO",
  country: "Somalia",
  region: "East Africa",
  currencyCode: "SOS",
  supportProfileCode: "SO_SOS",
  
},
{
  isoCode: "SS",
  country: "South Sudan",
  region: "East Africa",
  currencyCode: "SSP",
  supportProfileCode: "SS_SSP",
  
},
{
  isoCode: "TZ",
  country: "Tanzania",
  region: "East Africa",
  currencyCode: "TZS",
  supportProfileCode: "TZ_TZS",
  
},
{
  isoCode: "UG",
  country: "Uganda",
  region: "East Africa",
  currencyCode: "UGX",
  supportProfileCode: "UG_UGX",
  
},

 

  // ---------- Southern Africa ----------
{
  isoCode: "BW",
  country: "Botswana",
  region: "Southern Africa",
  currencyCode: "BWP",
  supportProfileCode: "BW_BWP",
  
},
{
  isoCode: "LS",
  country: "Lesotho",
  region: "Southern Africa",
  currencyCode: "LSL",
  supportProfileCode: "LS_LSL",
  
},
{
  isoCode: "MG",
  country: "Madagascar",
  region: "Southern Africa",
  currencyCode: "MGA",
  supportProfileCode: "MG_MGA",
  
},
{
  isoCode: "MW",
  country: "Malawi",
  region: "Southern Africa",
  currencyCode: "MWK",
  supportProfileCode: "MW_MWK",
  
},
{
  isoCode: "MZ",
  country: "Mozambique",
  region: "Southern Africa",
  currencyCode: "MZN",
  supportProfileCode: "MZ_MZN",
  
},
{
  isoCode: "NA",
  country: "Namibia",
  region: "Southern Africa",
  currencyCode: "NAD",
  supportProfileCode: "NA_NAD",
  
},
{
  isoCode: "ZA",
  country: "South Africa",
  region: "Southern Africa",
  currencyCode: "ZAR",
  supportProfileCode: "ZA_ZAR",
  },
{
  isoCode: "SZ",
  country: "Eswatini",
  region: "Southern Africa",
  currencyCode: "SZL",
  supportProfileCode: "SZ_SZL",
  
},
{
  isoCode: "ZM",
  country: "Zambia",
  region: "Southern Africa",
  currencyCode: "ZMW",
  supportProfileCode: "ZM_ZMW",
  
},
{
  isoCode: "ZW",
  country: "Zimbabwe",
  region: "Southern Africa",
  currencyCode: "ZWG",
  supportProfileCode: "ZW_ZWG",
  
},

  // ---------- Diaspora ----------
  {
    isoCode: "US",
    country: "United States",
    region: "Diaspora",
    currencyCode: "USD",
    supportProfileCode: "US_USD",
  },
  {
    isoCode: "GB",
    country: "United Kingdom",
    region: "Diaspora",
    currencyCode: "GBP",
    supportProfileCode: "UK_GBP",
  },
  {
    isoCode: "FR",
    country: "France",
    region: "Diaspora",
    currencyCode: "EUR",
    supportProfileCode: "EU_EUR",
  },
];

export function getCountryByIsoCode(isoCode: string) {
  return COUNTRY_REGISTRY.find(
    (country) => country.isoCode === isoCode.toUpperCase()
  );
}

export function getCountryByName(name: string) {
  return COUNTRY_REGISTRY.find(
    (country) =>
      country.country.toLowerCase() === name.trim().toLowerCase()
  );
}

