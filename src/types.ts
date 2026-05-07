export interface ShopSettings {
  id?: string;
  name: string;
  phone: string;
  address: string;
  logo?: string;
  currency: string;
}

export enum Category {
  GENERAL = 'Général',
  ALIMENTATION = 'Alimentation',
  ELECTRONIQUE = 'Électronique',
  BEAUTE = 'Beauté & Santé',
  VETEMENTS = 'Vêtements',
  BOISSONS = 'Boissons',
  AUTRE = 'Autre'
}

export enum PaymentMethod {
  CASH = 'Espèces',
  WAVE = 'Wave',
  ORANGE_MONEY = 'Orange Money'
}

export interface Product {
  id?: string;
  nom: string;
  prix: number;
  prixAchat: number;
  stock: number;
  stockMin: number;
  categorie: Category;
  image?: string;
  codeBarre?: string;
  updatedAt: string;
}

export interface Client {
  id?: string;
  nom: string;
  telephone: string;
  email?: string;
  pointsFidelite: number;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  nom: string;
  prix: number;
  quantite: number;
  total: number;
}

export interface Sale {
  id?: string;
  items: SaleItem[];
  total: number;
  date: string;
  modePaiement: PaymentMethod;
  clientId?: string;
  profit: number;
}

export interface Expense {
  id?: string;
  montant: number;
  description: string;
  date: string;
  categorie: string;
}

export interface DashboardStats {
  ventesJour: number;
  produitsStock: number;
  beneficesJour: number;
  depensesJour: number;
  ruptureStock: number;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}
