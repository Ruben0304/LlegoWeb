/**
 * Validación de teléfonos con la misma regla que el backend
 * (utils/phone.py: cuban_national_number + normalize_phone), para avisar en el
 * formulario antes de enviar. El backend vuelve a validar: si cambia la regla
 * allí, hay que cambiarla aquí.
 *
 * - Un número cubano de 8 dígitos en cualquier formato habitual ("5XXXXXXX",
 *   "+53 5XXX XXXX", "00535XXXXXXX", "0XXXXXXXX") queda "+53XXXXXXXX".
 * - Con otro código de país ("+1 305 555 1234", "0034 600 000 000") se respeta,
 *   solo sin separadores.
 */

const CUBA_COUNTRY_CODE = '53';
const CUBA_NATIONAL_LENGTH = 8;
const INTERNATIONAL_MIN_DIGITS = 8;
const INTERNATIONAL_MAX_DIGITS = 15;
const PHONE_CHARS = /^\+?[\d\s\-().]+$/;

/** Los 8 dígitos nacionales de un teléfono cubano, o null si no lo es. */
function cubanNationalNumber(raw: string): string | null {
  let digits = raw.replace(/\D/g, '');
  let hasCountryCode = raw.startsWith('+');
  if (!hasCountryCode && digits.startsWith('00')) {
    hasCountryCode = true;
    digits = digits.slice(2);
  }

  if (hasCountryCode) {
    if (!digits.startsWith(CUBA_COUNTRY_CODE)) return null;
    digits = digits.slice(CUBA_COUNTRY_CODE.length);
  } else if (
    digits.length === CUBA_COUNTRY_CODE.length + CUBA_NATIONAL_LENGTH &&
    digits.startsWith(CUBA_COUNTRY_CODE)
  ) {
    digits = digits.slice(CUBA_COUNTRY_CODE.length);
  } else if (digits.length === CUBA_NATIONAL_LENGTH + 1 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  return digits.length === CUBA_NATIONAL_LENGTH ? digits : null;
}

/** Teléfono en formato internacional compacto ("+53XXXXXXXX"), o null si no vale. */
export function normalizePhone(value: string | null | undefined): string | null {
  const raw = (value ?? '').trim();
  if (!raw || !PHONE_CHARS.test(raw)) return null;

  const national = cubanNationalNumber(raw);
  if (national) return `+${CUBA_COUNTRY_CODE}${national}`;

  const digits = raw.replace(/\D/g, '');
  let international: string;
  if (raw.startsWith('+')) {
    international = digits;
  } else if (digits.startsWith('00')) {
    international = digits.slice(2);
  } else {
    return null;
  }

  if (international.startsWith(CUBA_COUNTRY_CODE) || international.startsWith('0')) return null;
  if (international.length < INTERNATIONAL_MIN_DIGITS || international.length > INTERNATIONAL_MAX_DIGITS) {
    return null;
  }
  return `+${international}`;
}

/** "+5355555555" → "+53 5555 5555"; otros países se muestran tal cual. */
export function formatPhone(phone: string): string {
  const match = /^\+53(\d{4})(\d{4})$/.exec(phone);
  return match ? `+53 ${match[1]} ${match[2]}` : phone;
}

export const PHONE_HINT =
  'Tu número cubano de 8 dígitos (por ejemplo 5XXXXXXX). Si es de otro país, escríbelo con su código (+1 305 555 1234).';
