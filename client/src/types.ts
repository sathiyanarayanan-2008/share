export type Role = 'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type FoodCategory = 'COOKED_MEALS' | 'BAKERY' | 'PRODUCE' | 'PACKAGED_GOODS' | 'DAIRY' | 'BEVERAGES' | 'OTHER';
export type StorageCondition = 'REFRIGERATED' | 'FROZEN' | 'HOT_HELD' | 'AMBIENT_DRY';
export type DonationStatus = 'AVAILABLE' | 'RESERVED' | 'PICKED_UP' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
export type ClaimStatus = 'RESERVED' | 'IN_TRANSIT' | 'FULFILLED' | 'CANCELLED';
export type PickupStatus = 'ASSIGNED' | 'EN_ROUTE_TO_DONOR' | 'COLLECTED' | 'EN_ROUTE_TO_NGO' | 'DELIVERED' | 'CONFIRMED' | 'FAILED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  verificationStatus: VerificationStatus;
  organisationId?: string;
  organisationName?: string;
}

export interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  title: string;
  foodCategory: FoodCategory;
  quantity: number;
  unit: string;
  estimatedServings: number;
  preparationTime: string;
  safeHandlingNotes: string;
  pickupStart: string;
  pickupDeadline: string;
  storageConditions: StorageCondition;
  location: Location;
  status: DonationStatus;
  claimedByNgoId?: string;
  claimedByNgoName?: string;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
  createdAt: string;
}

export interface Claim {
  id: string;
  donationId: string;
  ngoId: string;
  ngoName: string;
  status: ClaimStatus;
  reservedAt: string;
  allocatedServings: number;
  safetyAcknowledgementAccepted: boolean;
}

export interface Pickup {
  id: string;
  claimId: string;
  donationId: string;
  volunteerId: string;
  volunteerName: string;
  status: PickupStatus;
  pickupTime?: string;
  deliveryTime?: string;
  tokenExpiresAt?: string;
  notes?: string;
  createdAt: string;
}

export interface Organisation {
  id: string;
  name: string;
  type: string;
  address: string;
  geoCoordinates: {
    latitude: number;
    longitude: number;
  };
  verificationStatus: VerificationStatus;
  capacity: number;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  registrationNumber?: string;
}

export interface MatchingResult {
  donation: Donation;
  organisation: Organisation;
  overallScore: number;
  distanceKm: number;
  distanceScore: number;
  capacityRatio: number;
  capacityScore: number;
  windowHoursRemaining: number;
  urgencyScore: number;
  explanation: string;
  formula: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface ImpactAnalytics {
  totalDonations: number;
  activeListings: number;
  reservedDonations: number;
  inTransitDonations: number;
  completedDonations: number;
  cancelledDonations: number;
  totalMealsRescued: number;
  totalKgDiverted: number;
  co2eKgAvoided: number;
  verifiedNgosCount: number;
  activeVolunteersCount: number;
  totalDonorsCount: number;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  entityType: string;
  entityId: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: string;
  targetId: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
}
