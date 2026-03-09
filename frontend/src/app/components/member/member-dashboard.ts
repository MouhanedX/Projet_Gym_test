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
    { key: 'paiements', label: 'Paiements', icon: 'paiements' }
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
  get pendingPaiements(): Paiement[] { return this.paiements.filter(p => p.statut === 'EN_ATTENTE'); }

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

  ngOnDestroy(): void {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
