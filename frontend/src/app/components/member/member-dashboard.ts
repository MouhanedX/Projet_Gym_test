import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewChecked, NgZone } from '@angular/core';
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
import * as L from 'leaflet';

@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member-dashboard.html',
  styleUrl: './member-dashboard.css'
})
export class MemberDashboard implements OnInit, OnDestroy, AfterViewChecked {
  user: User | null = null;
  activeTab = 'wallet';
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

  // Boutique — ajout récompense
  showAddRecompenseForm = false;
  newRecompenseTitre = '';
  newRecompenseDescription = '';
  newRecompenseCout = 0;
  newRecompensePartenaire = '';
  newRecompenseImage: string | null = null;
  newRecompenseImagePreview: string | null = null;
  savingRecompense = false;
  recompenseFormError = '';

  // Classement
  allMembers: User[] = [];

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
  // Coach rating
  selectedCoachAvis: Avis[] = [];
  showCoachRatingForm = false;
  coachRatingNote = 5;
  coachRatingComment = '';
  submittingCoachRating = false;
  coachRatingError = '';
  coachReservations: Booking[] = [];
  currentConversation: Conversation | null = null;
  conversationMessages: Message[] = [];
  chatMessageInput = '';
  sendingMessage = false;
  loadingMessages = false;
  memberConversations: Conversation[] = [];
  private chatPollInterval: ReturnType<typeof setInterval> | null = null;
  private coachPollInterval: ReturnType<typeof setInterval> | null = null;

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

  // Profile edit
  showProfileEdit = false;
  profileName = '';
  profilePhone = '';
  profileCity = '';
  profileAddress = '';
  profileBio = '';
  profileLat: number | null = null;
  profileLng: number | null = null;
  savingProfile = false;
  profileError = '';
  profileSuccess = '';
  private profileMap: L.Map | null = null;
  private profileMarker: L.Marker | null = null;
  private profileMapInitialized = false;
  private needsProfileMapInit = false;

    // Salles map
  showSallesMap = true;
  mapAddressSearch = '';
  mapLocating = false;
  private sallesMap: L.Map | null = null;
  private sallesMapInitialized = false;
  private needsSallesMapInit = false;
  private userLocMarker: L.Marker | null = null;
  private openGymHandler: ((e: Event) => void) | null = null;

  // Renouvellement abonnement
  renewDuree = 1;
  showRenewModal = false;
  renewTargetInscription: Inscription | null = null;
  submittingRenew = false;

  // Subscription payment
  subscriptionDuree = 1;
  cardFlipped = false;
  subscriptionPaymentError = '';
  subscriptionPaymentSuccess = '';

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
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadData();
    this.bookingDate = new Date().toISOString().split('T')[0];
    this.workoutDate = new Date().toISOString().split('T')[0];
    this.needsSallesMapInit = true;
    // Auto-geocode address if lat/lng missing
    if (this.user?.address && (!this.user.latitude || !this.user.longitude)) {
      this.geocodeUserAddress(this.user.address);
    } else if (!this.user?.latitude || !this.user?.longitude) {
      // Auto-locate via browser geolocation
      this.autoLocateUser();
    }
  }

  ngAfterViewChecked(): void {
    if (this.needsProfileMapInit && !this.profileMapInitialized) {
      const container = document.getElementById('profile-map');
      if (container) {
        this.initProfileMap();
        this.needsProfileMapInit = false;
      }
    }
    if (this.needsSallesMapInit && !this.sallesMapInitialized && this.activeTab === 'salles' && this.showSallesMap) {
      const container = document.getElementById('salles-map');
      if (container) {
        this.initSallesMap();
        this.needsSallesMapInit = false;
      }
    }
  }

  loadData(): void {
    this.loading = true;
    this.gymService.list().subscribe({ next: g => this.gyms = g, error: () => {} });
    this.programService.list().subscribe({ next: p => this.programs = p, error: () => {} });
    this.userService.getCoaches().subscribe({ next: c => this.coaches = c, error: () => {} });
    this.userService.getMembers().subscribe({ next: m => this.allMembers = m, error: () => {} });
    this.recompenseService.list().subscribe({ next: r => this.recompenses = r, error: () => {} });
    if (this.user?.id) {
      this.workoutService.getByMember(this.user.id).subscribe({ next: w => this.workouts = w, error: () => {} });
      this.paiementService.getByClient(this.user.id).subscribe({ next: p => this.paiements = p, error: () => {} });
      this.echangeService.getByClient(this.user.id).subscribe({ next: e => this.echanges = e, error: () => {} });
      this.gymBuddyService.getMyPosts(this.user.id).subscribe({ next: b => this.myBuddyPosts = b, error: () => {} });
      this.gymBuddyService.getOthersPosts(this.user.id).subscribe({ next: b => this.othersBuddyPosts = b, error: () => {} });
      this.challengeService.getByClient(this.user.id).subscribe({ next: c => this.challenges = c, error: () => {} });
      this.bookingService.getByMember(this.user.id).subscribe({
        next: b => {
          this.bookings = b;
          this.coachReservations = b.filter(bk => bk.type === 'COACH_RESERVATION');
        }, error: () => {}
      });
      this.inscriptionService.getByClient(this.user.id).subscribe({
        next: i => { this.inscriptions = i; this.loading = false; },
        error: () => { this.loading = false; }
      });
      this.avisService.getByClient(this.user.id).subscribe({ next: a => this.avis = a, error: () => {} });
    } else {
      this.loading = false;
    }
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'salles' && this.showSallesMap && !this.sallesMapInitialized) {
      this.needsSallesMapInit = true;
    }
    if (tab === 'coachs') {
      this.startCoachPoll();
    } else {
      this.stopCoachPoll();
    }
  }

  private geocodeUserAddress(address: string): void {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    fetch(url)
      .then(res => res.json())
      .then((results: any[]) => {
        if (results && results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lng = parseFloat(results[0].lon);
          if (this.user?.id) {
            this.userService.update(this.user.id, { latitude: lat, longitude: lng }).subscribe({
              next: () => {
                this.ngZone.run(() => {
                  if (this.user) {
                    this.user.latitude = lat;
                    this.user.longitude = lng;
                    this.authService.updateStoredUser(this.user);
                  }
                  this._refreshSallesMap();
                  this.cdr.detectChanges();
                });
              }
            });
          }
        }
      })
      .catch(() => {});
  }

  toggleSallesMap(): void {
    this.showSallesMap = !this.showSallesMap;
    if (this.showSallesMap) {
      if (this.sallesMap) { this.sallesMap.remove(); this.sallesMap = null; this.userLocMarker = null; }
      this.sallesMapInitialized = false;
      this.needsSallesMapInit = true;
    } else {
      if (this.sallesMap) { this.sallesMap.remove(); this.sallesMap = null; this.userLocMarker = null; }
      this.sallesMapInitialized = false;
    }
  }

  autoLocateUser(): void {
    if (!('geolocation' in navigator)) return;
    this.mapLocating = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.ngZone.run(() => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          this.mapLocating = false;
          if (this.user?.id) {
            this.userService.update(this.user.id, { latitude: lat, longitude: lng }).subscribe({
              next: () => {
                if (this.user) {
                  this.user.latitude = lat;
                  this.user.longitude = lng;
                  this.authService.updateStoredUser(this.user);
                }
                this._refreshSallesMap();
                this.cdr.detectChanges();
              },
              error: () => {}
            });
          } else {
            this._refreshSallesMap();
          }
        });
      },
      () => {
        this.ngZone.run(() => { this.mapLocating = false; this.cdr.detectChanges(); });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  searchMapAddress(): void {
    if (!this.mapAddressSearch.trim()) return;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.mapAddressSearch)}&limit=1`;
    fetch(url)
      .then(r => r.json())
      .then((results: any[]) => {
        if (!results || results.length === 0) return;
        const lat = parseFloat(results[0].lat);
        const lng = parseFloat(results[0].lon);
        if (this.user?.id) {
          this.userService.update(this.user.id, { latitude: lat, longitude: lng }).subscribe({
            next: () => {
              if (this.user) {
                this.user.latitude = lat;
                this.user.longitude = lng;
                this.authService.updateStoredUser(this.user);
              }
              this.mapAddressSearch = '';
              this._refreshSallesMap();
              this.cdr.detectChanges();
            },
            error: () => {}
          });
        } else {
          this.mapAddressSearch = '';
          this._refreshSallesMap();
        }
      })
      .catch(() => {});
  }

  private _refreshSallesMap(): void {
    if (this.sallesMap) { this.sallesMap.remove(); this.sallesMap = null; this.userLocMarker = null; }
    if (this.openGymHandler) {
      document.removeEventListener('openGym', this.openGymHandler);
      this.openGymHandler = null;
    }
    this.sallesMapInitialized = false;
    this.needsSallesMapInit = true;
    // Use setTimeout to let Angular update the DOM before re-initialising
    setTimeout(() => {
      if (this.activeTab === 'salles' && this.showSallesMap) {
        const container = document.getElementById('salles-map');
        if (container && !this.sallesMapInitialized) {
          this.initSallesMap();
          this.needsSallesMapInit = false;
          this.cdr.detectChanges();
        }
      }
    }, 50);
  }

  toggleDark(): void {
    this.darkMode = !this.darkMode;
    document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
  }

  // === POINTS SYSTEM ===
  // delta > 0 → award points, delta < 0 → deduct points
  private updatePoints(delta: number): void {
    if (!this.user?.id) return;
    const newTotal = Math.max(0, (this.user.pointsFidelite || 0) + delta);
    // Optimistic local update so the UI reacts immediately
    this.user.pointsFidelite = newTotal;
    this.authService.updateStoredUser(this.user);
    this.cdr.detectChanges();
    // Persist on server
    this.userService.update(this.user.id, { pointsFidelite: newTotal }).subscribe({
      next: (updated) => {
        if (this.user) {
          this.user.pointsFidelite = updated.pointsFidelite ?? newTotal;
          this.authService.updateStoredUser(this.user);
        }
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  /** Returns true if this action has not yet been rewarded today (calendar day). */
  private canEarnPointsToday(actionKey: string): boolean {
    const key = `pts_daily_${this.user?.id}_${actionKey}`;
    const last = localStorage.getItem(key);
    if (!last) return true;
    const lastDay = new Date(parseInt(last, 10)).toLocaleDateString('en-CA');
    const today   = new Date().toLocaleDateString('en-CA');
    return lastDay !== today;
  }

  /** Records that the action was rewarded today. */
  private markPointsEarned(actionKey: string): void {
    const key = `pts_daily_${this.user?.id}_${actionKey}`;
    localStorage.setItem(key, Date.now().toString());
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

  getLevelForPoints(pts: number): number {
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

  get myCoaches(): User[] {
    const acceptedCoachIds = this.coachReservations
      .filter(r => r.status === 'CONFIRMED')
      .map(r => r.coachId);
    return this.coaches.filter(c => acceptedCoachIds.includes(c.id));
  }

  get filteredPrograms(): Program[] {
    if (!this.programFilter) return this.programs;
    return this.programs.filter(p => p.type === this.programFilter);
  }

  get totalPoints(): number { return this.user?.pointsFidelite || 0; }
  get rankedMembers(): User[] {
    return [...this.allMembers].sort((a, b) => (b.pointsFidelite || 0) - (a.pointsFidelite || 0));
  }
  get totalWorkouts(): number { return this.workouts.length; }
  get totalCalories(): number { return this.workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0); }
  get completedChallengesCount(): number { return this.challenges.filter(c => c.statut === 'TERMINE').length; }
  get confirmedPaiements(): Paiement[] { return this.paiements.filter(p => p.statut === 'CONFIRME'); }

  private get todayStr(): string { return new Date().toISOString().split('T')[0]; }

  get taskAbonnementDone(): boolean {
    return this.inscriptions.some(i => {
      if (!i.dateDemande) return false;
      const d = new Date(i.dateDemande);
      return d.toLocaleDateString('en-CA') === this.todayStr;
    });
  }
  get taskChallengeDone(): boolean {
    return this.challenges.some(c => c.statut === 'TERMINE');
  }
  get taskAvisDone(): boolean {
    return this.avis.some(a => {
      if (!a.date) return false;
      const d = new Date(a.date);
      return d.toLocaleDateString('en-CA') === this.todayStr;
    });
  }

  // Points needed to reach the next level threshold
  get pointsToNextLevel(): number {
    const pts = this.totalPoints;
    const thresholds = [500, 1000, 2000, 3000, 4000, 5000];
    const next = thresholds.find(t => t > pts);
    return next ? next - pts : 0;
  }

  // Progress percentage within the current level band
  get levelProgressPct(): number {
    const pts = this.totalPoints;
    const bands: [number, number][] = [[0,500],[500,1000],[1000,2000],[2000,3000],[3000,4000],[4000,5000]];
    const band = bands.find(([lo, hi]) => pts >= lo && pts < hi);
    if (!band) return 100;
    const [lo, hi] = band;
    return Math.round(((pts - lo) / (hi - lo)) * 100);
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating || 0)).fill(1);
  }

  getEmptyStarArray(rating: number): number[] {
    return Array(5 - Math.floor(rating || 0)).fill(1);
  }

  /** Parse "Monday: 06:00-22:00, Tuesday: 06:00-22:00, ..." into rows */
  parseOpeningHours(raw: string): { day: string; hours: string }[] {
    if (!raw) return [];
    return raw.split(/[,;\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(seg => {
        const colonIdx = seg.indexOf(':');
        if (colonIdx > 0) {
          const day = seg.substring(0, colonIdx).trim();
          const hours = seg.substring(colonIdx + 1).trim();
          if (/\d/.test(hours)) return { day, hours };
        }
        return { day: seg, hours: '' };
      });
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
        this.avis = [saved, ...this.avis]; // pour que taskAvisDone se mette à jour
        this.showAvisForm = false;
        this.submittingAvis = false;
        this.newAvisNote = 5;
        this.newAvisComment = '';
        if (this.canEarnPointsToday('avis')) { this.updatePoints(15); this.markPointsEarned('avis'); }
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
    this.subscriptionDuree = 1;
    this.cardNumber = '';
    this.cardHolder = '';
    this.cardExpiry = '';
    this.cardCvc = '';
    this.cardFlipped = false;
    this.subscriptionPaymentError = '';
    this.subscriptionPaymentSuccess = '';
    this.showInscriptionConfirm = true;
  }

  get subscriptionAmount(): number {
    const base = this.selectedGymForInscription?.monthlyPrice || 50;
    if (this.subscriptionDuree === 1) return Math.round(base);
    if (this.subscriptionDuree === 3) return Math.round(base * 3 * 0.9);
    if (this.subscriptionDuree === 6) return Math.round(base * 6 * 0.8);
    if (this.subscriptionDuree === 12) return Math.round(base * 12 * 0.7);
    return Math.round(base * this.subscriptionDuree);
  }

  get formattedCardDisplay(): string {
    const raw = this.cardNumber.replace(/\s/g, '');
    const padded = raw.padEnd(16, '\u2022');
    return padded.match(/.{1,4}/g)?.join(' ') || '\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022';
  }

  get isSubscriptionFormValid(): boolean {
    return !!(this.cardNumber.replace(/\s/g, '').length === 16 &&
      this.cardHolder.trim().length >= 2 &&
      this.cardExpiry.length === 5 &&
      this.cardCvc.length === 3);
  }

  submitInscription(): void {
    if (!this.selectedGymForInscription?.id || !this.user?.id) return;
    if (this.submittingInscription || !this.isSubscriptionFormValid) return;
    this.submittingInscription = true;
    this.subscriptionPaymentError = '';
    const digits = this.cardNumber.replace(/\s/g, '');
    const paiement: Paiement = {
      clientId: this.user.id!,
      clientName: this.user.name,
      montant: this.subscriptionAmount,
      methode: 'CARTE',
      statut: 'CONFIRME',
      cardLast4: digits.slice(-4),
      cardHolder: this.cardHolder.trim(),
      salleId: this.selectedGymForInscription.id!,
      salleName: this.selectedGymForInscription.name
    };
    this.paiementService.create(paiement).subscribe({
      next: (savedPaiement) => {
        const inscription: Inscription = {
          clientId: this.user!.id!,
          clientName: this.user!.name,
          salleId: this.selectedGymForInscription!.id!,
          salleName: this.selectedGymForInscription!.name,
          statut: 'ACCEPTEE',
          paiementStatut: 'PAYE',
          dureeEnMois: this.subscriptionDuree
        };
        this.inscriptionService.create(inscription).subscribe({
          next: (savedIns) => {
            this.paiements = [savedPaiement, ...this.paiements];
            this.inscriptions = [savedIns, ...this.inscriptions];
            this.subscriptionPaymentSuccess = 'Abonnement activé avec succès !';
            this.submittingInscription = false;
            if (this.canEarnPointsToday('inscription')) { this.updatePoints(50); this.markPointsEarned('inscription'); }
            setTimeout(() => {
              this.showInscriptionConfirm = false;
              this.subscriptionPaymentSuccess = '';
              this.selectedGymForInscription = null;
            }, 2000);
          },
          error: () => {
            this.submittingInscription = false;
            this.subscriptionPaymentError = "Erreur lors de la création de l'abonnement.";
          }
        });
      },
      error: () => {
        this.submittingInscription = false;
        this.subscriptionPaymentError = 'Paiement refusé. Vérifiez vos informations de carte.';
      }
    });
  }

  isSubscribed(gymId?: string): boolean {
    return this.inscriptions.some(i => i.salleId === gymId && i.statut !== 'REFUSEE');
  }

  isProgramBooked(programId?: string): boolean {
    return this.bookings.some(b => b.programId === programId && b.status !== 'CANCELLED');
  }

  getInscriptionStatus(gymId?: string): string {
    const ins = this.inscriptions.find(i => i.salleId === gymId);
    return ins?.statut || '';
  }

  getInscriptionEndDate(ins: Inscription): Date | null {
    if (!ins.dateDemande) return null;
    const start = new Date(ins.dateDemande);
    const duree = ins.dureeEnMois || 1;
    const end = new Date(start);
    end.setMonth(end.getMonth() + duree);
    return end;
  }

  isInscriptionExpired(ins: Inscription): boolean {
    const end = this.getInscriptionEndDate(ins);
    if (!end) return false;
    return end < new Date();
  }

  isInscriptionExpiringSoon(ins: Inscription): boolean {
    const end = this.getInscriptionEndDate(ins);
    if (!end) return false;
    const diff = end.getTime() - Date.now();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000; // within 7 days
  }

  getDaysRemaining(insOrDate: Inscription | string | undefined): number {
    if (!insOrDate) return 0;
    if (typeof insOrDate === 'string') {
      const diff = new Date(insOrDate).getTime() - Date.now();
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    const end = this.getInscriptionEndDate(insOrDate);
    if (!end) return 0;
    return Math.max(0, Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  }

  openRenewModal(ins: Inscription): void {
    this.renewTargetInscription = ins;
    this.renewDuree = 1;
    this.showRenewModal = true;
  }

  closeRenewModal(): void {
    this.showRenewModal = false;
    this.renewTargetInscription = null;
  }

  submitRenew(): void {
    if (!this.renewTargetInscription?.salleId || !this.user?.id || this.submittingRenew) return;
    this.submittingRenew = true;
    const inscription: Inscription = {
      clientId: this.user.id,
      clientName: this.user.name,
      salleId: this.renewTargetInscription.salleId,
      salleName: this.renewTargetInscription.salleName,
      statut: 'EN_ATTENTE',
      dureeEnMois: this.renewDuree
    };
    this.inscriptionService.create(inscription).subscribe({
      next: (saved) => {
        this.inscriptions = [saved, ...this.inscriptions];
        this.submittingRenew = false;
        this.closeRenewModal();
      },
      error: () => { this.submittingRenew = false; }
    });
  }

  // === BOUTIQUE / ECHANGE ===
  openEchange(recompense: Recompense): void {
    this.selectedRecompense = recompense;
    this.showEchangeConfirm = true;
  }

  openAddRecompenseForm(): void {
    this.newRecompenseTitre = '';
    this.newRecompenseDescription = '';
    this.newRecompenseCout = 0;
    this.newRecompensePartenaire = '';
    this.newRecompenseImage = null;
    this.newRecompenseImagePreview = null;
    this.recompenseFormError = '';
    this.showAddRecompenseForm = true;
  }

  onNewRecompenseImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.newRecompenseImage = e.target?.result as string;
        this.newRecompenseImagePreview = this.newRecompenseImage;
      };
      reader.readAsDataURL(file);
    }
  }

  removeNewRecompenseImage(): void {
    this.newRecompenseImage = null;
    this.newRecompenseImagePreview = null;
  }

  saveNewRecompense(): void {
    this.recompenseFormError = '';
    if (!this.newRecompenseTitre.trim()) {
      this.recompenseFormError = 'Le titre est obligatoire.';
      return;
    }
    if (this.newRecompenseCout < 0) {
      this.recompenseFormError = 'Le coût en points doit être positif.';
      return;
    }
    if (this.savingRecompense) return;
    this.savingRecompense = true;
    const payload: Recompense = {
      titre: this.newRecompenseTitre.trim(),
      description: this.newRecompenseDescription,
      coutEnPoints: this.newRecompenseCout,
      partenaireFournisseur: this.newRecompensePartenaire,
      salleIds: [],
      imageBase64: this.newRecompenseImage || undefined
    };
    this.recompenseService.create(payload).subscribe({
      next: (created) => {
        this.recompenses = [created, ...this.recompenses];
        this.showAddRecompenseForm = false;
        this.savingRecompense = false;
      },
      error: () => {
        this.recompenseFormError = 'Erreur lors de la création.';
        this.savingRecompense = false;
      }
    });
  }

  submitEchange(): void {
    if (!this.selectedRecompense?.id || !this.user?.id) return;
    if ((this.user.pointsFidelite || 0) < this.selectedRecompense.coutEnPoints) return;
    if (this.submittingEchange) return;
    this.submittingEchange = true;
    const cost = this.selectedRecompense.coutEnPoints;
    const echange: Echange = {
      clientId: this.user.id,
      clientName: this.user.name,
      recompenseId: this.selectedRecompense.id,
      recompenseTitre: this.selectedRecompense.titre
    };
    this.echangeService.create(echange).subscribe({
      next: (saved) => {
        this.echanges = [saved, ...this.echanges];
        this.updatePoints(-cost); // déduire les points dépensés
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

    const today = new Date().toISOString().split('T')[0];

    // Prevent duplicate: same program already booked (not cancelled)
    const duplicate = this.bookings.some(b =>
      b.programId === this.selectedProgram!.id &&
      b.status !== 'CANCELLED'
    );
    if (duplicate) {
      this.bookingError = 'Vous avez déjà une réservation pour ce programme.';
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
      date: today,
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
    return ''; // replaced by SVG icons in template
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      STRENGTH: 'Musculation', CARDIO: 'Cardio', YOGA: 'Yoga',
      HIIT: 'HIIT', CROSSFIT: 'CrossFit', BOXING: 'Boxe',
      SWIMMING: 'Natation', MARTIAL_ARTS: 'Arts martiaux', FLEXIBILITY: 'Souplesse', MIXED: 'Mixte'
    };
    return labels[type] || type;
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
    this.showCoachRatingForm = false;
    this.coachRatingError = '';
    this.selectedCoachAvis = [];
    if (coach.id) {
      this.avisService.getByCoach(coach.id).subscribe({
        next: (a) => { this.selectedCoachAvis = a; this.cdr.detectChanges(); },
        error: () => {}
      });
    }
  }

  get myAvisForCoach(): Avis | null {
    return this.selectedCoachAvis.find(a => a.clientId === this.user?.id) || null;
  }

  submitCoachRating(): void {
    if (!this.selectedCoach?.id || !this.user?.id || this.submittingCoachRating) return;
    this.submittingCoachRating = true;
    this.coachRatingError = '';
    const avis: Avis = {
      clientId: this.user.id,
      clientName: this.user.name,
      note: this.coachRatingNote,
      commentaire: this.coachRatingComment,
      coachId: this.selectedCoach.id
    };
    this.avisService.create(avis).subscribe({
      next: (saved) => {
        this.selectedCoachAvis = [saved, ...this.selectedCoachAvis];
        // Update coach rating displayed immediately
        if (this.selectedCoach) {
          const avg = this.selectedCoachAvis.reduce((s, a) => s + (a.note || 0), 0) / this.selectedCoachAvis.length;
          this.selectedCoach = { ...this.selectedCoach, rating: Math.round(avg * 10) / 10 };
          // also refresh in coachesList
          const idx = this.coaches.findIndex(c => c.id === this.selectedCoach!.id);
          if (idx >= 0) this.coaches[idx] = { ...this.coaches[idx], rating: this.selectedCoach.rating };
        }
        this.showCoachRatingForm = false;
        this.submittingCoachRating = false;
        this.coachRatingNote = 5;
        this.coachRatingComment = '';
      },
      error: (err) => {
        this.coachRatingError = err?.error?.message || 'Erreur lors de la publication.';
        this.submittingCoachRating = false;
      }
    });
  }

  deleteCoachAvis(avisId: string): void {
    this.avisService.delete(avisId).subscribe({
      next: () => {
        this.selectedCoachAvis = this.selectedCoachAvis.filter(a => a.id !== avisId);
        if (this.selectedCoach && this.selectedCoachAvis.length > 0) {
          const avg = this.selectedCoachAvis.reduce((s, a) => s + (a.note || 0), 0) / this.selectedCoachAvis.length;
          this.selectedCoach = { ...this.selectedCoach, rating: Math.round(avg * 10) / 10 };
        } else if (this.selectedCoach) {
          this.selectedCoach = { ...this.selectedCoach, rating: undefined };
        }
      },
      error: () => {}
    });
  }

  isCoachReserved(coach: User): boolean {
    return this.coachReservations.some(b => b.coachId === coach.id && b.status !== 'CANCELLED');
  }

  reserveCoach(coach: User): void {
    if (!this.user?.id || !coach.id || this.isCoachReserved(coach)) return;
    const booking: Booking = {
      memberId: this.user.id,
      memberName: this.user.name,
      programId: 'COACH_RESERVATION',
      coachId: coach.id,
      coachName: coach.name,
      type: 'COACH_RESERVATION',
      status: 'PENDING',
      notes: `Demande de réservation du coach ${coach.name}`
    };
    this.bookingService.create(booking).subscribe({
      next: (b) => {
        this.coachReservations.push(b);
        this.bookings.push(b);
      }
    });
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

  private startCoachPoll(): void {
    this.stopCoachPoll();
    if (!this.user?.id) return;
    this.coachPollInterval = setInterval(() => {
      this.bookingService.getByMember(this.user!.id!).subscribe({
        next: b => {
          this.bookings = b;
          this.coachReservations = b.filter(bk => bk.type === 'COACH_RESERVATION');
        }, error: () => {}
      });
    }, 15000);
  }

  private stopCoachPoll(): void {
    if (this.coachPollInterval !== null) {
      clearInterval(this.coachPollInterval);
      this.coachPollInterval = null;
    }
  }

  getCoachReservationStatus(coach: User): string | null {
    const res = this.coachReservations.find(b => b.coachId === coach.id && b.status !== 'CANCELLED');
    return res ? (res.status ?? null) : null;
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
    this.stopCoachPoll();
    if (this.profileMap) { this.profileMap.remove(); this.profileMap = null; }
    if (this.sallesMap) { this.sallesMap.remove(); this.sallesMap = null; }
    if (this.openGymHandler) {
      document.removeEventListener('openGym', this.openGymHandler);
      this.openGymHandler = null;
    }
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
    if (!this.challengeTitre.trim() || !this.user?.id) {
      this.challengeError = 'Le titre du challenge est requis.';
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
    const wasComplete = challenge.etapes[stepIdx].complete;
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
    challenge.etapes.forEach(step => {
      step.complete = true;
      step.exercices.forEach(e => e.done = true);
    });
    this.challengeService.update(challenge.id!, challenge).subscribe({
      next: () => { if (this.canEarnPointsToday('challenge')) { this.updatePoints(100); this.markPointsEarned('challenge'); } },
      error: () => {}
    });
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
    if (challenge.statut === 'TERMINE') return 100;
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // === PROFILE EDIT ===
  openProfileEdit(): void {
    this.showProfileEdit = true;
    this.profileName = this.user?.name || '';
    this.profilePhone = this.user?.phone || '';
    this.profileCity = this.user?.city || '';
    this.profileAddress = this.user?.address || '';
    this.profileBio = this.user?.bio || '';
    this.profileLat = this.user?.latitude || null;
    this.profileLng = this.user?.longitude || null;
    this.profileError = '';
    this.profileSuccess = '';
    if (this.profileMap) { this.profileMap.remove(); this.profileMap = null; }
    this.profileMapInitialized = false;
    this.needsProfileMapInit = false;
    // Wait for modal DOM to render, then init map
    setTimeout(() => {
      this.needsProfileMapInit = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        const container = document.getElementById('profile-map');
        if (container && !this.profileMapInitialized) {
          this.initProfileMap();
        }
      }, 100);
    }, 50);
  }

  closeProfileEdit(): void {
    this.showProfileEdit = false;
    if (this.profileMap) { this.profileMap.remove(); this.profileMap = null; this.profileMapInitialized = false; }
  }

  private initProfileMap(): void {
    if (this.profileMapInitialized) return;
    const lat = this.profileLat || 36.8065;
    const lng = this.profileLng || 10.1815;

    const iconDefault = L.icon({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    this.profileMap = L.map('profile-map', { center: [lat, lng], zoom: 13 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.profileMap);

    this.profileMarker = L.marker([lat, lng], { icon: iconDefault, draggable: true }).addTo(this.profileMap);

    this.profileMap.on('click', (e: L.LeafletMouseEvent) => {
      this.ngZone.run(() => {
        this.profileLat = parseFloat(e.latlng.lat.toFixed(6));
        this.profileLng = parseFloat(e.latlng.lng.toFixed(6));
        this.profileMarker?.setLatLng(e.latlng);
        this.reverseGeocodeProfile(this.profileLat, this.profileLng);
        this.cdr.detectChanges();
      });
    });

    this.profileMarker.on('dragend', () => {
      this.ngZone.run(() => {
        const pos = this.profileMarker!.getLatLng();
        this.profileLat = parseFloat(pos.lat.toFixed(6));
        this.profileLng = parseFloat(pos.lng.toFixed(6));
        this.reverseGeocodeProfile(this.profileLat, this.profileLng);
        this.cdr.detectChanges();
      });
    });

    this.profileMapInitialized = true;
    setTimeout(() => {
      this.profileMap?.invalidateSize();
    }, 300);
  }

  searchProfileAddress(): void {
    const query = this.profileAddress || this.profileCity;
    if (!query) return;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`)
      .then(r => r.json())
      .then(results => {
        this.ngZone.run(() => {
          if (results.length > 0) {
            const { lat, lon } = results[0];
            this.profileLat = parseFloat(parseFloat(lat).toFixed(6));
            this.profileLng = parseFloat(parseFloat(lon).toFixed(6));
            const latlng = L.latLng(this.profileLat, this.profileLng);
            this.profileMarker?.setLatLng(latlng);
            this.profileMap?.setView(latlng, 15);
            this.reverseGeocodeProfile(this.profileLat, this.profileLng);
            this.cdr.detectChanges();
          }
        });
      })
      .catch(() => {});
  }

  private reverseGeocodeProfile(lat: number, lng: number): void {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(r => r.json())
      .then(result => {
        this.ngZone.run(() => {
          if (result.address) {
            const a = result.address;
            this.profileAddress = result.display_name?.split(',').slice(0, 3).join(',').trim() || this.profileAddress;
            this.profileCity = a.city || a.town || a.village || a.state || this.profileCity;
            this.cdr.detectChanges();
          }
        });
      })
      .catch(() => {});
  }

  saveProfile(): void {
    if (!this.user?.id) return;
    this.savingProfile = true;
    this.profileError = '';
    this.profileSuccess = '';

    const updates: Partial<User> = {
      name: this.profileName,
      phone: this.profilePhone,
      city: this.profileCity,
      address: this.profileAddress,
      bio: this.profileBio,
      latitude: this.profileLat ?? undefined,
      longitude: this.profileLng ?? undefined
    };

    this.userService.update(this.user.id, updates).subscribe({
      next: (updated) => {
        this.savingProfile = false;
        this.profileSuccess = 'Profil mis à jour avec succès !';
        // Update local user
        if (this.user) {
          this.user.name = updated.name;
          this.user.phone = updated.phone;
          this.user.city = updated.city;
          this.user.address = updated.address;
          this.user.bio = updated.bio;
          this.user.latitude = updated.latitude;
          this.user.longitude = updated.longitude;
        }
        this.authService.updateStoredUser(this.user!);
        // Refresh salles map if address was added
        if (updated.latitude && updated.longitude) {
          this.sallesMapInitialized = false;
          if (this.sallesMap) { this.sallesMap.remove(); this.sallesMap = null; }
          this.needsSallesMapInit = true;
        }
        // Close modal after short delay so user sees success message
        setTimeout(() => {
          this.closeProfileEdit();
          this.cdr.detectChanges();
        }, 800);
        this.cdr.detectChanges();
      },
      error: () => {
        this.savingProfile = false;
        this.profileError = 'Erreur lors de la mise à jour du profil.';
      }
    });
  }

  // === SALLES MAP ===
  private initSallesMap(): void {
    if (this.sallesMapInitialized) return;
    const userLat = this.user?.latitude || 36.8065;
    const userLng = this.user?.longitude || 10.1815;

    // User (blue) icon
    const iconDefault = L.icon({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [30, 46], iconAnchor: [15, 46], popupAnchor: [1, -40], shadowSize: [41, 41]
    });

    // Gym (red) icon
    const gymIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    this.sallesMap = L.map('salles-map', {
      center: [userLat, userLng],
      zoom: 12,
      zoomControl: true
    });

    // Tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.sallesMap);

    // User position marker
    if (this.user?.latitude && this.user?.longitude) {
      this.userLocMarker = L.marker([this.user.latitude, this.user.longitude], { icon: iconDefault })
        .addTo(this.sallesMap)
        .bindPopup(`<div style="font-family:sans-serif;min-width:140px"><b style="color:#1d4ed8">📍 Ma position</b><br><span style="color:#64748b;font-size:12px">${this.user.address || this.user.name}</span></div>`);
    }

    // Gym markers with click → open gym detail
    const bounds: L.LatLngExpression[] = [];
    if (this.user?.latitude && this.user?.longitude) {
      bounds.push([this.user.latitude, this.user.longitude]);
    }

    for (const gym of this.gyms) {
      if (gym.latitude && gym.longitude) {
        const popupHtml = `
          <div style="font-family:sans-serif;min-width:180px;max-width:220px">
            <b style="font-size:14px;color:#0f172a">${gym.name}</b>
            <div style="color:#64748b;font-size:12px;margin:4px 0">${gym.address || gym.city || ''}</div>
            ${gym.monthlyPrice ? `<div style="color:#d4a017;font-weight:700;font-size:13px">💰 ${gym.monthlyPrice} DT/mois</div>` : ''}
            ${gym.rating ? `<div style="color:#f59e0b;font-size:12px">⭐ ${gym.rating}/5</div>` : ''}
            <button onclick="document.dispatchEvent(new CustomEvent('openGym', {detail:'${gym.id}'}))" style="margin-top:8px;width:100%;padding:6px;background:#0f172a;color:#d4a017;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer">Voir les détails →</button>
          </div>`;
        L.marker([gym.latitude, gym.longitude], { icon: gymIcon })
          .addTo(this.sallesMap!)
          .bindPopup(popupHtml, { maxWidth: 240 });
        bounds.push([gym.latitude, gym.longitude]);
      }
    }

    // Listen for gym detail open events from popup buttons (stored to allow removal)
    this.openGymHandler = (e: Event) => {
      const gymId = (e as CustomEvent).detail;
      const gym = this.gyms.find(g => g.id === gymId);
      if (gym) this.ngZone.run(() => this.openGymDetail(gym));
    };
    document.addEventListener('openGym', this.openGymHandler);

    if (bounds.length > 1) {
      this.sallesMap.fitBounds(L.latLngBounds(bounds as L.LatLngTuple[]).pad(0.15));
    }

    this.sallesMapInitialized = true;
    setTimeout(() => this.sallesMap?.invalidateSize(), 400);
  }
}
