/**
 * Tipos del registro de socios (contrato del backend: schema/partner_requests).
 */

export type PartnerRequestKind = 'BUSINESS' | 'COURIER';

export type PartnerRequestStatus = 'PENDING' | 'CONTACTED' | 'APPROVED' | 'REJECTED';

export type PartnerRequest = {
  id: string;
  type: PartnerRequestKind;
  status: PartnerRequestStatus;
  fullName: string;
  phone: string;
  email?: string | null;
  businessName?: string | null;
  municipality?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string | null;
};

export type PartnerAccess = {
  courierApproved: boolean;
  merchantApproved: boolean;
  latestCourierRequest: PartnerRequest | null;
  latestBusinessRequest: PartnerRequest | null;
};

export type SubmitPartnerRequestInput = {
  type: PartnerRequestKind;
  fullName: string;
  phone: string;
  businessName?: string | null;
  municipality?: string | null;
  notes?: string | null;
};

export type MyPartnerAccessResponse = {
  myPartnerAccess: PartnerAccess;
};

export type SubmitPartnerRequestResponse = {
  submitPartnerRequest: PartnerRequest;
};
