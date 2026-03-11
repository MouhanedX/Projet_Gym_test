import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProgramService } from '../../services/program.service';
import { BookingService } from '../../services/booking.service';
import { ConversationService } from '../../services/conversation.service';
import { GymService } from '../../services/gym.service';
import { CoachGymRequestService } from '../../services/coach-gym-request.service';
import { AvisService } from '../../services/avis.service';
import { User } from '../../models/user';
import { Program } from '../../models/program';
import { Booking } from '../../models/booking';
import { Conversation } from '../../models/conversation';
import { Message } from '../../models/message';
import { Gym } from '../../models/gym';
import { CoachGymRequest } from '../../models/coach-gym-request';
import { Avis } from '../../models/avis';

@Component({
  selector: 'app-coach-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coach-dashboard.html',
  styleUrl: './coach-dashboard.css'
})
export class CoachDashboard implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatContainer') chatContainer?: ElementRef;
  @ViewChild('replyInput') replyInput?: ElementRef;

  user: User | null = null;
  activeTab = 'overview';
  programs: Program[] = [];
  bookings: Booking[] = [];
  loading = true;
  darkMode = false;

  // Conversations / messaging
  coachConversations: Conversation[] = [];
  loadingConversations = false;
  activeConv: Conversation | null = null;
  convMessages: Message[] = [];
  loadingMessages = false;
  replyText = '';
  sendingReply = false;
  private shouldScrollChat = false;
  private shouldFocusInput = false;
  private chatPollInterval: ReturnType<typeof setInterval> | null = null;

  tabs = [
    { key: 'overview', label: 'Dashboard', icon: '📊' },
    { key: 'demandes', label: 'Demandes', icon: '📩' },
    { key: 'programs', label: 'Programmes', icon: '🎯' },
    { key: 'schedule', label: 'Planning', icon: '📅' },
    { key: 'clients', label: 'Clients', icon: '👥' },
    { key: 'salles', label: 'Salles', icon: '🏢' },
    { key: 'profile', label: 'Profil', icon: '⚙️' }
  ];

  // Profile form
  editingProfile = false;
  profileName = '';
  profilePhone = '';
  profileBio = '';
  profileCity = '';
  profileSpecialties = '';
  profileExperience = 0;

  // Coach reservations
  coachReservations: Booking[] = [];

  // Salles
  allGyms: Gym[] = [];
  gymSearch = '';
  myGymRequests: CoachGymRequest[] = [];
  showRequestModal = false;
  selectedGymForRequest: Gym | null = null;
  requestMessage = '';
  submittingRequest = false;
  requestError = '';
  requestSuccess = '';

  // Avis reçus
  myAvis: Avis[] = [];

  constructor(
    private authService: AuthService,
    private programService: ProgramService,
    private bookingService: BookingService,
    private conversationService: ConversationService,
    private gymService: GymService,
    private coachGymRequestService: CoachGymRequestService,
    private avisService: AvisService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.stopChatPolling();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollChat) {
      this.scrollChatToBottom();
      this.shouldScrollChat = false;
    }
    if (this.shouldFocusInput) {
      this.replyInput?.nativeElement?.focus();
      this.shouldFocusInput = false;
    }
  }

  loadData(): void {
    this.loading = true;
    if (this.user?.id) {
      this.programService.getByCoach(this.user.id).subscribe({
        next: (p) => { this.programs = p; this.loading = false; },
        error: () => { this.loading = false; }
      });
      this.bookingService.getByCoach(this.user.id).subscribe({
        next: (b) => this.bookings = b
      });
      this.bookingService.getCoachReservations(this.user.id).subscribe({
        next: (r) => this.coachReservations = r
      });
      this.coachGymRequestService.getByCoach(this.user.id).subscribe({
        next: (r) => this.myGymRequests = r,
        error: () => {}
      });
      this.avisService.getByCoach(this.user.id).subscribe({
        next: (a) => this.myAvis = a,
        error: () => {}
      });
      this.loadConversations();
    }
    this.gymService.list().subscribe({ next: (g) => this.allGyms = g, error: () => {} });
  }

  // === AVIS / RATING ===
  get averageRating(): number | null {
    if (!this.myAvis.length) return null;
    const avg = this.myAvis.reduce((s, a) => s + (a.note || 0), 0) / this.myAvis.length;
    return Math.round(avg * 10) / 10;
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating || 0)).fill(1);
  }

  getEmptyStarArray(rating: number): number[] {
    return Array(5 - Math.floor(rating || 0)).fill(1);
  }

  formatAvisDate(dateStr?: string): string {
    if (!dateStr) return '';
    try { return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return dateStr; }
  }

  // === SALLES / POSTULATION ===
  get filteredGyms(): Gym[] {
    if (!this.gymSearch) return this.allGyms;
    const q = this.gymSearch.toLowerCase();
    return this.allGyms.filter(g =>
      g.name.toLowerCase().includes(q) || g.city?.toLowerCase().includes(q)
    );
  }

  getRequestStatus(gymId: string): string | null {
    const req = this.myGymRequests.find(r => r.gymId === gymId);
    return req ? (req.statut || 'EN_ATTENTE') : null;
  }

  openRequestModal(gym: Gym): void {
    this.selectedGymForRequest = gym;
    this.requestMessage = '';
    this.requestError = '';
    this.requestSuccess = '';
    this.showRequestModal = true;
  }

  closeRequestModal(): void {
    this.showRequestModal = false;
    this.selectedGymForRequest = null;
  }

  submitRequest(): void {
    if (!this.user?.id || !this.selectedGymForRequest) return;
    this.submittingRequest = true;
    this.requestError = '';
    const payload: CoachGymRequest = {
      coachId: this.user.id,
      coachName: this.user.name,
      gymId: this.selectedGymForRequest.id!,
      gymName: this.selectedGymForRequest.name,
      ownerId: this.selectedGymForRequest.ownerId || '',
      message: this.requestMessage
    };
    this.coachGymRequestService.create(payload).subscribe({
      next: (r) => {
        // Replace any existing request for same gym (covers re-apply after rejection)
        this.myGymRequests = [...this.myGymRequests.filter(x => x.gymId !== r.gymId), r];
        this.submittingRequest = false;
        this.showRequestModal = false;
        this.selectedGymForRequest = null;
      },
      error: (err) => {
        this.requestError = err?.error?.error || 'Erreur lors de l\'envoi de la demande.';
        this.submittingRequest = false;
      }
    });
  }

  cancelRequest(requestId: string): void {
    this.coachGymRequestService.delete(requestId).subscribe({
      next: () => {
        this.myGymRequests = this.myGymRequests.filter(r => r.id !== requestId);
      },
      error: () => {}
    });
  }

  // === CONVERSATIONS ===
  loadConversations(): void {
    if (!this.user?.id) return;
    this.loadingConversations = true;
    this.conversationService.getByUser(this.user.id).subscribe({
      next: (convs) => {
        this.coachConversations = convs;
        this.loadingConversations = false;
      },
      error: () => { this.loadingConversations = false; }
    });
  }

  getMemberOfConv(conv: Conversation): string {
    if (!this.user?.id || !conv.participantIds) return 'Inconnu';
    const idx = conv.participantIds.findIndex(id => id !== this.user!.id);
    if (idx >= 0 && conv.participantNames && conv.participantNames[idx]) {
      return conv.participantNames[idx];
    }
    return 'Membre';
  }

  getMemberIdOfConv(conv: Conversation): string {
    if (!this.user?.id || !conv.participantIds) return '';
    return conv.participantIds.find(id => id !== this.user!.id) || '';
  }

  openConv(conv: Conversation): void {
    if (this.activeConv?.id === conv.id) { this.closeConv(); return; }
    this.stopChatPolling();
    this.activeConv = conv;
    this.convMessages = [];
    this.loadingMessages = true;
    this.shouldFocusInput = true;
    if (conv.id) {
      this.conversationService.getMessages(conv.id).subscribe({
        next: (msgs) => {
          this.convMessages = msgs;
          this.loadingMessages = false;
          this.shouldScrollChat = true;
        },
        error: () => { this.loadingMessages = false; }
      });
      this.startChatPolling(conv.id);
    }
  }

  closeConv(): void {
    this.stopChatPolling();
    this.activeConv = null;
    this.convMessages = [];
    this.replyText = '';
  }

  private startChatPolling(conversationId: string): void {
    this.chatPollInterval = setInterval(() => {
      this.conversationService.getMessages(conversationId).subscribe({
        next: (msgs) => {
          if (msgs.length !== this.convMessages.length) {
            this.convMessages = msgs;
            this.shouldScrollChat = true;
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

  sendReply(): void {
    if (!this.replyText.trim() || !this.activeConv?.id || !this.user?.id) return;
    this.sendingReply = true;
    const msg: Message = {
      conversationId: this.activeConv.id,
      senderId: this.user.id,
      senderName: this.user.name,
      contenu: this.replyText.trim()
    };
    this.conversationService.sendMessage(this.activeConv.id, msg).subscribe({
      next: (sent) => {
        this.convMessages.push(sent);
        this.replyText = '';
        this.sendingReply = false;
        this.shouldScrollChat = true;
      },
      error: () => { this.sendingReply = false; }
    });
  }

  private scrollChatToBottom(): void {
    if (this.chatContainer?.nativeElement) {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    }
  }

  formatTime(dateStr?: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  isCoachMsg(msg: Message): boolean {
    return msg.senderId === this.user?.id;
  }

  hasConversation(clientName: string): boolean {
    return this.coachConversations.some(conv => this.getMemberOfConv(conv) === clientName);
  }

  setTab(tab: string): void { this.activeTab = tab; }

  toggleDark(): void {
    this.darkMode = !this.darkMode;
    document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
  }

  // === COMPUTED ===
  get totalClients(): number { return this.programs.reduce((sum, p) => sum + (p.enrolledCount || 0), 0); }
  get activePrograms(): Program[] { return this.programs.filter(p => p.isActive !== false); }
  get upcomingBookings(): Booking[] { return this.bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING'); }
  get uniqueClients(): string[] {
    const names = new Set<string>();
    // From program bookings
    this.bookings.map(b => b.memberName).filter(Boolean).forEach(n => names.add(n!));
    // From accepted coach reservations
    this.coachReservations.filter(r => r.status === 'CONFIRMED').map(r => r.memberName).filter(Boolean).forEach(n => names.add(n!));
    return Array.from(names);
  }

  get pendingReservations(): Booking[] {
    return this.coachReservations.filter(r => r.status === 'PENDING');
  }

  get acceptedReservations(): Booking[] {
    return this.coachReservations.filter(r => r.status === 'CONFIRMED');
  }

  acceptReservation(reservation: Booking): void {
    if (!reservation.id) return;
    this.bookingService.updateStatus(reservation.id, 'CONFIRMED').subscribe({
      next: (updated) => {
        const idx = this.coachReservations.findIndex(r => r.id === updated.id);
        if (idx >= 0) this.coachReservations[idx] = updated;
      }
    });
  }

  rejectReservation(reservation: Booking): void {
    if (!reservation.id) return;
    this.bookingService.updateStatus(reservation.id, 'CANCELLED').subscribe({
      next: (updated) => {
        const idx = this.coachReservations.findIndex(r => r.id === updated.id);
        if (idx >= 0) this.coachReservations[idx] = updated;
      }
    });
  }

  getTypeIcon(type?: string): string {
    const icons: Record<string, string> = { STRENGTH: '🏋️', CARDIO: '🏃', YOGA: '🧘', HIIT: '⚡', CROSSFIT: '💥', BOXING: '🥊', SWIMMING: '🏊', MARTIAL_ARTS: '🥋' };
    return icons[type || ''] || '💪';
  }

  getDifficultyColor(d?: string): string {
    if (d === 'BEGINNER') return '#10b981';
    if (d === 'INTERMEDIATE') return '#f59e0b';
    return '#ef4444';
  }

  getStatusColor(s?: string): string {
    if (s === 'CONFIRMED' || s === 'COMPLETED') return '#10b981';
    if (s === 'PENDING') return '#f59e0b';
    return '#ef4444';
  }

  // === SCHEDULE ===
  get scheduleByDay(): { day: string; programs: Program[] }[] {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => ({
      day,
      programs: this.programs.filter(p => p.daysOfWeek?.includes(day))
    })).filter(d => d.programs.length > 0);
  }

  // === PROFILE ===
  startEditProfile(): void {
    this.profileName = this.user?.name || '';
    this.profilePhone = this.user?.phone || '';
    this.profileBio = this.user?.bio || '';
    this.profileCity = this.user?.city || '';
    this.profileSpecialties = (this.user?.specialties || []).join(', ');
    this.profileExperience = this.user?.experienceYears || 0;
    this.editingProfile = true;
  }

  saveProfile(): void {
    if (this.user?.id) {
      const updated = {
        ...this.user,
        name: this.profileName,
        phone: this.profilePhone,
        bio: this.profileBio,
        city: this.profileCity,
        specialties: this.profileSpecialties.split(',').map(s => s.trim()).filter(s => s),
        experienceYears: this.profileExperience
      };
      this.authService.updateProfile(this.user.id, updated).subscribe({
        next: (u) => { this.user = u; this.editingProfile = false; }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
