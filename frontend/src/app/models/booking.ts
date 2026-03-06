export interface Booking {
  id?: string;
  memberId: string;
  memberName?: string;
  programId: string;
  programTitle?: string;
  gymId?: string;
  gymName?: string;
  coachId?: string;
  coachName?: string;
  date?: string;
  timeSlot?: string;
  status?: string;
  notes?: string;
  createdAt?: string;
}
