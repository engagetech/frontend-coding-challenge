
export type Data = Record<'providers' | 'directContractors' | 'total', DataInterface[]>;

export interface DataInterface {
  rebatesTotal: number;
  grossPayTotal: number;
  workerCount: number;
  complianceStats: ComplianceStats | null;
  payrollAdminTotal: number;
  labourCostTotal: number;
  providerId: number;
  name: string;
}


export interface ComplianceStats {
  OpsEmpStatusChecked: number;
  Total: number;
  TaxStatus: number;
  Identification: number;
  RightToWork: number;
  OpsChecked: number;
  Contract: number;
  EmpStatusReviewnumber?: number;
  EmpStatusReview?: number;
}