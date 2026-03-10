import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GymService } from '../../services/gym.service';
import { ProgramService } from '../../services/program.service';
import { WorkoutService } from '../../services/workout.service';
import { BookingService } from '../../services/booking.service';
import { PaiementService } from '../../services/paiement.service';
import { UserService } from '../../services/user.service';
import { RecompenseService } from '../../services/recompense.service';
import { EchangeService } from '../../services/echange.service';
import { InscriptionService } from '../../services/inscription.service';
import { AvisService } from '../../services/avis.service';
import { GymBuddyService } from '../../services/gym-buddy.service';
import { ConversationService } from '../../services/conversation.service';
import { ChallengeService } from '../../services/challenge.service';
import { User } from '../../models/user';
import { Gym } from '../../models/gym';
import { Program } from '../../models/program';
import { WorkoutLog, Exercise } from '../../models/workout';
import { Booking } from '../../models/booking';
import { Paiement } from '../../models/paiement';
import { Recompense } from '../../models/recompense';
import { Echange } from '../../models/echange';
import { Inscription } from '../../models/inscription';
import { Avis } from '../../models/avis';
import { GymBuddy } from '../../models/gym-buddy';
import { Conversation } from '../../models/conversation';
import { Message } from '../../models/message';
import { Challenge, ChallengeStep, StepExercise } from '../../models/challenge';

@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member-dashboard.html',
  styleUrl: './member-dashboard.css'
})
export class MemberDashboard implements OnInit, OnDestroy {
  user: User | null = null;
  activeTab = 'salles';
  gyms: Gym[] = [];
  programs: Program[] = [];
  workouts: WorkoutLog[] = [];
  bookings: Booking[] = [];
  paiements: Paiement[] = [];
  coaches: User[] = [];
  recompenses: Recompense[] = [];
  echanges: Echange[] = [];
  inscriptions: Inscription[] = [];
  avis: Avis[] = [];
  challenges: Challenge[] = [];
  loading = true;
  darkMode = false;

  // Search
  gymSearch = '';
  coachSearch = '';
  programFilter = '';

  // Booking form
  showBookingForm = false;
  selectedProgram: Program | null = null;
  bookingDate = '';
  submittingBooking = false;
  bookingError = '';

  // Action guards
  submittingInscription = false;
  submittingEchange = false;

  // Inscription
  showInscriptionConfirm = false;
  selectedGymForInscription: Gym | null = null;

  // Gym detail
  showGymDetail = false;
  selectedGym: Gym | null = null;
  selectedGymAvis: Avis[] = [];
  showAvisForm = false;
  newAvisNote = 5;
  newAvisComment = '';
  submittingAvis = false;
  avisError = '';

  // Wallet / Boutique
  showEchangeConfirm = false;
  selectedRecompense: Recompense | null = null;

  // Gym Buddy
  gymBuddies: GymBuddy[] = [];
  myBuddyPosts: GymBuddy[] = [];
  othersBuddyPosts: GymBuddy[] = [];
  showBuddyPostForm = false;
  newBuddyTitle = '';
  newBuddyDescription = '';
  newBuddySpecifications: string[] = [];
  newBuddySpecificationInput = '';
  selectedBuddyGym: Gym | null = null;
  submittingBuddyPost = false;
  buddyError = '';

  // Challenge
  showChallengeForm = false;
  challengeTitre = '';
  challengeDescription = '';
  challengeDuree = 7;
  challengeSteps: ChallengeStep[] = [];
  newStepTitre = '';
  newStepJour = 'Jour 1';
  newExerciseNom = '';
  newExerciseDetails = '';
  editingStepIndex = -1;
  submittingChallenge = false;
  challengeError = '';
  selectedChallenge: Challenge | null = null;
  challengeFilter = '';

  // Coach profile & chat
  selectedCoach: User | null = null;
  showCoachProfile = false;
  showChatPanel = false;
  currentConversation: Conversation | null = null;
  conversationMessages: Message[] = [];
  chatMessageInput = '';
  sendingMessage = false;
  loadingMessages = false;
  memberConversations: Conversation[] = [];
  private chatPollInterval: ReturnType<typeof setInterval> | null = null;

  // Payment form
  showPaymentForm = false;
  paymentAmount: number | null = null;
  cardNumber = '';
  cardHolder = '';
  cardExpiry = '';
  cardCvc = '';
  submittingPayment = false;
  paymentError = '';
  paymentSuccess = '';
  selectedInscriptionId = '';

  // Workout form
  showWorkoutForm = false;
  workoutDate = '';
  workoutType = 'STRENGTH';
  workoutDuration = 60;
  workoutCalories = 0;
  workoutMood = 'GOOD';
  workoutNotes = '';
  exercises: Exercise[] = [{ name: '', sets: 3, reps: 10, weight: 0 }];

  tabs = [
    { key: 'wallet', label: 'Wallet', icon: 'wallet' },
    { key: 'boutique', label: 'Boutique', icon: 'boutique' },
    { key: 'classement', label: 'Classement', icon: 'classement' },
    { key: 'gymbuddy', label: 'Gym Buddy', icon: 'gymbuddy' },
    { key: 'evenements', label: 'Événements', icon: 'evenements' },
    { key: 'salles', label: 'Salles', icon: 'salles' },
    { key: 'coachs', label: 'Coachs', icon: 'coachs' },
    { key: 'paiements', label: 'Paiements', icon: 'paiements' },
    { key: 'challenges', label: 'Challenges', icon: 'challenges' }
  ];

  workoutTypes = ['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'MIXED'];
  moods = [
    { value: 'GREAT', icon: '🔥', label: 'Great' },
    { value: 'GOOD', icon: '💪', label: 'Good' },
    { value: 'OKAY', icon: '👌', label: 'Okay' },
    { value: 'TIRED', icon: '😴', label: 'Tired' }
  ];

  constructor(
    private authService: AuthService,
    private gymService: GymService,
    private programService: ProgramService,
    private workoutService: WorkoutService,
    private bookingService: BookingService,
    private paiementService: PaiementService,
    private userService: UserService,
    private recompenseService: RecompenseService,
    private echangeService: EchangeService,
    private inscriptionService: InscriptionService,
    private avisService: AvisService,
    private gymBuddyService: GymBuddyService,
    private conversationService: ConversationService,
    private challengeService: ChallengeService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadData();
    this.bookingDate = new Date().toISOString().split('T')[0];
    this.workoutDate = new Date().toISOString().split('T')[0];
  }

  loadData(): void {
    this.loading = true;
    this.gymService.list().subscribe({ next: g => this.gyms = g, error: () => {} });
    this.programService.list().subscribe({ next: p => this.programs = p, error: () => {} });
    this.userService.getCoaches().subscribe({ next: c => this.coaches = c, error: () => {} });
    this.recompenseService.list().subscribe({ next: r => this.recompenses = r, error: () => {} });
    if (this.user?.id) {
      this.workoutService.getByMember(this.user.id).subscribe({ next: w => this.workouts = w, error: () => {} });
      this.bookingService.getByMember(this.user.id).subscribe({ next: b => this.bookings = b, error: () => {} });
      this.paiementService.getByClient(this.user.id).subscribe({ next: p => this.paiements = p, error: () => {} });
      this.echangeService.getByClient(this.user.id).subscribe({ next: e => this.echanges = e, error: () => {} });
      this.gymBuddyService.getMyPosts(this.user.id).subscribe({ next: b => this.myBuddyPosts = b, error: () => {} });
      this.gymBuddyService.getOthersPosts(this.user.id).subscribe({ next: b => this.othersBuddyPosts = b, error: () => {} });
      this.challengeService.getByClient(this.user.id).subscribe({ next: c => this.challenges = c, error: () => {} });
      this.inscriptionService.getByClient(this.user.id).subscribe({
        next: i => { this.inscriptions = i; this.loading = false; },
        error: () => { this.loading = false; }
      });
    } else {
      this.loading = false;
    }
  }

  setTab(tab: string): void {
    this.activeTab = tab;
  }

  toggleDark(): void {
    this.darkMode = !this.darkMode;
    document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
  }

  // === COMPUTED ===
  get userLevel(): number {
    const pts = this.user?.pointsFidelite || 0;
    if (pts >= 5000) return 10;
    if (pts >= 4000) return 8;
    if (pts >= 3000) return 7;
    if (pts >= 2000) return 5;
    if (pts >= 1000) return 3;
    if (pts >= 500) return 2;
    return 1;
  }

  get filteredGyms(): Gym[] {
    if (!this.gymSearch) return this.gyms;
    const q = this.gymSearch.toLowerCase();
    return this.gyms.filter(g => g.name.toLowerCase().includes(q) || g.city?.toLowerCase().includes(q) || g.address?.toLowerCase().includes(q));
  }

  get filteredCoaches(): User[] {
    if (!this.coachSearch) return this.coaches;
    const q = this.coachSearch.toLowerCase();
    return this.coaches.filter(c => c.name.toLowerCase().includes(q) || c.specialties?.some(s => s.toLowerCase().includes(q)));
  }

  get filteredPrograms(): Program[] {
    if (!this.programFilter) return this.programs;
    return this.programs.filter(p => p.type === this.programFilter);
  }

  get totalPoints(): number { return this.user?.pointsFidelite || 0; }
  get totalWorkouts(): number { return this.workouts.length; }
  get totalCalories(): number { return this.workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0); }
  get confirmedPaiements(): Paiement[] { return this.paiements.filter(p => p.statut === 'CONFIRME'); }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating || 0)).fill(1);
  }

  getEmptyStarArray(rating: number): number[] {
    return Array(5 - Math.floor(rating || 0)).fill(1);
  }

  getTabIcon(icon: string): string {
    const icons: Record<string, string> = {
      wallet: '💳', boutique: '🎁', classement: '🏆', gymbuddy: '👥',
      evenements: '📅', salles: '🔍', coachs: '👤', paiements: '💰'
    };
    return icons[icon] || '📋';
  }

  // === GYM DETAIL & AVIS ===
  openGymDetail(gym: Gym): void {
    this.selectedGym = gym;
    this.showGymDetail = true;
    this.showAvisForm = false;
    this.avisError = '';
    this.selectedGymAvis = [];
    if (gym.id) {
      this.avisService.getBySalle(gym.id).subscribe({
        next: a => { this.selectedGymAvis = a; this.cdr.detectChanges(); },
        error: () => {}
      });
    }
  }

  closeGymDetail(): void {
    this.showGymDetail = false;
    this.selectedGym = null;
    this.selectedGymAvis = [];
    this.showAvisForm = false;
    this.avisError = '';
  }

  get myAvisForGym(): Avis | null {
    return this.selectedGymAvis.find(a => a.clientId === this.user?.id) || null;
  }

  openAvisForm(): void {
    if (this.myAvisForGym) return;
    this.showAvisForm = true;
    this.newAvisNote = 5;
    this.newAvisComment = '';
    this.avisError = '';
  }

  submitAvis(): void {
    if (!this.selectedGym?.id || !this.user?.id) return;
    if (this.submittingAvis) return;
    this.avisError = '';
    this.submittingAvis = true;
    const avis: Avis = {
      clientId: this.user.id,
      clientName: this.user.name,
      note: this.newAvisNote,
      commentaire: this.newAvisComment,
      salleId: this.selectedGym.id
    };
    this.avisService.create(avis).subscribe({
      next: (saved) => {
        this.selectedGymAvis = [saved, ...this.selectedGymAvis];
        this.showAvisForm = false;
        this.submittingAvis = false;
        this.newAvisNote = 5;
        this.newAvisComment = '';
      },
      error: (err) => {
        this.submittingAvis = false;
        this.avisError = err?.error?.message || 'Erreur lors de la publication. Réessayez.';
      }
    });
  }

  deleteAvis(avisId: string): void {
    this.avisService.delete(avisId).subscribe({
      next: () => {
        this.selectedGymAvis = this.selectedGymAvis.filter(a => a.id !== avisId);
      },
      error: () => {}
    });
  }

  formatAvisDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  // === INSCRIPTION (S'abonner) ===
  openInscription(gym: Gym): void {
    this.selectedGymForInscription = gym;
    this.showInscriptionConfirm = true;
  }

  submitInscription(): void {
    if (!this.selectedGymForInscription?.id || !this.user?.id) return;
    if (this.submittingInscription) return;
    this.submittingInscription = true;
    const inscription: Inscription = {
      clientId: this.user.id,
      clientName: this.user.name,
      salleId: this.selectedGymForInscription.id,
      salleName: this.selectedGymForInscription.name,
      statut: 'EN_ATTENTE'
    };
    this.inscriptionService.create(inscription).subscribe({
      next: (saved) => {
        this.inscriptions = [saved, ...this.inscriptions];
        this.showInscriptionConfirm = false;
        this.selectedGymForInscription = null;
        this.submittingInscription = false;
      },
      error: () => { this.submittingInscription = false; }
    });
  }

  isSubscribed(gymId?: string): boolean {
    return this.inscriptions.some(i => i.salleId === gymId && i.statut !== 'REFUSEE');
  }

  getInscriptionStatus(gymId?: string): string {
    const ins = this.inscriptions.find(i => i.salleId === gymId);
    return ins?.statut || '';
  }

  // === BOUTIQUE / ECHANGE ===
  openEchange(recompense: Recompense): void {
    this.selectedRecompense = recompense;
    this.showEchangeConfirm = true;
  }

  submitEchange(): void {
    if (!this.selectedRecompense?.id || !this.user?.id) return;
    if ((this.user.pointsFidelite || 0) < this.selectedRecompense.coutEnPoints) return;
    if (this.submittingEchange) return;
    this.submittingEchange = true;
    const echange: Echange = {
      clientId: this.user.id,
      clientName: this.user.name,
      recompenseId: this.selectedRecompense.id,
      recompenseTitre: this.selectedRecompense.titre
    };
    this.echangeService.create(echange).subscribe({
      next: (saved) => {
        this.echanges = [saved, ...this.echanges];
        this.showEchangeConfirm = false;
        this.selectedRecompense = null;
        this.submittingEchange = false;
      },
      error: () => { this.submittingEchange = false; }
    });
  }

  // === BOOKING METHODS ===
  openBooking(program: Program): void {
    this.selectedProgram = program;
    this.showBookingForm = true;
    this.bookingError = '';
    this.submittingBooking = false;
  }

  submitBooking(): void {
    if (!this.selectedProgram || !this.user) return;
    if (this.submittingBooking) return;

    // Prevent duplicate: same program + same date (not cancelled)
    const duplicate = this.bookings.some(b =>
      b.programId === this.selectedProgram!.id &&
      b.date === this.bookingDate &&
      b.status !== 'CANCELLED'
    );
    if (duplicate) {
      this.bookingError = 'Vous avez déjà une réservation pour ce programme à cette date.';
      return;
    }

    this.bookingError = '';
    this.submittingBooking = true;

    const booking: Booking = {
      memberId: this.user.id!,
      memberName: this.user.name,
      programId: this.selectedProgram.id!,
      programTitle: this.selectedProgram.title,
      gymId: this.selectedProgram.gymId,
      gymName: this.selectedProgram.gymName,
      coachId: this.selectedProgram.coachId,
      coachName: this.selectedProgram.coachName,
      date: this.bookingDate,
      timeSlot: `${this.selectedProgram.startTime} - ${this.selectedProgram.endTime}`,
      status: 'PENDING'
    };

    this.bookingService.create(booking).subscribe({
      next: (saved) => {
        this.bookings = [saved, ...this.bookings];
        this.showBookingForm = false;
        this.selectedProgram = null;
        this.submittingBooking = false;
        this.bookingError = '';
        this.programService.enroll(booking.programId).subscribe();
      },
      error: (err) => {
        this.submittingBooking = false;
        if (err?.status === 409) {
          this.bookingError = 'Vous avez déjà une réservation pour ce programme à cette date.';
        } else {
          this.bookingError = 'Erreur lors de la réservation. Veuillez réessayer.';
        }
      }
    });
  }

  cancelBooking(id: string): void {
    this.bookingService.updateStatus(id, 'CANCELLED').subscribe({
      next: (updated) => {
        const idx = this.bookings.findIndex(b => b.id === id);
        if (idx !== -1) this.bookings[idx] = updated;
      }
    });
  }

  // === WORKOUT METHODS ===
  addExercise(): void {
    this.exercises.push({ name: '', sets: 3, reps: 10, weight: 0 });
  }

  removeExercise(i: number): void {
    this.exercises.splice(i, 1);
  }

  saveWorkout(): void {
    const validExercises = this.exercises.filter(e => e.name.trim());
    if (!validExercises.length) return;
    const log: WorkoutLog = {
      memberId: this.user!.id!,
      memberName: this.user!.name,
      date: this.workoutDate,
      type: this.workoutType,
      exercises: validExercises,
      durationMinutes: this.workoutDuration,
      caloriesBurned: this.workoutCalories,
      mood: this.workoutMood,
      notes: this.workoutNotes
    };
    this.workoutService.create(log).subscribe({
      next: (saved) => {
        this.workouts = [saved, ...this.workouts];
        this.showWorkoutForm = false;
        this.resetWorkoutForm();
      }
    });
  }

  resetWorkoutForm(): void {
    this.workoutDate = new Date().toISOString().split('T')[0];
    this.workoutType = 'STRENGTH';
    this.workoutDuration = 60;
    this.workoutCalories = 0;
    this.workoutMood = 'GOOD';
    this.workoutNotes = '';
    this.exercises = [{ name: '', sets: 3, reps: 10, weight: 0 }];
  }

  deleteWorkout(id: string): void {
    this.workoutService.delete(id).subscribe({
      next: () => { this.workouts = this.workouts.filter(w => w.id !== id); }
    });
  }

  // === HELPERS ===
  getTypeIcon(type?: string): string {
    const icons: Record<string, string> = { STRENGTH: '🏋️', CARDIO: '🏃', YOGA: '🧘', HIIT: '⚡', CROSSFIT: '💥', BOXING: '🥊', SWIMMING: '🏊', MARTIAL_ARTS: '🥋', FLEXIBILITY: '🤸', MIXED: '🔄' };
    return icons[type || ''] || '💪';
  }

  getStatusColor(s?: string): string {
    if (s === 'CONFIRMED' || s === 'COMPLETED' || s === 'CONFIRME' || s === 'ACCEPTEE') return '#10b981';
    if (s === 'PENDING' || s === 'EN_ATTENTE') return '#f59e0b';
    return '#ef4444';
  }

  getPaymentMethodIcon(method?: string): string {
    if (method === 'CARTE') return '💳';
    if (method === 'VIREMENT') return '🏦';
    return '💵';
  }

  // === PAYMENT METHODS ===
  openPaymentForm(): void {
    this.showPaymentForm = true;
    this.paymentAmount = null;
    this.cardNumber = '';
    this.cardHolder = '';
    this.cardExpiry = '';
    this.cardCvc = '';
    this.paymentError = '';
    this.paymentSuccess = '';
    this.selectedInscriptionId = '';
  }

  closePaymentForm(): void {
    this.showPaymentForm = false;
    this.paymentError = '';
    this.paymentSuccess = '';
  }

  formatCardNumber(): void {
    let v = this.cardNumber.replace(/\D/g, '').substring(0, 16);
    this.cardNumber = v.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }

  formatExpiry(): void {
    let v = this.cardExpiry.replace(/\D/g, '').substring(0, 4);
    if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2);
    this.cardExpiry = v;
  }

  formatCvc(): void {
    this.cardCvc = this.cardCvc.replace(/\D/g, '').substring(0, 3);
  }

  get unpaidInscriptions(): Inscription[] {
    return this.inscriptions.filter(i => i.statut === 'ACCEPTEE');
  }

  get isPaymentFormValid(): boolean {
    return !!(this.paymentAmount && this.paymentAmount > 0 &&
      this.cardNumber.replace(/\s/g, '').length === 16 &&
      this.cardHolder.trim().length >= 2 &&
      this.cardExpiry.length === 5 &&
      this.cardCvc.length === 3);
  }

  submitPayment(): void {
    if (!this.isPaymentFormValid || !this.user?.id) return;
    if (this.submittingPayment) return;
    this.paymentError = '';
    this.paymentSuccess = '';
    this.submittingPayment = true;

    const digits = this.cardNumber.replace(/\s/g, '');
    const selectedIns = this.inscriptions.find(i => i.id === this.selectedInscriptionId);
    const paiement: Paiement = {
      clientId: this.user.id,
      clientName: this.user.name,
      montant: this.paymentAmount!,
      methode: 'CARTE',
      statut: 'CONFIRME',
      cardLast4: digits.slice(-4),
      cardHolder: this.cardHolder.trim(),
      inscriptionId: this.selectedInscriptionId || undefined,
      salleId: selectedIns?.salleId || undefined,
      salleName: selectedIns?.salleName || undefined
    };

    this.paiementService.create(paiement).subscribe({
      next: (saved) => {
        this.paiements = [saved, ...this.paiements];
        this.paymentSuccess = 'Paiement effectué avec succès !';
        this.submittingPayment = false;
        if (selectedIns?.id) {
          this.inscriptionService.updatePaiementStatut(selectedIns.id, 'PAYE').subscribe({
            next: (updated) => {
              const idx = this.inscriptions.findIndex(i => i.id === updated.id);
              if (idx !== -1) this.inscriptions[idx] = updated;
            }
          });
        }
        setTimeout(() => {
          this.showPaymentForm = false;
          this.paymentSuccess = '';
        }, 1500);
      },
      error: () => {
        this.submittingPayment = false;
        this.paymentError = 'Erreur lors du paiement. Veuillez réessayer.';
      }
    });
  }

  formatPaiementDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return dateStr; }
  }

  deletePaiement(id: string): void {
    this.paiementService.delete(id).subscribe({
      next: () => { this.paiements = this.paiements.filter(p => p.id !== id); }
    });
  }

  // === GYM BUDDY METHODS ===
  openBuddyPostForm(): void {
    this.showBuddyPostForm = true;
    this.newBuddyTitle = '';
    this.newBuddyDescription = '';
    this.newBuddySpecifications = [];
    this.newBuddySpecificationInput = '';
    this.selectedBuddyGym = null;
    this.buddyError = '';
  }

  closeBuddyPostForm(): void {
    this.showBuddyPostForm = false;
  }

  addSpecification(): void {
    if (this.newBuddySpecificationInput.trim()) {
      this.newBuddySpecifications.push(this.newBuddySpecificationInput.trim());
      this.newBuddySpecificationInput = '';
    }
  }

  removeSpecification(index: number): void {
    this.newBuddySpecifications.splice(index, 1);
  }

  submitBuddyPost(): void {
    if (!this.user?.id || !this.newBuddyTitle.trim()) {
      this.buddyError = 'Le titre est obligatoire';
      return;
    }
    if (this.submittingBuddyPost) return;

    this.buddyError = '';
    this.submittingBuddyPost = true;

    const gymBuddy: GymBuddy = {
      clientId: this.user.id,
      title: this.newBuddyTitle,
      description: this.newBuddyDescription,
      specifications: this.newBuddySpecifications,
      gymId: this.selectedBuddyGym?.id,
      gymName: this.selectedBuddyGym?.name
    };

    this.gymBuddyService.create(gymBuddy).subscribe({
      next: (saved) => {
        this.myBuddyPosts = [saved, ...this.myBuddyPosts];
        this.showBuddyPostForm = false;
        this.submittingBuddyPost = false;
        this.newBuddyTitle = '';
        this.newBuddyDescription = '';
        this.newBuddySpecifications = [];
      },
      error: (err) => {
        this.submittingBuddyPost = false;
        this.buddyError = err?.error?.message || 'Erreur lors de la création du post';
      }
    });
  }

  deleteBuddyPost(postId: string): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) return;
    this.gymBuddyService.delete(postId).subscribe({
      next: () => {
        this.myBuddyPosts = this.myBuddyPosts.filter(p => p.id !== postId);
      },
      error: () => {}
    });
  }

  formatBuddyDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  // === COACH PROFILE & CHAT METHODS ===
  openCoachProfile(coach: User): void {
    this.selectedCoach = coach;
    this.showCoachProfile = true;
    this.showChatPanel = false;
  }

  closeCoachProfile(): void {
    this.showCoachProfile = false;
    this.selectedCoach = null;
    this.closeChatPanel();
  }

  openConversationWithCoach(coach: User): void {
    if (!this.user?.id || !coach.id) return;
    this.loadingMessages = true;
    this.showChatPanel = true;

    // Load all conversations for this member, then check if one already exists with this coach
    this.conversationService.getByUser(this.user.id).subscribe({
      next: (convs) => {
        this.memberConversations = convs;
        const existing = convs.find(c =>
          c.participantIds.includes(coach.id!) && c.participantIds.includes(this.user!.id!)
        );
        if (existing) {
          this.currentConversation = existing;
          this.loadMessages(existing.id!);
        } else {
          // Create new conversation
          const newConv: Conversation = {
            participantIds: [this.user!.id!, coach.id!],
            participantNames: [this.user!.name, coach.name]
          };
          this.conversationService.create(newConv).subscribe({
            next: (created) => {
              this.currentConversation = created;
              this.memberConversations = [created, ...this.memberConversations];
              this.conversationMessages = [];
              this.loadingMessages = false;
            },
            error: () => { this.loadingMessages = false; }
          });
        }
      },
      error: () => { this.loadingMessages = false; }
    });
  }

  loadMessages(conversationId: string): void {
    this.conversationService.getMessages(conversationId).subscribe({
      next: (msgs) => {
        this.conversationMessages = msgs;
        this.loadingMessages = false;
        setTimeout(() => this.scrollChatToBottom(), 50);
      },
      error: () => { this.loadingMessages = false; }
    });
    this.startChatPolling(conversationId);
  }

  private startChatPolling(conversationId: string): void {
    this.stopChatPolling();
    this.chatPollInterval = setInterval(() => {
      this.conversationService.getMessages(conversationId).subscribe({
        next: (msgs) => {
          if (msgs.length !== this.conversationMessages.length) {
            this.conversationMessages = msgs;
            setTimeout(() => this.scrollChatToBottom(), 50);
          }
        },
        error: () => {}
      });
    }, 3000);
  }

  private stopChatPolling(): void {
    if (this.chatPollInterval !== null) {
      clearInterval(this.chatPollInterval);
      this.chatPollInterval = null;
    }
  }

  sendChatMessage(): void {
    if (!this.chatMessageInput.trim() || !this.currentConversation?.id || !this.user?.id) return;
    if (this.sendingMessage) return;
    this.sendingMessage = true;
    const msg: Message = {
      conversationId: this.currentConversation.id,
      senderId: this.user.id,
      senderName: this.user.name,
      contenu: this.chatMessageInput.trim()
    };
    this.conversationService.sendMessage(this.currentConversation.id, msg).subscribe({
      next: (saved) => {
        this.conversationMessages = [...this.conversationMessages, saved];
        this.chatMessageInput = '';
        this.sendingMessage = false;
        setTimeout(() => this.scrollChatToBottom(), 50);
      },
      error: () => { this.sendingMessage = false; }
    });
  }

  closeChatPanel(): void {
    this.stopChatPolling();
    this.showChatPanel = false;
    this.currentConversation = null;
    this.conversationMessages = [];
    this.chatMessageInput = '';
  }

  scrollChatToBottom(): void {
    const el = document.getElementById('chat-messages-container');
    if (el) el.scrollTop = el.scrollHeight;
  }

  formatMessageTime(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  }

  isMyMessage(msg: Message): boolean {
    return msg.senderId === this.user?.id;
  }

  ngOnDestroy(): void {
    this.stopChatPolling();
  }

  // === CHALLENGE METHODS ===
  get filteredChallenges(): Challenge[] {
    if (!this.challengeFilter) return this.challenges;
    return this.challenges.filter(c => c.statut === this.challengeFilter);
  }

  get challengeDays(): string[] {
    return Array.from({ length: this.challengeDuree }, (_, i) => `Jour ${i + 1}`);
  }

  openChallengeForm(): void {
    this.showChallengeForm = true;
    this.challengeTitre = '';
    this.challengeDescription = '';
    this.challengeDuree = 7;
    this.challengeSteps = [];
    this.challengeError = '';
    this.editingStepIndex = -1;
  }

  closeChallengeForm(): void {
    this.showChallengeForm = false;
  }

  addExerciseToStep(): void {
    if (!this.newExerciseNom.trim()) return;
    if (this.editingStepIndex === -1) {
      // Add new step with this exercise
      const step: ChallengeStep = {
        titre: this.newStepTitre || this.newStepJour,
        jour: this.newStepJour,
        exercices: [{ nom: this.newExerciseNom.trim(), details: this.newExerciseDetails.trim(), done: false }],
        complete: false
      };
      this.challengeSteps.push(step);
      this.editingStepIndex = this.challengeSteps.length - 1;
    } else {
      this.challengeSteps[this.editingStepIndex].exercices.push({
        nom: this.newExerciseNom.trim(),
        details: this.newExerciseDetails.trim(),
        done: false
      });
    }
    this.newExerciseNom = '';
    this.newExerciseDetails = '';
  }

  finalizeStep(): void {
    if (this.editingStepIndex >= 0) {
      const step = this.challengeSteps[this.editingStepIndex];
      if (this.newStepTitre) step.titre = this.newStepTitre;
    }
    this.editingStepIndex = -1;
    this.newStepTitre = '';
    this.newStepJour = `Jour ${this.challengeSteps.length + 1}`;
    this.newExerciseNom = '';
    this.newExerciseDetails = '';
  }

  removeStep(index: number): void {
    this.challengeSteps.splice(index, 1);
    if (this.editingStepIndex === index) this.editingStepIndex = -1;
  }

  removeChallengeExercise(stepIdx: number, exIdx: number): void {
    this.challengeSteps[stepIdx].exercices.splice(exIdx, 1);
    if (this.challengeSteps[stepIdx].exercices.length === 0) {
      this.removeStep(stepIdx);
    }
  }

  startNewStep(): void {
    if (this.editingStepIndex >= 0) this.finalizeStep();
    this.editingStepIndex = -1;
    this.newStepJour = `Jour ${this.challengeSteps.length + 1}`;
    this.newStepTitre = '';
  }

  submitChallenge(): void {
    if (!this.challengeTitre.trim() || this.challengeSteps.length === 0 || !this.user?.id) {
      this.challengeError = 'Titre et au moins une étape requis.';
      return;
    }
    if (this.editingStepIndex >= 0) this.finalizeStep();
    this.submittingChallenge = true;
    this.challengeError = '';

    const now = new Date();
    const fin = new Date(now.getTime() + this.challengeDuree * 24 * 60 * 60 * 1000);

    const challenge: Challenge = {
      clientId: this.user.id,
      clientName: this.user.name,
      titre: this.challengeTitre.trim(),
      description: this.challengeDescription.trim() || undefined,
      dateDebut: now.toISOString(),
      dateFin: fin.toISOString(),
      statut: 'EN_COURS',
      etapes: this.challengeSteps
    };

    this.challengeService.create(challenge).subscribe({
      next: (saved) => {
        this.challenges = [saved, ...this.challenges];
        this.showChallengeForm = false;
        this.submittingChallenge = false;
      },
      error: () => {
        this.challengeError = 'Erreur lors de la création.';
        this.submittingChallenge = false;
      }
    });
  }

  toggleExerciseDone(challenge: Challenge, stepIdx: number, exIdx: number): void {
    challenge.etapes[stepIdx].exercices[exIdx].done = !challenge.etapes[stepIdx].exercices[exIdx].done;
    // Check if all exercises in step are done
    const step = challenge.etapes[stepIdx];
    step.complete = step.exercices.every(e => e.done);
    this.challengeService.update(challenge.id!, challenge).subscribe({ error: () => {} });
  }

  toggleStepComplete(challenge: Challenge, stepIdx: number): void {
    const step = challenge.etapes[stepIdx];
    const newVal = !step.complete;
    step.complete = newVal;
    step.exercices.forEach(e => e.done = newVal);
    this.challengeService.update(challenge.id!, challenge).subscribe({ error: () => {} });
  }

  completeChallenge(challenge: Challenge): void {
    challenge.statut = 'TERMINE';
    this.challengeService.update(challenge.id!, challenge).subscribe({ error: () => {} });
  }

  abandonChallenge(challenge: Challenge): void {
    challenge.statut = 'ABANDONNE';
    this.challengeService.update(challenge.id!, challenge).subscribe({ error: () => {} });
  }

  deleteChallenge(id: string): void {
    this.challengeService.delete(id).subscribe({
      next: () => { this.challenges = this.challenges.filter(c => c.id !== id); }
    });
  }

  getChallengeProgress(challenge: Challenge): number {
    const total = challenge.etapes.reduce((sum, s) => sum + s.exercices.length, 0);
    if (total === 0) return 0;
    const done = challenge.etapes.reduce((sum, s) => sum + s.exercices.filter(e => e.done).length, 0);
    return Math.round((done / total) * 100);
  }

  isAllStepsComplete(challenge: Challenge): boolean {
    return challenge.etapes.every(s => s.complete);
  }

  viewChallenge(challenge: Challenge): void {
    this.selectedChallenge = this.selectedChallenge?.id === challenge.id ? null : challenge;
  }

  formatChallengeDate(d?: string): string {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
  }

  getDaysRemaining(dateFin?: string): number {
    if (!dateFin) return 0;
    const diff = new Date(dateFin).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
