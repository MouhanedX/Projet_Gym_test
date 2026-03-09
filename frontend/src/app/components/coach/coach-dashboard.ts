import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProgramService } from '../../services/program.service';
import { BookingService } from '../../services/booking.service';
import { ConversationService } from '../../services/conversation.service';
import { User } from '../../models/user';
import { Program } from '../../models/program';
import { Booking } from '../../models/booking';
import { Conversation } from '../../models/conversation';
import { Message } from '../../models/message';

@Component({
  selector: 'app-coach-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './coach-dashboard.html',
  styleUrl: './coach-dashboard.css'
})
export class CoachDashboard implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') chatContainer?: ElementRef;

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

  tabs = [
    { key: 'overview', label: 'Dashboard', icon: '📊' },
    { key: 'programs', label: 'Programmes', icon: '🎯' },
    { key: 'schedule', label: 'Planning', icon: '📅' },
    { key: 'clients', label: 'Clients', icon: '👥' },
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

  constructor(
    private authService: AuthService,
    private programService: ProgramService,
    private bookingService: BookingService,
    private conversationService: ConversationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadData();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollChat) {
      this.scrollChatToBottom();
      this.shouldScrollChat = false;
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
      this.loadConversations();
    }
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
    if (this.activeConv?.id === conv.id) { this.activeConv = null; this.convMessages = []; return; }
    this.activeConv = conv;
    this.convMessages = [];
    this.loadingMessages = true;
    if (conv.id) {
      this.conversationService.getMessages(conv.id).subscribe({
        next: (msgs) => {
          this.convMessages = msgs;
          this.loadingMessages = false;
          this.shouldScrollChat = true;
        },
        error: () => { this.loadingMessages = false; }
      });
    }
  }

  closeConv(): void {
    this.activeConv = null;
    this.convMessages = [];
    this.replyText = '';
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
    const names = new Set(this.bookings.map(b => b.memberName).filter(Boolean));
    return Array.from(names) as string[];
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
