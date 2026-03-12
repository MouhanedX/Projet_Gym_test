import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
  expandedGymForRequest: string | null = null;
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
    private router: Router,
    private sanitizer: DomSanitizer
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
        next: (p) => { this.programs = p; },
        error: () => {}
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
    this.loading = false;
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
    if (this.expandedGymForRequest === gym.id) {
      this.expandedGymForRequest = null;
      this.selectedGymForRequest = null;
      return;
    }
    this.selectedGymForRequest = gym;
    this.expandedGymForRequest = gym.id!;
    this.requestMessage = '';
    this.requestError = '';
    this.requestSuccess = '';
    this.showRequestModal = false;
  }

  closeRequestModal(): void {
    this.showRequestModal = false;
    this.expandedGymForRequest = null;
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
        this.expandedGymForRequest = null;
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

  getTypeSvg(type?: string): SafeHtml {
    const svgs: Record<string, string> = {
      CARDIO: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
      STRENGTH: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="5" x2="6" y2="19"/><line x1="18" y1="5" x2="18" y2="19"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="15" x2="15" y2="15"/><line x1="2" y1="9" x2="6" y2="9"/><line x1="18" y1="9" x2="22" y2="9"/><line x1="2" y1="15" x2="6" y2="15"/><line x1="18" y1="15" x2="22" y2="15"/></svg>`,
      YOGA: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5"/><path d="M8 9.5A4 4 0 0 1 8 6a4 4 0 0 1 4-4"/><path d="M6 22c0-4 2-6 6-6s6 2 6 6"/><path d="M12 16v-5"/></svg>`,
      HIIT: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      CROSSFIT: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="9" width="4" height="6" rx="1"/><rect x="18" y="9" width="4" height="6" rx="1"/><line x1="6" y1="12" x2="18" y2="12"/><rect x="9" y="7" width="6" height="10" rx="1"/></svg>`,
      BOXING: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
      SWIMMING: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11s2.5 2 5 2 2.5-2 5-2 2.5 2 3 2.5"/><path d="M2 17c.6.5 1.2 1 2.5 1C7 18 7 16 9.5 16s2.5 2 5 2 2.5-2 5-2 2.5 2 3 2.5"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4l3 2"/></svg>`,
      MARTIAL_ARTS: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M12 6v5l-3 3"/><path d="M15 14l-3-3"/><path d="M7 22l2-5"/><path d="M17 22l-2-5"/><path d="M9 17h6"/></svg>`
    };
    const defaultSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/><path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"/><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/><path d="M19 13H5v-2h14v2z"/></svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svgs[type || ''] || defaultSvg);
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
