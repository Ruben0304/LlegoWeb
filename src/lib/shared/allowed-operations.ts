/**
 * Lista blanca del proxy /api/graphql: solo deja pasar las operaciones que
 * define la propia web en src/lib, y exactamente con el mismo documento.
 *
 * No basta con mirar `operationName`: lo elige quien llama, y con
 * `query GetTutorials { ...cualquier otra cosa }` se colaría cualquier consulta.
 * Por eso se compara el documento entero, normalizado con print() de graphql
 * (da igual el espaciado o los comentarios).
 *
 * El login social no está: va por /api/auth/google y /api/auth/apple.
 * Si añades una operación en src/lib y debe poder pasar por el proxy, añádela aquí.
 */

import { Kind, parse, print, type DocumentNode } from 'graphql';

import {
  CREATE_BUSINESS_TYPE_CONFIG,
  DEACTIVATE_BUSINESS_TYPE_CONFIG,
  DELETE_BUSINESS_TYPE_CONFIG,
  UPDATE_BUSINESS_TYPE_CONFIG,
} from '@/lib/business-type/mutations';
import { GET_BUSINESS_TYPE_CONFIGS } from '@/lib/business-type/queries';
import { SUBMIT_PARTNER_REQUEST } from '@/lib/partner/mutations';
import { MY_PARTNER_ACCESS } from '@/lib/partner/queries';
import {
  CREATE_TUTORIAL,
  DELETE_TUTORIAL,
  TOGGLE_TUTORIAL_ACTIVE,
  UPDATE_TUTORIAL,
} from '@/lib/tutorial/mutations';
import {
  GET_ACTIVE_TUTORIALS,
  GET_TUTORIAL,
  GET_TUTORIALS,
  GET_TUTORIALS_BY_APP,
  GET_TUTORIALS_BY_TAGS,
  SEARCH_TUTORIALS,
} from '@/lib/tutorial/queries';

const WEB_OPERATIONS: string[] = [
  // Panel de tutoriales (/tutoriales)
  GET_TUTORIALS,
  GET_ACTIVE_TUTORIALS,
  GET_TUTORIALS_BY_APP,
  GET_TUTORIAL,
  SEARCH_TUTORIALS,
  GET_TUTORIALS_BY_TAGS,
  CREATE_TUTORIAL,
  UPDATE_TUTORIAL,
  DELETE_TUTORIAL,
  TOGGLE_TUTORIAL_ACTIVE,
  // Panel de tipos de negocio (/business-types)
  GET_BUSINESS_TYPE_CONFIGS,
  CREATE_BUSINESS_TYPE_CONFIG,
  UPDATE_BUSINESS_TYPE_CONFIG,
  DEACTIVATE_BUSINESS_TYPE_CONFIG,
  DELETE_BUSINESS_TYPE_CONFIG,
  // Registro de socios (/negocios)
  MY_PARTNER_ACCESS,
  SUBMIT_PARTNER_REQUEST,
];

// Las operaciones de la web tienen menos de 200 tokens: con este tope un
// documento enorme se rechaza sin gastar CPU en analizarlo entero.
const MAX_TOKENS = 2_000;

/** Nombre de la única operación del documento, o null si hay varias, fragmentos o es anónima. */
function singleOperationName(document: DocumentNode): string | null {
  if (document.definitions.length !== 1) return null;
  const [definition] = document.definitions;
  if (definition.kind !== Kind.OPERATION_DEFINITION) return null;
  return definition.name?.value ?? null;
}

/** operationName -> documento normalizado. */
export const ALLOWED_OPERATIONS: ReadonlyMap<string, string> = new Map(
  WEB_OPERATIONS.map((source) => {
    const document = parse(source);
    const name = singleOperationName(document);
    if (!name) {
      throw new Error('Cada operación de la lista blanca debe tener nombre y ser única en su documento.');
    }
    return [name, print(document)] as const;
  })
);

/**
 * Nombre de la operación si `query` es exactamente una de la lista blanca (y
 * `operationName`, si viene, coincide); null en cualquier otro caso.
 */
export function matchAllowedOperation(query: unknown, operationName: unknown): string | null {
  if (typeof query !== 'string') return null;
  if (operationName !== undefined && operationName !== null && typeof operationName !== 'string') {
    return null;
  }

  let document: DocumentNode;
  try {
    document = parse(query, { noLocation: true, maxTokens: MAX_TOKENS });
  } catch {
    return null;
  }

  const name = singleOperationName(document);
  if (!name || (operationName && operationName !== name)) return null;

  const allowed = ALLOWED_OPERATIONS.get(name);
  return allowed !== undefined && allowed === print(document) ? name : null;
}
