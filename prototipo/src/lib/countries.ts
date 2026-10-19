export type Country = {
  name: string;
  dialCode: string;
};

export const countries: Country[] = [
  { name: "Argentina", dialCode: "+54" },
  { name: "Bolivia", dialCode: "+591" },
  { name: "Brasil", dialCode: "+55" },
  { name: "Chile", dialCode: "+56" },
  { name: "Colombia", dialCode: "+57" },
  { name: "Costa Rica", dialCode: "+506" },
  { name: "Cuba", dialCode: "+53" },
  { name: "Ecuador", dialCode: "+593" },
  { name: "El Salvador", dialCode: "+503" },
  { name: "España", dialCode: "+34" },
  { name: "Estados Unidos", dialCode: "+1" },
  { name: "Guatemala", dialCode: "+502" },
  { name: "Honduras", dialCode: "+504" },
  { name: "México", dialCode: "+52" },
  { name: "Nicaragua", dialCode: "+505" },
  { name: "Panamá", dialCode: "+507" },
  { name: "Paraguay", dialCode: "+595" },
  { name: "Perú", dialCode: "+51" },
  { name: "Puerto Rico", dialCode: "+1" },
  { name: "República Dominicana", dialCode: "+1" },
  { name: "Uruguay", dialCode: "+598" },
  { name: "Venezuela", dialCode: "+58" },
];

export function dialCodeForCountry(countryName: string): string {
  return countries.find((c) => c.name === countryName)?.dialCode ?? "";
}
